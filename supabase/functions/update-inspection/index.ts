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
