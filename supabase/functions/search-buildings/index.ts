import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const address = url.searchParams.get('address') || '';
    const city = url.searchParams.get('city') || '';
    const state = url.searchParams.get('state') || '';
    const propertyType = url.searchParams.get('property_type') || '';
    const minGrade = url.searchParams.get('min_grade') || '';
    const maxGrade = url.searchParams.get('max_grade') || '';
    const dateFrom = url.searchParams.get('date_from') || '';
    const dateTo = url.searchParams.get('date_to') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    // Build query for public properties with completed inspections
    let query = supabase
      .from('properties')
      .select(`
        id,
        address,
        city,
        state,
        zip_code,
        property_type,
        year_built,
        square_footage,
        inspections!inner(
          id,
          inspection_date,
          final_grade_letter,
          final_grade_numeric,
          excellent_count,
          very_good_count,
          good_count,
          poor_count,
          replace_count,
          status
        )
      `)
      .eq('is_public', true)
      .eq('inspections.status', 'completed')
      .not('inspections.final_grade_letter', 'is', null)
      .order('inspections.inspection_date', { ascending: false });

    // Apply filters
    if (address.trim()) {
      query = query.ilike('address', `%${address.trim()}%`);
    }
    if (city.trim()) {
      query = query.ilike('city', `%${city.trim()}%`);
    }
    if (state.trim()) {
      query = query.eq('state', state.trim());
    }
    if (propertyType.trim()) {
      query = query.eq('property_type', propertyType.trim());
    }

    // Apply grade filters
    const gradeOrder = ['F', 'D', 'C', 'B', 'A', 'A+'];
    if (minGrade.trim()) {
      const minIndex = gradeOrder.indexOf(minGrade.trim());
      if (minIndex >= 0) {
        const acceptableGrades = gradeOrder.slice(minIndex);
        query = query.in('inspections.final_grade_letter', acceptableGrades);
      }
    }
    if (maxGrade.trim()) {
      const maxIndex = gradeOrder.indexOf(maxGrade.trim());
      if (maxIndex >= 0) {
        const acceptableGrades = gradeOrder.slice(0, maxIndex + 1);
        query = query.in('inspections.final_grade_letter', acceptableGrades);
      }
    }

    // Apply date filters
    if (dateFrom.trim()) {
      query = query.gte('inspections.inspection_date', dateFrom.trim());
    }
    if (dateTo.trim()) {
      query = query.lte('inspections.inspection_date', dateTo.trim());
    }

    // Get total count for pagination
    const countQuery = supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('is_public', true);

    const { count } = await countQuery;

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to search properties' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform data to include only the most recent inspection per property
    const results = data?.map((property: any) => {
      const latestInspection = property.inspections[0];
      return {
        id: property.id,
        address: property.address,
        city: property.city,
        state: property.state,
        zip_code: property.zip_code,
        property_type: property.property_type,
        year_built: property.year_built,
        square_footage: property.square_footage,
        inspection: {
          id: latestInspection.id,
          inspection_date: latestInspection.inspection_date,
          final_grade_letter: latestInspection.final_grade_letter,
          final_grade_numeric: latestInspection.final_grade_numeric,
          excellent_count: latestInspection.excellent_count,
          very_good_count: latestInspection.very_good_count,
          good_count: latestInspection.good_count,
          poor_count: latestInspection.poor_count,
          replace_count: latestInspection.replace_count,
        }
      };
    }) || [];

    return new Response(
      JSON.stringify({
        results,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});