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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { inspection_id, updates } = await req.json();

    if (!inspection_id) {
      return new Response(JSON.stringify({ error: 'Inspection ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch existing inspection to verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', inspection_id)
      .single();

    if (fetchError || !existing) {
      return new Response(JSON.stringify({ error: 'Inspection not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (existing.inspector_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized to update this inspection' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Perform the update
    const { data: inspection, error } = await supabase
      .from('inspections')
      .update(updates)
      .eq('id', inspection_id)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!inspection) {
      return new Response(JSON.stringify({ error: 'Update failed - no row returned' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sync checklist_ratings to checklist_items table for grade calculation
    if (updates.checklist_ratings && typeof updates.checklist_ratings === 'object') {
      const ratingsObj = updates.checklist_ratings as Record<string, string>;
      const notesObj = (updates.checklist_notes || {}) as Record<string, string>;
      const defectsObj = (updates.selected_defects || {}) as Record<string, boolean>;
      
      const validRatings = ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'];
      
      for (const [itemKey, rating] of Object.entries(ratingsObj)) {
        let category = 'General';
        let subcategory: string | null = null;
        let itemName = itemKey;
        
        if (itemKey.includes('|')) {
          const parts = itemKey.split('|');
          category = parts[0] || 'General';
          subcategory = parts.length > 2 ? parts[1] : null;
          itemName = parts[parts.length - 1] || itemKey;
        } else {
          if (itemKey.includes('-inspector-')) {
            const match = itemKey.match(/^(.+)-inspector-/);
            if (match) {
              category = match[1].charAt(0).toUpperCase() + match[1].slice(1).replace(/-/g, ' ');
              itemName = itemKey.replace(/-/g, ' ');
            }
          } else if (itemKey.endsWith('-rating')) {
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
        
        itemName = itemName.charAt(0).toUpperCase() + itemName.slice(1);
        const normalizedRating = validRatings.find(r => r.toLowerCase() === String(rating).toLowerCase()) || rating;
        const notes = notesObj[itemKey] || null;
        const hasDefect = defectsObj[itemKey] || false;
        const defectDescription = hasDefect ? `Defect noted for ${itemName}` : null;
        
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
          const { data: existingItem } = await supabase
            .from('checklist_items')
            .select('id')
            .eq('inspection_id', inspection_id)
            .eq('category', category)
            .eq('item_name', itemName)
            .maybeSingle();
          
          if (existingItem) {
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
    }

    return new Response(JSON.stringify({ inspection }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});