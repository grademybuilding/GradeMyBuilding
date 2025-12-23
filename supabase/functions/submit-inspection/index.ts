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
  console.log(`[SUBMIT][${requestId}] === Submit Inspection Request Started ===`);

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
      console.log(`[SUBMIT][${requestId}] Auth failed:`, authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[SUBMIT][${requestId}] User authenticated:`, user.id);

    const { inspection_id } = await req.json();

    console.log(`[SUBMIT][${requestId}] inspection_id:`, inspection_id);

    if (!inspection_id) {
      console.log(`[SUBMIT][${requestId}] Validation failed: missing inspection_id`);
      return new Response(JSON.stringify({ error: 'Inspection ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch existing inspection - BEFORE state
    console.log(`[SUBMIT][${requestId}] Fetching inspection BEFORE submit...`);
    const { data: existing, error: fetchError } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', inspection_id)
      .single();

    if (fetchError || !existing) {
      console.log(`[SUBMIT][${requestId}] Inspection not found:`, fetchError?.message);
      return new Response(JSON.stringify({ error: 'Inspection not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[SUBMIT][${requestId}] BEFORE submit state:`, {
      id: existing.id,
      status: existing.status,
      inspector_id: existing.inspector_id,
      property_id: existing.property_id,
      checklist_ratings_count: existing.checklist_ratings ? Object.keys(existing.checklist_ratings as object).length : 0,
      checklist_data_count: existing.checklist_data ? Object.keys(existing.checklist_data as object).length : 0,
      checklist_notes_count: existing.checklist_notes ? Object.keys(existing.checklist_notes as object).length : 0,
      selected_defects_count: existing.selected_defects ? Object.keys(existing.selected_defects as object).length : 0,
      final_grade_letter: existing.final_grade_letter,
      final_grade_numeric: existing.final_grade_numeric,
    });

    if (existing.inspector_id !== user.id) {
      console.log(`[SUBMIT][${requestId}] Authorization failed`);
      return new Response(JSON.stringify({ error: 'Unauthorized to submit this inspection' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Pre-submit validation
    const checklistData = existing.checklist_data as object || {};
    const checklistRatings = existing.checklist_ratings as Record<string, string> || {};
    const checklistNotes = existing.checklist_notes as Record<string, string> || {};
    const selectedDefects = existing.selected_defects as Record<string, boolean> || {};
    
    console.log(`[SUBMIT][${requestId}] Pre-submit validation:`, {
      hasChecklistData: Object.keys(checklistData).length > 0,
      hasChecklistRatings: Object.keys(checklistRatings).length > 0,
    });

    if (Object.keys(checklistData).length === 0 && Object.keys(checklistRatings).length === 0) {
      console.error(`[SUBMIT][${requestId}] Validation failed: No checklist data found`);
      return new Response(JSON.stringify({ 
        error: 'Checklist data is missing. Please complete the inspection before submitting.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sync checklist_ratings to checklist_items table BEFORE calculating grade
    console.log(`[SUBMIT][${requestId}] Syncing checklist_ratings to checklist_items table...`);
    
    const validRatings = ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'];
    let syncedCount = 0;
    
    for (const [itemKey, rating] of Object.entries(checklistRatings)) {
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
        if (itemKey.includes('-inspector-')) {
          // Keys like "foundation-inspector-rating" -> category: Foundation
          const match = itemKey.match(/^(.+)-inspector-/);
          if (match) {
            category = match[1].charAt(0).toUpperCase() + match[1].slice(1).replace(/-/g, ' ');
            itemName = itemKey.replace(/-/g, ' ');
          }
        } else if (itemKey.endsWith('-rating')) {
          // Keys like "range-rating", "hvac-cooling-rating"
          const baseName = itemKey.replace(/-rating$/, '');
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
            category = 'Interior';
            itemName = baseName.replace(/-/g, ' ');
          }
        } else if (itemKey.endsWith('-condition')) {
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
      
      // Validate rating value (case-insensitive match)
      const normalizedRating = validRatings.find(r => r.toLowerCase() === String(rating).toLowerCase()) || rating;
      
      // Get notes and defect for this item
      const notes = checklistNotes[itemKey] || null;
      const hasDefect = selectedDefects[itemKey] || false;
      const defectDescription = hasDefect ? `Defect noted for ${itemName}` : null;
      
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
        const { error: updateErr } = await supabase
          .from('checklist_items')
          .update({
            rating: normalizedRating,
            subcategory: subcategory,
            notes: notes,
            defect_description: defectDescription,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingItem.id);
        
        if (!updateErr) syncedCount++;
      } else {
        // Insert new
        const { error: insertErr } = await supabase
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
        
        if (!insertErr) syncedCount++;
      }
    }
    
    console.log(`[SUBMIT][${requestId}] Synced ${syncedCount} checklist_items for inspection ${inspection_id}`);
    
    // Verify synced items
    const { count: itemCount } = await supabase
      .from('checklist_items')
      .select('*', { count: 'exact', head: true })
      .eq('inspection_id', inspection_id);
    
    console.log(`[SUBMIT][${requestId}] Total checklist_items in DB: ${itemCount}`);
    
    // Sample items for debugging
    const { data: sampleItems } = await supabase
      .from('checklist_items')
      .select('category, item_name, rating')
      .eq('inspection_id', inspection_id)
      .limit(5);
    
    console.log(`[SUBMIT][${requestId}] Sample checklist_items:`, sampleItems);

    // Calculate grade AFTER syncing checklist_items
    console.log(`[SUBMIT][${requestId}] Calculating grade...`);
    const { data: gradeResult, error: gradeError } = await supabase.rpc('calculate_inspection_grade_v2', {
      _inspection_id: inspection_id
    });

    if (gradeError) {
      console.error(`[SUBMIT][${requestId}] Grade calculation error:`, gradeError);
      // Don't fail submission for grade error, just log it
    } else {
      console.log(`[SUBMIT][${requestId}] Grade calculated:`, gradeResult);
    }

    // Mark as completed
    console.log(`[SUBMIT][${requestId}] Updating status to completed...`);
    const { data: inspection, error } = await supabase
      .from('inspections')
      .update({ status: 'completed' })
      .eq('id', inspection_id)
      .select()
      .single();

    if (error) {
      console.error(`[SUBMIT][${requestId}] Status update error:`, error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!inspection) {
      console.error(`[SUBMIT][${requestId}] Update returned null - no row affected`);
      return new Response(JSON.stringify({ error: 'Submit failed - no row returned' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[SUBMIT][${requestId}] AFTER submit state:`, {
      id: inspection.id,
      status: inspection.status,
      updated_at: inspection.updated_at,
      final_grade_letter: inspection.final_grade_letter,
      final_grade_numeric: inspection.final_grade_numeric,
      total_items_rated: inspection.total_items_rated,
      total_points_earned: inspection.total_points_earned,
      total_points_possible: inspection.total_points_possible,
    });

    // Final verification
    const { data: verifyRow, error: verifyError } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', inspection_id)
      .single();

    if (verifyError) {
      console.error(`[SUBMIT][${requestId}] Verification fetch failed:`, verifyError);
    } else {
      console.log(`[SUBMIT][${requestId}] Final verification:`, {
        id: verifyRow.id,
        status: verifyRow.status,
        final_grade_letter: verifyRow.final_grade_letter,
        checklist_data_preserved: verifyRow.checklist_data ? Object.keys(verifyRow.checklist_data as object).length : 0,
        checklist_ratings_preserved: verifyRow.checklist_ratings ? Object.keys(verifyRow.checklist_ratings as object).length : 0,
      });
    }

    console.log(`[SUBMIT][${requestId}] === Submit Inspection Request Completed Successfully ===`);

    return new Response(JSON.stringify({ 
      inspection,
      message: 'Inspection submitted successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`[SUBMIT][${requestId}] Unexpected error:`, error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
