import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { inspection_id } = await req.json();

    if (!inspection_id) {
      return new Response(JSON.stringify({ error: 'inspection_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`User ${user.id} attempting to delete inspection ${inspection_id}`);

    // Verify user owns this inspection
    const { data: inspection, error: fetchError } = await supabase
      .from('inspections')
      .select('id, inspector_id, property_id')
      .eq('id', inspection_id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching inspection:', fetchError);
      return new Response(JSON.stringify({ error: 'Failed to fetch inspection' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!inspection) {
      return new Response(JSON.stringify({ error: 'Inspection not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (inspection.inspector_id !== user.id) {
      console.error(`User ${user.id} does not own inspection ${inspection_id}`);
      return new Response(JSON.stringify({ error: 'You do not have permission to delete this inspection' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete related records first (due to foreign key constraints)
    
    // 1. Delete inspection photos
    const { error: photosError } = await supabase
      .from('inspection_photos')
      .delete()
      .eq('inspection_id', inspection_id);

    if (photosError) {
      console.error('Error deleting photos:', photosError);
    }

    // 2. Delete checklist items
    const { error: checklistError } = await supabase
      .from('checklist_items')
      .delete()
      .eq('inspection_id', inspection_id);

    if (checklistError) {
      console.error('Error deleting checklist items:', checklistError);
    }

    // 3. Delete inspection assignments
    const { error: assignmentsError } = await supabase
      .from('inspection_assignments')
      .delete()
      .eq('inspection_id', inspection_id);

    if (assignmentsError) {
      console.error('Error deleting assignments:', assignmentsError);
    }

    // 4. Delete inspection shares
    const { error: sharesError } = await supabase
      .from('inspection_shares')
      .delete()
      .eq('inspection_id', inspection_id);

    if (sharesError) {
      console.error('Error deleting shares:', sharesError);
    }

    // 5. Delete invoices linked to this inspection
    const { error: invoicesError } = await supabase
      .from('invoices')
      .delete()
      .eq('inspection_id', inspection_id);

    if (invoicesError) {
      console.error('Error deleting invoices:', invoicesError);
    }

    // 6. Delete valuations
    const { error: valuationsError } = await supabase
      .from('valuations')
      .delete()
      .eq('inspection_id', inspection_id);

    if (valuationsError) {
      console.error('Error deleting valuations:', valuationsError);
    }

    // 7. Delete risk analyses
    const { error: riskError } = await supabase
      .from('risk_analyses')
      .delete()
      .eq('inspection_id', inspection_id);

    if (riskError) {
      console.error('Error deleting risk analyses:', riskError);
    }

    // Finally, delete the inspection itself
    const { error: deleteError } = await supabase
      .from('inspections')
      .delete()
      .eq('id', inspection_id);

    if (deleteError) {
      console.error('Error deleting inspection:', deleteError);
      return new Response(JSON.stringify({ error: 'Failed to delete inspection' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Successfully deleted inspection ${inspection_id}`);

    return new Response(JSON.stringify({ success: true, message: 'Inspection deleted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
