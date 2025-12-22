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

    // Support both query params and body
    const url = new URL(req.url);
    let inspection_id = url.searchParams.get('inspection_id');
    
    // Try to get from body if not in query params
    if (!inspection_id && req.method === 'POST') {
      try {
        const body = await req.json();
        inspection_id = body.inspection_id;
      } catch {
        // Body parsing failed, continue with null
      }
    }

    if (!inspection_id) {
      return new Response(JSON.stringify({ error: 'Inspection ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch inspection with related data
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .select(`
        *,
        properties:property_id (
          *
        ),
        profiles:inspector_id (
          full_name,
          email,
          phone,
          company_name
        )
      `)
      .eq('id', inspection_id)
      .single();

    if (inspectionError) {
      console.error('Error fetching inspection:', inspectionError);
      return new Response(JSON.stringify({ error: inspectionError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch checklist items
    const { data: checklistItems, error: checklistError } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('inspection_id', inspection_id)
      .order('category');

    if (checklistError) {
      console.error('Error fetching checklist items:', checklistError);
    }

    // Fetch photos
    const { data: photos, error: photosError } = await supabase
      .from('inspection_photos')
      .select('*')
      .eq('inspection_id', inspection_id)
      .order('created_at');

    if (photosError) {
      console.error('Error fetching photos:', photosError);
    }

    return new Response(JSON.stringify({ 
      inspection,
      checklist_items: checklistItems || [],
      photos: photos || []
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
