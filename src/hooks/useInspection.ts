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
  /** Debounce delay for auto-save (when enabled) */
  autoSaveDelay?: number;
  /** If false, changes will NOT be saved automatically; user must click Save */
  autoSaveEnabled?: boolean;
  /** If false, do not auto-restore an existing draft on mount */
  restoreDraftOnMount?: boolean;
}

// Debug logging helper
const DEBUG_PREFIX = '[INSPECTION]';
const log = {
  save: (msg: string, data?: any) => console.log(`${DEBUG_PREFIX}[SAVE] ${msg}`, data ?? ''),
  create: (msg: string, data?: any) => console.log(`${DEBUG_PREFIX}[CREATE] ${msg}`, data ?? ''),
  update: (msg: string, data?: any) => console.log(`${DEBUG_PREFIX}[UPDATE] ${msg}`, data ?? ''),
  submit: (msg: string, data?: any) => console.log(`${DEBUG_PREFIX}[SUBMIT] ${msg}`, data ?? ''),
  load: (msg: string, data?: any) => console.log(`${DEBUG_PREFIX}[LOAD] ${msg}`, data ?? ''),
  verify: (msg: string, data?: any) => console.log(`${DEBUG_PREFIX}[VERIFY] ${msg}`, data ?? ''),
  error: (msg: string, data?: any) => console.error(`${DEBUG_PREFIX}[ERROR] ${msg}`, data ?? ''),
};

