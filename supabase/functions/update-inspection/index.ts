import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`[UPDATE][${requestId}] === Update Inspection Request Started ===`);

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log(`[UPDATE][${requestId}] Auth failed:`, authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[UPDATE][${requestId}] User authenticated:`, user.id);

    const { inspection_id, updates } = await req.json();

    console.log(`[UPDATE][${requestId}] inspection_id:`, inspection_id);
    console.log(`[UPDATE][${requestId}] updates keys:`, updates ? Object.keys(updates) : 'null');
    
    // Log specific data sizes for debugging
    if (updates) {
      console.log(`[UPDATE][${requestId}] updates details:`, {
        checklist_ratings_count: updates.checklist_ratings ? Object.keys(updates.checklist_ratings).length : 0,
        checklist_notes_count: updates.checklist_notes ? Object.keys(updates.checklist_notes).length : 0,
        checklist_data_count: updates.checklist_data ? Object.keys(updates.checklist_data).length : 0,
        selected_defects_count: updates.selected_defects ? Object.keys(updates.selected_defects).length : 0,
      });
    }

    if (!inspection_id) {
      console.log(`[UPDATE][${requestId}] Validation failed: missing inspection_id`);
      return new Response(JSON.stringify({ error: 'Inspection ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch existing inspection to verify ownership
    console.log(`[UPDATE][${requestId}] Fetching existing inspection...`);
    const { data: existing, error: fetchError } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', inspection_id)
      .single();

    if (fetchError || !existing) {
      console.log(`[UPDATE][${requestId}] Inspection not found:`, fetchError?.message);
      return new Response(JSON.stringify({ error: 'Inspection not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[UPDATE][${requestId}] Existing inspection state:`, {
      id: existing.id,
      status: existing.status,
      inspector_id: existing.inspector_id,
      checklist_ratings_count: existing.checklist_ratings ? Object.keys(existing.checklist_ratings as object).length : 0,
      checklist_data_count: existing.checklist_data ? Object.keys(existing.checklist_data as object).length : 0,
    });

    if (existing.inspector_id !== user.id) {
      console.log(`[UPDATE][${requestId}] Authorization failed: user ${user.id} does not own inspection ${existing.inspector_id}`);
      return new Response(JSON.stringify({ error: 'Unauthorized to update this inspection' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Perform the update
    console.log(`[UPDATE][${requestId}] Performing update...`);
    const { data: inspection, error, count } = await supabase
      .from('inspections')
      .update(updates)
      .eq('id', inspection_id)
      .select()
      .single();

    if (error) {
      console.error(`[UPDATE][${requestId}] Update error:`, error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!inspection) {
      console.error(`[UPDATE][${requestId}] Update returned null - no row affected`);
      return new Response(JSON.stringify({ error: 'Update failed - no row returned' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[UPDATE][${requestId}] Update successful - new state:`, {
      id: inspection.id,
      status: inspection.status,
      updated_at: inspection.updated_at,
      checklist_ratings_count: inspection.checklist_ratings ? Object.keys(inspection.checklist_ratings as object).length : 0,
      checklist_data_count: inspection.checklist_data ? Object.keys(inspection.checklist_data as object).length : 0,
    });

    // Sync checklist_ratings to checklist_items table for grade calculation
    if (updates.checklist_ratings && typeof updates.checklist_ratings === 'object') {
      console.log(`[UPDATE][${requestId}] Syncing checklist_ratings to checklist_items table...`);
      
      const ratingsObj = updates.checklist_ratings as Record<string, string>;
      const notesObj = (updates.checklist_notes || {}) as Record<string, string>;
      const defectsObj = (updates.selected_defects || {}) as Record<string, boolean>;
      
      const validRatings = ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'];
      
      for (const [itemKey, rating] of Object.entries(ratingsObj)) {
        // Parse the item key to extract category/item info
        // Keys can be in formats like:
        // - "range-rating", "exhaust-rating" (simple format)
        // - "category|subcategory|itemName" (pipe-separated)
        // - "roof-flashing-condition" (compound name)
        
        let category = 'General';
        let subcategory: string | null = null;
        let itemName = itemKey;
        
        if (itemKey.includes('|')) {
          // Pipe-separated format: "category|subcategory|itemName" or "category|itemName"
          const parts = itemKey.split('|');
          category = parts[0] || 'General';
          subcategory = parts.length > 2 ? parts[1] : null;
          itemName = parts[parts.length - 1] || itemKey;
        } else {
          // Dash-separated format: "range-rating", "roof-inspector-rating", etc.
          // Extract category from the key pattern
          if (itemKey.includes('-inspector-')) {
            // Keys like "foundation-inspector-rating" -> category: Foundation
            const match = itemKey.match(/^(.+)-inspector-/);
            if (match) {
              category = match[1].charAt(0).toUpperCase() + match[1].slice(1).replace(/-/g, ' ');
              itemName = itemKey.replace(/-/g, ' ');
            }
          } else if (itemKey.endsWith('-rating')) {
            // Keys like "range-rating", "hvac-cooling-rating" -> extract component name
            const baseName = itemKey.replace(/-rating$/, '');
            // Try to determine category from common prefixes
            if (baseName.startsWith('hvac-')) {
              category = 'HVAC';
              itemName = baseName.replace('hvac-', '').replace(/-/g, ' ');
            } else if (baseName.startsWith('electric-')) {
              category = 'Electrical';
              itemName = baseName.replace('electric-', '').replace(/-/g, ' ');
            } else if (baseName.startsWith('plumbing-')) {
              category = 'Plumbing';
              itemName = baseName.replace('plumbing-', '').replace(/-/g, ' ');
            } else if (baseName.startsWith('roof-')) {
              category = 'Roof';
              itemName = baseName.replace('roof-', '').replace(/-/g, ' ');
            } else if (baseName.startsWith('green-')) {
              category = 'Green/Solar';
              itemName = baseName.replace('green-', '').replace(/-/g, ' ');
            } else {
              // General appliances/fixtures
              category = 'Interior';
              itemName = baseName.replace(/-/g, ' ');
            }
          } else if (itemKey.endsWith('-condition')) {
            // Keys like "roof-flashing-condition"
            const baseName = itemKey.replace(/-condition$/, '');
            if (baseName.startsWith('roof-')) {
              category = 'Roof';
              itemName = baseName.replace('roof-', '').replace(/-/g, ' ');
            } else {
              category = 'General';
              itemName = baseName.replace(/-/g, ' ');
            }
          }
        }
        
        // Capitalize first letter of itemName
        itemName = itemName.charAt(0).toUpperCase() + itemName.slice(1);
        
        // Validate rating value
        const normalizedRating = validRatings.find(r => r.toLowerCase() === String(rating).toLowerCase()) || rating;
        
        // Get notes and defect for this item
        const notes = notesObj[itemKey] || null;
        const hasDefect = defectsObj[itemKey] || false;
        const defectDescription = hasDefect ? `Defect noted for ${itemName}` : null;
        
        // Upsert to checklist_items - use inspection_id + item_name + category as unique key
        const { error: upsertError } = await supabase
          .from('checklist_items')
          .upsert({
            inspection_id: inspection_id,
            category: category,
            subcategory: subcategory,
            item_name: itemName,
            item_type: 'rating',
            rating: normalizedRating,
            notes: notes,
            defect_description: defectDescription,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'inspection_id,category,item_name',
            ignoreDuplicates: false,
          });
        
        if (upsertError) {
          // If upsert fails due to no unique constraint, try insert/update individually
          console.log(`[UPDATE][${requestId}] Upsert failed for ${itemKey}, trying alternative approach:`, upsertError.message);
          
          // Check if item exists
          const { data: existingItem } = await supabase
            .from('checklist_items')
            .select('id')
            .eq('inspection_id', inspection_id)
            .eq('category', category)
            .eq('item_name', itemName)
            .maybeSingle();
          
          if (existingItem) {
            // Update existing
            await supabase
              .from('checklist_items')
              .update({
                rating: normalizedRating,
                subcategory: subcategory,
                notes: notes,
                defect_description: defectDescription,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingItem.id);
          } else {
            // Insert new
            await supabase
              .from('checklist_items')
              .insert({
                inspection_id: inspection_id,
                category: category,
                subcategory: subcategory,
                item_name: itemName,
                item_type: 'rating',
                rating: normalizedRating,
                notes: notes,
                defect_description: defectDescription,
              });
          }
        }
      }
      
      // Count synced items
      const { count: syncedCount } = await supabase
        .from('checklist_items')
        .select('*', { count: 'exact', head: true })
        .eq('inspection_id', inspection_id);
      
      console.log(`[UPDATE][${requestId}] Synced ${syncedCount} checklist_items for inspection ${inspection_id}`);
    }

    // Verify the update by fetching again
    const { data: verifyRow, error: verifyError } = await supabase
      .from('inspections')
      .select('id, status, updated_at, checklist_ratings, checklist_data')
      .eq('id', inspection_id)
      .single();

    if (verifyError) {
      console.error(`[UPDATE][${requestId}] Verification fetch failed:`, verifyError);
    } else {
      console.log(`[UPDATE][${requestId}] Verification - row after update:`, {
        id: verifyRow.id,
        status: verifyRow.status,
        updated_at: verifyRow.updated_at,
        checklist_ratings_count: verifyRow.checklist_ratings ? Object.keys(verifyRow.checklist_ratings as object).length : 0,
        checklist_data_count: verifyRow.checklist_data ? Object.keys(verifyRow.checklist_data as object).length : 0,
      });
    }
    
    // Verify checklist_items were synced
    const { data: checklistItems, error: checklistError } = await supabase
      .from('checklist_items')
      .select('id, category, item_name, rating')
      .eq('inspection_id', inspection_id)
      .limit(10);
    
    if (!checklistError) {
      console.log(`[UPDATE][${requestId}] Sample checklist_items:`, checklistItems);
    }

    console.log(`[UPDATE][${requestId}] === Update Inspection Request Completed ===`);

    return new Response(JSON.stringify({ inspection }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`[UPDATE][${requestId}] Unexpected error:`, error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
