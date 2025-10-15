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

    // Verify user owns this inspection
    const { data: existing, error: fetchError } = await supabase
      .from('inspections')
      .select('inspector_id, status')
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

    // Calculate grade before submitting
    const { error: gradeError } = await supabase.rpc('calculate_inspection_grade_v2', {
      _inspection_id: inspection_id
    });

    if (gradeError) {
      console.error('Error calculating grade:', gradeError);
    }

    // Mark as completed
    const { data: inspection, error } = await supabase
      .from('inspections')
      .update({ status: 'completed' })
      .eq('id', inspection_id)
      .select()
      .single();

    if (error) {
      console.error('Error submitting inspection:', error);
      return new Response(JSON.stringify({ error: error.message }), {
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
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
