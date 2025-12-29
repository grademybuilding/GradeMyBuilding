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

    const { inspection_id } = await req.json();

    if (!inspection_id) {
      return new Response(JSON.stringify({ error: 'Inspection ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch existing inspection
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

    if (Object.keys(checklistData).length === 0 && Object.keys(checklistRatings).length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Checklist data is missing. Please complete the inspection before submitting.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sync checklist_ratings to checklist_items table BEFORE calculating grade
    const validRatings = ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'];
    
    for (const [itemKey, rating] of Object.entries(checklistRatings)) {
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
      const notes = checklistNotes[itemKey] || null;
      const hasDefect = selectedDefects[itemKey] || false;
      const defectDescription = hasDefect ? `Defect noted for ${itemName}` : null;
      
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

    // Calculate grade AFTER syncing checklist_items
    await supabase.rpc('calculate_inspection_grade_v2', {
      _inspection_id: inspection_id
    });

    // Mark as completed
    const { data: inspection, error } = await supabase
      .from('inspections')
      .update({ status: 'completed' })
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
      return new Response(JSON.stringify({ error: 'Submit failed - no row returned' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      inspection,
      message: 'Inspection submitted successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});