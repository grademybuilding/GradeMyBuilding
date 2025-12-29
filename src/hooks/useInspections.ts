import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface InspectionListItem {
  id: string;
  inspection_date: string;
  status: string | null;
  final_grade_letter: string | null;
  final_grade_numeric: number | null;
  notes: string | null;
  created_at: string | null;
  checklist_data: Record<string, unknown> | null;
  properties: {
    address: string;
    city: string;
    state: string;
    property_type: string;
  } | null;
}

export interface InspectionDetails {
  id: string;
  inspection_date: string;
  inspection_time: string | null;
  status: string | null;
  final_grade_letter: string | null;
  final_grade_numeric: number | null;
  notes: string | null;
  checklist_data: Record<string, unknown> | null;
  checklist_ratings: Record<string, string> | null;
  checklist_notes: Record<string, string> | null;
  selected_defects: Record<string, string[]> | null;
  category_scores: Record<string, unknown> | null;
  excellent_count: number | null;
  very_good_count: number | null;
  good_count: number | null;
  poor_count: number | null;
  replace_count: number | null;
  total_items_rated: number | null;
  total_points_earned: number | null;
  total_points_possible: number | null;
  weather_conditions: string[] | null;
  temperature: number | null;
  occupancy: string | null;
  attendance: string[] | null;
  building_types: string[] | null;
  properties: {
    id: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    property_type: string;
    year_built: number | null;
    square_footage: number | null;
    owner_name: string | null;
    owner_email: string | null;
    owner_phone: string | null;
  } | null;
  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
    company_name: string | null;
  } | null;
}

export interface ChecklistItem {
  id: string;
  category: string;
  subcategory: string | null;
  item_name: string;
  item_type: string;
  rating: string | null;
  notes: string | null;
  defect_description: string | null;
  selected_values: unknown | null;
}

export interface InspectionPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  category: string | null;
  tag: string | null;
  created_at: string | null;
}

interface UseInspectionsReturn {
  inspections: InspectionListItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseInspectionDetailsReturn {
  inspection: InspectionDetails | null;
  checklistItems: ChecklistItem[];
  photos: InspectionPhoto[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useInspections(): UseInspectionsReturn {
  const [inspections, setInspections] = useState<InspectionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInspections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-inspections');

      if (fnError) {
        throw new Error(fnError.message || 'Failed to fetch inspections');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const normalized: InspectionListItem[] = (data?.inspections || []).map((i: any) => {
        let checklist_data: Record<string, unknown> | null = i?.checklist_data ?? null;
        if (typeof checklist_data === 'string') {
          try {
            checklist_data = JSON.parse(checklist_data) as Record<string, unknown>;
          } catch {
            checklist_data = null;
          }
        }

        return {
          ...i,
          checklist_data,
        } as InspectionListItem;
      });

      setInspections(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inspections');
      setInspections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  return { inspections, loading, error, refetch: fetchInspections };
}

export function useInspectionDetails(inspectionId: string | null): UseInspectionDetailsReturn {
  const [inspection, setInspection] = useState<InspectionDetails | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [photos, setPhotos] = useState<InspectionPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!inspectionId) {
      setInspection(null);
      setChecklistItems([]);
      setPhotos([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-inspection-details', {
        body: { inspection_id: inspectionId }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to fetch inspection details');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Normalize checklist_data (parse if string)
      let inspectionData = data?.inspection || null;
      if (inspectionData) {
        let checklist_data = inspectionData.checklist_data;
        if (typeof checklist_data === 'string') {
          try {
            checklist_data = JSON.parse(checklist_data);
          } catch {
            checklist_data = null;
          }
        }
        inspectionData = { ...inspectionData, checklist_data };
      }
      
      setInspection(inspectionData);
      setChecklistItems(data?.checklist_items || []);
      setPhotos(data?.photos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inspection details');
      setInspection(null);
      setChecklistItems([]);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { inspection, checklistItems, photos, loading, error, refetch: fetchDetails };
}