export function useInspection(options: UseInspectionOptions = {}) {
  const {
    inspectionId: initialInspectionId,
    autoSaveDelay = 2000,
    autoSaveEnabled = true,
    restoreDraftOnMount = true,
  } = options;

  const [inspectionId, setInspectionId] = useState<string | null>(initialInspectionId ?? null);
  const [formData, setFormData] = useState<InspectionFormData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [status, setStatus] = useState<'draft' | 'completed'>('draft');
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    lastOperation: string;
    lastPayload: any;
    lastResponse: any;
    lastVerification: any;
    errors: string[];
  }>({
    lastOperation: '',
    lastPayload: null,
    lastResponse: null,
    lastVerification: null,
    errors: [],
  });
  
  const { toast } = useToast();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<boolean>(false);
  const formDataRef = useRef<InspectionFormData>(formData);
  const inspectionIdRef = useRef<string | null>(inspectionId);
  const skipNextUnmountSaveRef = useRef(false);
  /** Bumps whenever we hard-reset the flow; used to ignore late async state updates */
  const resetEpochRef = useRef(0);

  const isStale = (epoch: number) => epoch !== resetEpochRef.current;
  
  // Keep refs in sync with state
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    inspectionIdRef.current = inspectionId;
  }, [inspectionId]);

  // Reset all inspection state for a fresh start
  const resetInspectionFlow = useCallback(() => {
    log.save('Resetting inspection flow for fresh start');

    // Invalidate any in-flight async work (save/load) so it can't repopulate the form after reset
    resetEpochRef.current += 1;

    // Prevent any "save on unmount" from writing a new draft right after submit
    skipNextUnmountSaveRef.current = true;

    // Mark submitted across navigations so draft restore is skipped (keep flag until user starts editing)
    localStorage.setItem('inspection:just_submitted', String(Date.now()));

    // Clear any pending auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    pendingChangesRef.current = false;
    formDataRef.current = {};
    inspectionIdRef.current = null;

    // Reset all state
    setInspectionId(null);
    setPropertyId(null);
    setFormData({});
    setStatus('draft');
    setLastSaved(null);
    setJustSubmitted(true);

    setDebugInfo({
      lastOperation: 'RESET',
      lastPayload: null,
      lastResponse: null,
      lastVerification: null,
      errors: [],
    });
  }, []);

  // Load specific inspection by ID (for Resume functionality)
  const loadInspectionById = async (idToLoad: string) => {
    const epoch = resetEpochRef.current;
    
    try {
      setLoading(true);
      log.load('Loading specific inspection by ID', { inspectionId: idToLoad });
      
      // Clear the just_submitted flag since user is resuming an inspection
      localStorage.removeItem('inspection:just_submitted');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        log.load('No session found, skipping inspection load');
        setLoading(false);
        return;
      }

      if (isStale(epoch)) return;

      const { data: inspection, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('id', idToLoad)
        .eq('inspector_id', session.user.id)
        .single();

      if (isStale(epoch)) return;

      if (error) {
        log.error('Error loading inspection by ID', error);
        toast({
          title: "Error",
          description: "Could not load inspection. It may have been deleted.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!inspection) {
        log.load('Inspection not found');
        setLoading(false);
        return;
      }

      log.load('Loaded inspection by ID', {
        inspectionId: inspection.id,
        propertyId: inspection.property_id,
        status: inspection.status,
        hasChecklistData: !!inspection.checklist_data,
      });

      // Restore form data from checklist_data JSONB
      const savedData = (inspection.checklist_data as InspectionFormData) || {};

      const restoredData: InspectionFormData = {
        ...savedData,
        inspectionDate: inspection.inspection_date || savedData.inspectionDate,
        inspectionTime: inspection.inspection_time || savedData.inspectionTime,
        weatherConditions: inspection.weather_conditions || savedData.weatherConditions,
        temperature: inspection.temperature?.toString() || savedData.temperature,
        occupancy: inspection.occupancy || savedData.occupancy,
        attendance: inspection.attendance || savedData.attendance,
        checklistRatings: (inspection.checklist_ratings as Record<string, string>) || savedData.checklistRatings || {},
        checklistNotes: (inspection.checklist_notes as Record<string, string>) || savedData.checklistNotes || {},
        selectedDefects: (inspection.selected_defects as Record<string, boolean>) || savedData.selectedDefects || {},
      };

      if (isStale(epoch)) return;

      // Set inspection ID and update ref immediately for save operations
      setInspectionId(inspection.id);
      inspectionIdRef.current = inspection.id;
      setPropertyId(inspection.property_id);
      setStatus(inspection.status === 'completed' ? 'completed' : 'draft');
      setFormData(restoredData);
      formDataRef.current = restoredData;
      setJustSubmitted(false);
      
      log.load('State updated after resume', {
        inspectionId: inspection.id,
        propertyId: inspection.property_id,
        formDataKeys: Object.keys(restoredData).length,
      });

      toast({
        title: 'Inspection Loaded',
        description: 'Continuing from where you left off.',
      });
    } catch (error) {
      log.error('Error loading inspection by ID', error);
    } finally {
      if (!isStale(epoch)) setLoading(false);
    }
  };

  // Load existing draft on mount OR load specific inspection by ID
  useEffect(() => {
    if (initialInspectionId) {
      // Load specific inspection when ID is provided (Resume functionality)
      log.load('Resume requested for inspection', { inspectionId: initialInspectionId });
      
      // Clear the just_submitted flag since user is resuming
      localStorage.removeItem('inspection:just_submitted');
      setJustSubmitted(false);
      
      // Load the specific inspection - it will set all the state correctly
      loadInspectionById(initialInspectionId);
    } else if (restoreDraftOnMount) {
      // Load most recent draft
      loadDraft();
    } else {
      // Starting fresh - ensure clean state
      setFormData({});
      setInspectionId(null);
      setPropertyId(null);
      setStatus('draft');
      setLastSaved(null);
      pendingChangesRef.current = false;
      setLoading(false);
    }
  }, [initialInspectionId, restoreDraftOnMount]);

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // If we just submitted & reset, NEVER write another draft on unmount
      if (skipNextUnmountSaveRef.current) {
        skipNextUnmountSaveRef.current = false;
        pendingChangesRef.current = false;
        return;
      }

      // Save any pending changes before unmount
      const id = inspectionIdRef.current;
      if (pendingChangesRef.current && id) {
        saveToSupabase(formDataRef.current, false);
      }
    };
  }, []);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingChangesRef.current && inspectionId) {
        log.save('Page unload - attempting beacon save', { inspectionId });
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

  // Verify saved data matches what was sent
  const verifyData = async (inspectionIdToVerify: string, sentPayload: any) => {
    try {
      log.verify('Starting verification', { inspectionId: inspectionIdToVerify });
      
      const { data: verify, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('id', inspectionIdToVerify)
        .single();

      if (error) {
        log.error('Verification fetch failed', error);
        setDebugInfo(prev => ({
          ...prev,
          lastVerification: { error: error.message },
          errors: [...prev.errors, `Verify fetch failed: ${error.message}`],
        }));
        return false;
      }

      log.verify('Database row after save', verify);
      
      // Compare key fields
      const differences: string[] = [];
      
      if (sentPayload.checklist_ratings && verify.checklist_ratings) {
        const sentRatingsCount = Object.keys(sentPayload.checklist_ratings).length;
        const savedRatingsCount = Object.keys(verify.checklist_ratings as object || {}).length;
        if (sentRatingsCount !== savedRatingsCount) {
          differences.push(`checklist_ratings count mismatch: sent=${sentRatingsCount}, saved=${savedRatingsCount}`);
        }
      }
      
      if (sentPayload.checklist_data && verify.checklist_data) {
        const sentDataKeys = Object.keys(sentPayload.checklist_data).length;
        const savedDataKeys = Object.keys(verify.checklist_data as object || {}).length;
        if (sentDataKeys !== savedDataKeys) {
          differences.push(`checklist_data keys mismatch: sent=${sentDataKeys}, saved=${savedDataKeys}`);
        }
      }

      if (differences.length > 0) {
        log.error('Data verification differences found', differences);
      } else {
        log.verify('Data verification passed - all fields match');
      }

      setDebugInfo(prev => ({
        ...prev,
        lastVerification: {
          dbRow: verify,
          differences,
          verified: differences.length === 0,
        },
      }));

      return differences.length === 0;
    } catch (err) {
      log.error('Verification error', err);
      return false;
    }
  };

  const loadDraft = async () => {
    const epoch = resetEpochRef.current;

    try {
      // Don't load draft right after a successful submission (even across navigation)
      // IMPORTANT: keep the flag until the user starts editing; React 18 StrictMode can run effects twice.
      if (localStorage.getItem('inspection:just_submitted')) {
        log.load('Skipping draft load - just submitted (localStorage flag)');

        // Ensure this mount starts clean at Step 1 with empty data
        setInspectionId(null);
        setPropertyId(null);
        setFormData({});
        setStatus('draft');
        setLastSaved(null);
        pendingChangesRef.current = false;
        formDataRef.current = {};
        inspectionIdRef.current = null;
        setJustSubmitted(true);

        setLoading(false);
        return;
      }

      setLoading(true);
      log.load('Starting draft load');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        log.load('No session found, skipping draft load');
        setLoading(false);
        return;
      }

      if (isStale(epoch)) return;

      log.load('Session found', { userId: session.user.id });

      // Check for existing draft inspection for this user
      // ONLY load inspections with status 'draft' - never load completed/submitted
      const { data: inspections, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('inspector_id', session.user.id)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (isStale(epoch)) return;

      if (error) {
        log.error('Error loading draft', error);
        setLoading(false);
        return;
      }

      log.load('Draft query result', { found: inspections?.length || 0 });

      if (inspections && inspections.length > 0) {
        const draft = inspections[0];

        // Double-check status is draft (safety check)
        if (draft.status !== 'draft') {
          log.load('Skipping non-draft inspection', { status: draft.status });
          setLoading(false);
          return;
        }

        log.load('Loading draft', {
          inspectionId: draft.id,
          propertyId: draft.property_id,
          status: draft.status,
          hasChecklistData: !!draft.checklist_data,
          checklistDataKeys: draft.checklist_data ? Object.keys(draft.checklist_data as object).length : 0,
          hasChecklistRatings: !!draft.checklist_ratings,
          checklistRatingsKeys: draft.checklist_ratings ? Object.keys(draft.checklist_ratings as object).length : 0,
        });

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

        if (isStale(epoch)) return;

        setInspectionId(draft.id);
        setPropertyId(draft.property_id);
        setStatus('draft');
        setFormData(restoredData);

        toast({
          title: 'Draft Restored',
          description: 'Your previous inspection draft has been loaded.',
        });
      } else {
        log.load('No existing draft found');
      }
    } catch (error) {
      log.error('Error loading draft', error);
    } finally {
      // Only flip loading off if we didn't reset during this async run
      if (!isStale(epoch)) setLoading(false);
    }
  };

  const buildSupabasePayload = (data: InspectionFormData) => {
    const payload = {
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
    
    log.save('Built payload', {
      hasChecklistRatings: Object.keys(payload.checklist_ratings).length,
      hasChecklistNotes: Object.keys(payload.checklist_notes).length,
      hasChecklistData: Object.keys(payload.checklist_data).length,
    });
    
    return payload;
  };

  const saveToSupabase = async (data: InspectionFormData, showToast: boolean = true) => {
    const startTime = Date.now();
    const epoch = resetEpochRef.current;
    
    try {
      setSaving(true);
      pendingChangesRef.current = false;
      
      log.save('Starting save operation', { 
        hasInspectionId: !!inspectionId, 
        inspectionId,
        showToast 
      });
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        log.error('No session for save');
        toast({
          title: "Error",
          description: "You must be logged in to save.",
          variant: "destructive",
        });
        return false;
      }

      if (isStale(epoch)) return false;

      const payload = buildSupabasePayload(data);
      
      setDebugInfo(prev => ({
        ...prev,
        lastOperation: inspectionId ? 'UPDATE' : 'CREATE',
        lastPayload: payload,
      }));

      if (inspectionId) {
        // Update existing inspection
        log.update('Calling update-inspection', { 
          inspectionId, 
          payloadKeys: Object.keys(payload),
          ratingsCount: Object.keys(payload.checklist_ratings).length,
        });

        const { data: result, error } = await supabase.functions.invoke('update-inspection', {
          body: {
            inspection_id: inspectionId,
            updates: payload,
          },
        });

        log.update('Update response', { result, error, duration: Date.now() - startTime });

        if (error) {
          log.error('Update failed', error);
          setDebugInfo(prev => ({
            ...prev,
            lastResponse: { error: error.message },
            errors: [...prev.errors, `Update failed: ${error.message}`],
          }));
          
          if (showToast) {
            toast({
              title: "Save Failed",
              description: "Could not save your inspection. Please try again.",
              variant: "destructive",
            });
          }
          return false;
        }

        setDebugInfo(prev => ({
          ...prev,
          lastResponse: result,
        }));

        // Verify the save
        await verifyData(inspectionId, payload);
        
      } else {
        // Create new inspection - need a property first
        let currentPropertyId = propertyId;
        
        if (!currentPropertyId) {
          log.create('Creating property first');
          
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
            log.error('Property creation failed', propertyError);
            if (showToast) {
              toast({
                title: "Save Failed",
                description: "Could not create property. Please try again.",
                variant: "destructive",
              });
            }
            return false;
          }
          
          log.create('Property created', { propertyId: property.id });
          currentPropertyId = property.id;
          setPropertyId(currentPropertyId);
        }

        // Create the inspection
        const createBody = {
          property_id: currentPropertyId,
          inspection_date: payload.inspection_date,
          inspection_time: payload.inspection_time,
          weather_conditions: payload.weather_conditions,
          temperature: payload.temperature,
          occupancy: payload.occupancy,
          attendance: payload.attendance,
          building_types: payload.building_types,
        };

        log.create('Calling create-inspection', createBody);

        const { data: result, error } = await supabase.functions.invoke('create-inspection', {
          body: createBody,
        });

        log.create('Create response', { result, error, duration: Date.now() - startTime });

        if (error) {
          log.error('Create failed', error);
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
        log.create('Inspection created', { newInspectionId });
        
        if (newInspectionId) {
          // keep ref in sync immediately (submit can depend on it)
          inspectionIdRef.current = newInspectionId;
          setInspectionId(newInspectionId);
          
          // Now update with full form data
          log.update('Updating new inspection with full data', { newInspectionId });
          
          const updatePayload = {
            checklist_ratings: payload.checklist_ratings,
            checklist_notes: payload.checklist_notes,
            selected_defects: payload.selected_defects,
            checklist_data: payload.checklist_data,
          };

          const { data: updateResult, error: updateError } = await supabase.functions.invoke('update-inspection', {
            body: {
              inspection_id: newInspectionId,
              updates: updatePayload,
            },
          });

          log.update('Post-create update response', { updateResult, updateError });

          if (updateError) {
            log.error('Post-create update failed', updateError);
          } else {
            // Verify the save
            await verifyData(newInspectionId, updatePayload);
          }
        }

        setDebugInfo(prev => ({
          ...prev,
          lastResponse: result,
        }));
      }

      if (isStale(epoch)) return false;

      setLastSaved(new Date());
      log.save('Save completed successfully', { duration: Date.now() - startTime });
      
      if (showToast) {
        toast({
          title: "Saved",
          description: "Your inspection has been saved as a draft.",
        });
      }
      
      return true;
    } catch (error) {
      log.error('Save exception', error);
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, `Save exception: ${String(error)}`],
      }));
      
      if (showToast) {
        toast({
          title: "Save Failed",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      if (!isStale(epoch)) setSaving(false);
    }
  };

  const triggerAutoSave = useCallback(() => {
    if (!autoSaveEnabled) {
      return;
    }

    // Don't auto-save completed inspections
    if (status === 'completed') {
      log.save('Auto-save skipped - inspection is completed');
      return;
    }

    // Right after submit we reset the flow; don't auto-save the cleared form
    if (justSubmitted) {
      log.save('Auto-save skipped - just submitted/reset');
      return;
    }

    pendingChangesRef.current = true;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for debounced auto-save
    autoSaveTimerRef.current = setTimeout(() => {
      log.save('Auto-save triggered');
      saveToSupabase(formDataRef.current, false);
    }, autoSaveDelay);
  }, [autoSaveDelay, status, justSubmitted, autoSaveEnabled]);

  const clearJustSubmittedFlag = useCallback(() => {
    if (localStorage.getItem('inspection:just_submitted')) {
      localStorage.removeItem('inspection:just_submitted');
    }
    if (justSubmitted) setJustSubmitted(false);
  }, [justSubmitted]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    // If the user starts a new inspection right after submit, allow edits and re-enable autosave
    clearJustSubmittedFlag();

    // Don't update form data if completed
    if (status === 'completed') {
      log.save('Field change skipped - inspection is completed');
      return;
    }

    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });

    // Trigger auto-save
    triggerAutoSave();
  }, [triggerAutoSave, status, clearJustSubmittedFlag]);

  const handleManualSave = useCallback(async () => {
    log.save('Manual save requested');

    // If user manually saves right after submit, treat it as a new inspection start
    if (justSubmitted) {
      clearJustSubmittedFlag();
    }

    // Clear any pending auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    return saveToSupabase(formDataRef.current, true);
  }, [justSubmitted, clearJustSubmittedFlag]);

  const handleSubmit = useCallback(async () => {
    log.submit('Submit requested', { inspectionId });

    let currentInspectionId = inspectionId;

    if (!currentInspectionId) {
      log.submit('No inspection ID, saving first');
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

      // Use the ref (set synchronously in saveToSupabase) to avoid React state timing issues
      currentInspectionId = inspectionIdRef.current;

      if (!currentInspectionId) {
        toast({
          title: "Submit Failed",
          description: "Inspection ID was not created yet. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    }

    try {
      setSaving(true);
      
      // Pre-submit validation: fetch current state
      log.submit('Pre-submit check - fetching current state', { inspectionId: currentInspectionId });
      
      const { data: preCheck, error: preCheckError } = await supabase
        .from('inspections')
        .select('*')
        .eq('id', currentInspectionId)
        .single();

      if (preCheckError || !preCheck) {
        log.error('Pre-submit check failed - inspection not found', { preCheckError });
        toast({
          title: "Submit Failed",
          description: "Could not find inspection to submit.",
          variant: "destructive",
        });
        return false;
      }

      log.submit('Pre-submit state', {
        id: preCheck.id,
        status: preCheck.status,
        hasChecklistData: !!preCheck.checklist_data,
        checklistDataKeys: preCheck.checklist_data ? Object.keys(preCheck.checklist_data as object).length : 0,
        hasChecklistRatings: !!preCheck.checklist_ratings,
        checklistRatingsKeys: preCheck.checklist_ratings ? Object.keys(preCheck.checklist_ratings as object).length : 0,
      });

      // Validate checklist data exists
      const checklistData = preCheck.checklist_data as object || {};
      const checklistRatings = preCheck.checklist_ratings as object || {};
      
      if (Object.keys(checklistData).length === 0 && Object.keys(checklistRatings).length === 0) {
        log.error('Pre-submit validation failed: No checklist data');
        toast({
          title: "Submit Failed",
          description: "Checklist data is missing. Please complete the checklist before submitting.",
          variant: "destructive",
        });
        return false;
      }

      log.submit('Calling submit-inspection', { inspectionId: currentInspectionId });

      // Call submit endpoint
      const { data: result, error } = await supabase.functions.invoke('submit-inspection', {
        body: {
          inspection_id: currentInspectionId,
        },
      });

      log.submit('Submit response', { result, error });

      if (error) {
        log.error('Submit failed', error);
        toast({
          title: "Submit Failed",
          description: "Could not submit your inspection. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Post-submit verification
      const { data: postCheck } = await supabase
        .from('inspections')
        .select('*')
        .eq('id', currentInspectionId)
        .single();

      log.submit('Post-submit state', {
        id: postCheck?.id,
        status: postCheck?.status,
        finalGradeLetter: postCheck?.final_grade_letter,
        finalGradeNumeric: postCheck?.final_grade_numeric,
      });

      log.submit('Submit successful - resetting inspection flow');
      
      // Reset the form state after successful submit
      resetInspectionFlow();
      
      toast({
        title: "Inspection Submitted",
        description: "Your inspection has been submitted for review.",
      });
      
      return true;
    } catch (error) {
      log.error('Submit exception', error);
      toast({
        title: "Submit Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [inspectionId, toast, resetInspectionFlow]);

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
    justSubmitted,
    handleFieldChange,
    handleManualSave,
    handleSubmit,
    updateNavigationState,
    triggerAutoSave,
    resetInspectionFlow,
    // Debug info for debug panel
    debugInfo,
  };
}
