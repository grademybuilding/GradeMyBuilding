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

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const property_id = url.searchParams.get('property_id');
    const date_from = url.searchParams.get('date_from');
    const date_to = url.searchParams.get('date_to');
    const min_grade = url.searchParams.get('min_grade');
    const max_grade = url.searchParams.get('max_grade');

    let query = supabase
      .from('inspections')
      .select(`
        *,
        properties:property_id (
          address,
          city,
          state,
          property_type
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (property_id) {
      query = query.eq('property_id', property_id);
    }
    if (date_from) {
      query = query.gte('inspection_date', date_from);
    }
    if (date_to) {
      query = query.lte('inspection_date', date_to);
    }
    if (min_grade) {
      query = query.gte('final_grade_numeric', parseFloat(min_grade));
    }
    if (max_grade) {
      query = query.lte('final_grade_numeric', parseFloat(max_grade));
    }

    const { data: inspections, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ inspections }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});