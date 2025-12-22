import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InspectionFormData {
  // Property Info
  propertyAddress?: string;
  propertyCity?: string;
  propertyState?: string;
  propertyZip?: string;
  propertyType?: string;
  yearBuilt?: string;
  squareFootage?: string;
  ownerInfo?: string;
  
  // Inspection Details
  inspectionDate?: string;
  inspectionTime?: string;
  inspectorName?: string;
  inspectionCategories?: string[];
  weatherConditions?: string[];
  temperature?: string;
  occupancy?: string;
  attendance?: string[];
  residentialBuildingTypes?: string[];
  commercialBuildingTypes?: string[];
  
  // Checklist data
  checklistRatings?: Record<string, string>;
  checklistNotes?: Record<string, string>;
  selectedDefects?: Record<string, boolean>;
  
  // Navigation state (for restoring position)
  currentStep?: number;
  currentMainCategory?: number;
  currentSubcategory?: number;
  completedSteps?: number[];
  completedCategories?: number[];
  completedSubcategories?: Record<number, string[]>;
  skippedSubcategories?: Record<number, string[]>;
}

interface UseInspectionOptions {
  inspectionId?: string | null;
  autoSaveDelay?: number;
}

export function useInspection(options: UseInspectionOptions = {}) {
  const { inspectionId: initialInspectionId, autoSaveDelay = 2000 } = options;
  
  const [inspectionId, setInspectionId] = useState<string | null>(initialInspectionId ?? null);
  const [formData, setFormData] = useState<InspectionFormData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [status, setStatus] = useState<'draft' | 'completed'>('draft');
  const [propertyId, setPropertyId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<boolean>(false);
  const formDataRef = useRef<InspectionFormData>(formData);
  
  // Keep ref in sync with state
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Load existing draft on mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      // Save any pending changes before unmount
      if (pendingChangesRef.current && inspectionId) {
        saveToSupabase(formDataRef.current, false);
      }
    };
  }, [inspectionId]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingChangesRef.current && inspectionId) {
        // Use sendBeacon for reliable save on page unload
        const session = localStorage.getItem('sb-fjzdbbbpqiibtiqfncwf-auth-token');
        if (session) {
          const parsedSession = JSON.parse(session);
          const token = parsedSession?.access_token;
          if (token) {
            navigator.sendBeacon(
              'https://fjzdbbbpqiibtiqfncwf.supabase.co/functions/v1/update-inspection',
              JSON.stringify({
                inspection_id: inspectionId,
                updates: buildSupabasePayload(formDataRef.current),
              })
            );
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [inspectionId]);

  const loadDraft = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // Check for existing draft inspection for this user
      const { data: inspections, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('inspector_id', session.user.id)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading draft:', error);
        setLoading(false);
        return;
      }

      if (inspections && inspections.length > 0) {
        const draft = inspections[0];
        setInspectionId(draft.id);
        setPropertyId(draft.property_id);
        setStatus(draft.status as 'draft' | 'completed');
        
        // Restore form data from checklist_data JSONB
        const savedData = (draft.checklist_data as InspectionFormData) || {};
        
        // Also restore individual fields
        const restoredData: InspectionFormData = {
          ...savedData,
          inspectionDate: draft.inspection_date || savedData.inspectionDate,
          inspectionTime: draft.inspection_time || savedData.inspectionTime,
          weatherConditions: draft.weather_conditions || savedData.weatherConditions,
          temperature: draft.temperature?.toString() || savedData.temperature,
          occupancy: draft.occupancy || savedData.occupancy,
          attendance: draft.attendance || savedData.attendance,
          checklistRatings: (draft.checklist_ratings as Record<string, string>) || savedData.checklistRatings || {},
          checklistNotes: (draft.checklist_notes as Record<string, string>) || savedData.checklistNotes || {},
          selectedDefects: (draft.selected_defects as Record<string, boolean>) || savedData.selectedDefects || {},
        };
        
        setFormData(restoredData);
        
        toast({
          title: "Draft Restored",
          description: "Your previous inspection draft has been loaded.",
        });
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildSupabasePayload = (data: InspectionFormData) => {
    return {
      inspection_date: data.inspectionDate || new Date().toISOString().split('T')[0],
      inspection_time: data.inspectionTime || null,
      weather_conditions: data.weatherConditions || [],
      temperature: data.temperature ? parseFloat(data.temperature) : null,
      occupancy: data.occupancy || null,
      attendance: data.attendance || [],
      building_types: [
        ...(data.residentialBuildingTypes || []),
        ...(data.commercialBuildingTypes || []),
      ],
      checklist_ratings: data.checklistRatings || {},
      checklist_notes: data.checklistNotes || {},
      selected_defects: data.selectedDefects || {},
      checklist_data: data, // Store full form data for restoration
      status: 'draft',
    };
  };

  const saveToSupabase = async (data: InspectionFormData, showToast: boolean = true) => {
    try {
      setSaving(true);
      pendingChangesRef.current = false;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to save.",
          variant: "destructive",
        });
        return false;
      }

      const payload = buildSupabasePayload(data);

      if (inspectionId) {
        // Update existing inspection
        const { error } = await supabase.functions.invoke('update-inspection', {
          body: {
            inspection_id: inspectionId,
            updates: payload,
          },
        });

        if (error) {
          console.error('Error updating inspection:', error);
          if (showToast) {
            toast({
              title: "Save Failed",
              description: "Could not save your inspection. Please try again.",
              variant: "destructive",
            });
          }
          return false;
        }
      } else {
        // Create new inspection - need a property first
        let currentPropertyId = propertyId;
        
        if (!currentPropertyId) {
          // Create a temporary property for the inspection
          const { data: property, error: propertyError } = await supabase
            .from('properties')
            .insert({
              address: data.propertyAddress || 'Draft Property',
              city: data.propertyCity || 'Unknown',
              state: data.propertyState || 'Unknown',
              zip_code: data.propertyZip || '00000',
              property_type: data.propertyType || 'residential',
              year_built: data.yearBuilt ? parseInt(data.yearBuilt) : null,
              square_footage: data.squareFootage ? parseInt(data.squareFootage) : null,
              created_by: session.user.id,
            })
            .select()
            .single();

          if (propertyError) {
            console.error('Error creating property:', propertyError);
            if (showToast) {
              toast({
                title: "Save Failed",
                description: "Could not create property. Please try again.",
                variant: "destructive",
              });
            }
            return false;
          }
          
          currentPropertyId = property.id;
          setPropertyId(currentPropertyId);
        }

        // Create the inspection
        const { data: result, error } = await supabase.functions.invoke('create-inspection', {
          body: {
            property_id: currentPropertyId,
            inspection_date: payload.inspection_date,
            inspection_time: payload.inspection_time,
            weather_conditions: payload.weather_conditions,
            temperature: payload.temperature,
            occupancy: payload.occupancy,
            attendance: payload.attendance,
            building_types: payload.building_types,
          },
        });

        if (error) {
          console.error('Error creating inspection:', error);
          if (showToast) {
            toast({
              title: "Save Failed",
              description: "Could not create inspection. Please try again.",
              variant: "destructive",
            });
          }
          return false;
        }

        const newInspectionId = result.inspection?.id;
        if (newInspectionId) {
          setInspectionId(newInspectionId);
          
          // Now update with full form data
          await supabase.functions.invoke('update-inspection', {
            body: {
              inspection_id: newInspectionId,
              updates: {
                checklist_ratings: payload.checklist_ratings,
                checklist_notes: payload.checklist_notes,
                selected_defects: payload.selected_defects,
                checklist_data: payload.checklist_data,
              },
            },
          });
        }
      }

      setLastSaved(new Date());
      
      if (showToast) {
        toast({
          title: "Saved",
          description: "Your inspection has been saved as a draft.",
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error saving:', error);
      if (showToast) {
        toast({
          title: "Save Failed",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const triggerAutoSave = useCallback(() => {
    pendingChangesRef.current = true;
    
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // Set new timer for debounced auto-save
    autoSaveTimerRef.current = setTimeout(() => {
      saveToSupabase(formDataRef.current, false);
    }, autoSaveDelay);
  }, [autoSaveDelay]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
    
    // Trigger auto-save
    triggerAutoSave();
  }, [triggerAutoSave]);

  const handleManualSave = useCallback(async () => {
    // Clear any pending auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    return saveToSupabase(formDataRef.current, true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!inspectionId) {
      // Save first to get an inspection ID
      const saved = await saveToSupabase(formDataRef.current, false);
      if (!saved) {
        toast({
          title: "Submit Failed",
          description: "Could not save inspection before submitting.",
          variant: "destructive",
        });
        return false;
      }
    }

    try {
      setSaving(true);
      
      // Call submit endpoint
      const { error } = await supabase.functions.invoke('submit-inspection', {
        body: {
          inspection_id: inspectionId,
        },
      });

      if (error) {
        console.error('Error submitting inspection:', error);
        toast({
          title: "Submit Failed",
          description: "Could not submit your inspection. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      setStatus('completed');
      
      toast({
        title: "Inspection Submitted",
        description: "Your inspection has been submitted for review.",
      });
      
      return true;
    } catch (error) {
      console.error('Error submitting:', error);
      toast({
        title: "Submit Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [inspectionId, toast]);

  // Update navigation state (for position restoration)
  const updateNavigationState = useCallback((state: Partial<InspectionFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...state };
      return updated;
    });
    triggerAutoSave();
  }, [triggerAutoSave]);

  return {
    inspectionId,
    formData,
    setFormData,
    loading,
    saving,
    lastSaved,
    status,
    isReadOnly: status === 'completed',
    handleFieldChange,
    handleManualSave,
    handleSubmit,
    updateNavigationState,
    triggerAutoSave,
  };
}
