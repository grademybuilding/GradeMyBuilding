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
  console.log(`[CREATE][${requestId}] === Create Inspection Request Started ===`);

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
      console.log(`[CREATE][${requestId}] Auth failed:`, authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[CREATE][${requestId}] User authenticated:`, user.id);

    const body = await req.json();
    console.log(`[CREATE][${requestId}] Request body:`, JSON.stringify(body, null, 2));

    const { 
      property_id, 
      inspection_date, 
      inspection_time,
      weather_conditions,
      temperature,
      occupancy,
      attendance,
      building_types 
    } = body;

    if (!property_id || !inspection_date) {
      console.log(`[CREATE][${requestId}] Validation failed: missing property_id or inspection_date`);
      return new Response(JSON.stringify({ error: 'Property ID and inspection date are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[CREATE][${requestId}] Creating inspection with:`, {
      property_id,
      inspector_id: user.id,
      inspection_date,
      inspection_time,
      weather_conditions,
      temperature,
      occupancy,
      attendance,
      building_types,
    });

    const { data: inspection, error } = await supabase
      .from('inspections')
      .insert({
        property_id,
        inspector_id: user.id,
        inspection_date,
        inspection_time,
        weather_conditions,
        temperature,
        occupancy,
        attendance,
        building_types,
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      console.error(`[CREATE][${requestId}] Insert error:`, error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[CREATE][${requestId}] Inspection created successfully:`, {
      inspection_id: inspection.id,
      property_id: inspection.property_id,
      status: inspection.status,
    });

    // Verify the created row
    const { data: verifyRow, error: verifyError } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', inspection.id)
      .single();

    if (verifyError) {
      console.error(`[CREATE][${requestId}] Verification fetch failed:`, verifyError);
    } else {
      console.log(`[CREATE][${requestId}] Verification - row exists:`, {
        id: verifyRow.id,
        status: verifyRow.status,
        created_at: verifyRow.created_at,
      });
    }

    console.log(`[CREATE][${requestId}] === Create Inspection Request Completed ===`);

    return new Response(JSON.stringify({ inspection }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`[CREATE][${requestId}] Unexpected error:`, error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
