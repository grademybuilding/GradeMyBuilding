import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InspectionFormData {
  // Property Info (used by PropertyInfo form component)
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  propertyType?: string;
  yearBuilt?: string;
  squareFootage?: string;
  ownerContact?: string;
  
  // Legacy property field names (for backwards compatibility)
  propertyAddress?: string;
  propertyCity?: string;
  propertyState?: string;
  propertyZip?: string;
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
  
  // Allow dynamic keys for form fields
  [key: string]: any;
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

// Debug logging helper (disabled for production)
const DEBUG_PREFIX = '[INSPECTION]';
const log = {
  save: (_msg: string, _data?: any) => {},
  create: (_msg: string, _data?: any) => {},
  update: (_msg: string, _data?: any) => {},
  submit: (_msg: string, _data?: any) => {},
  load: (_msg: string, _data?: any) => {},
  verify: (_msg: string, _data?: any) => {},
  error: (_msg: string, _data?: any) => {},
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
  const propertyIdRef = useRef<string | null>(propertyId);
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

  useEffect(() => {
    propertyIdRef.current = propertyId;
  }, [propertyId]);

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
    propertyIdRef.current = null;

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
        .select('*, properties(*)')
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
        checklistDataKeys: inspection.checklist_data ? Object.keys(inspection.checklist_data as object).length : 0,
        hasPropertyData: !!inspection.properties,
      });

      // Restore form data from checklist_data JSONB
      const savedData = (inspection.checklist_data as InspectionFormData) || {};
      
      // Get property data from the properties table (if available)
      const propertyData = inspection.properties as {
        address?: string;
        city?: string;
        state?: string;
        zip_code?: string;
        property_type?: string;
        year_built?: number;
        square_footage?: number;
        owner_name?: string;
        owner_email?: string;
        owner_phone?: string;
      } | null;

      // Merge property data into form fields (property table takes precedence over checklist_data for property fields)
      const restoredData: InspectionFormData = {
        ...savedData,
        // Property info - prefer property table, then current field names, then legacy field names
        address:
          propertyData?.address ||
          (savedData as any).address ||
          (savedData as any).propertyAddress ||
          '',
        city:
          propertyData?.city ||
          (savedData as any).city ||
          (savedData as any).propertyCity ||
          '',
        state:
          propertyData?.state ||
          (savedData as any).state ||
          (savedData as any).propertyState ||
          '',
        zipCode:
          propertyData?.zip_code ||
          (savedData as any).zipCode ||
          (savedData as any).propertyZip ||
          '',
        propertyType:
          propertyData?.property_type ||
          (savedData as any).propertyType ||
          'residential',
        yearBuilt:
          propertyData?.year_built?.toString() ||
          (savedData as any).yearBuilt ||
          '',
        squareFootage:
          propertyData?.square_footage?.toString() ||
          (savedData as any).squareFootage ||
          '',
        ownerContact:
          propertyData?.owner_name
            ? `${propertyData.owner_name}${propertyData.owner_phone ? ', ' + propertyData.owner_phone : ''}${propertyData.owner_email ? ', ' + propertyData.owner_email : ''}`
            : (savedData as any).ownerContact || (savedData as any).ownerInfo || '',
        // Inspection details
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

      // If draft has no saved form data, tell user (common cause of "resume opens empty form")
      const restoredKeys = Object.keys(restoredData).filter((k) => restoredData[k] !== undefined && restoredData[k] !== null && restoredData[k] !== '');
      log.load('Restored form data summary', {
        restoredKeysCount: restoredKeys.length,
        sample: {
          address: (restoredData as any).address,
          city: (restoredData as any).city,
          propertyType: (restoredData as any).propertyType,
          inspectionDate: restoredData.inspectionDate,
        },
      });

      // Set inspection ID and property ID, update refs immediately for save operations
      setInspectionId(inspection.id);
      inspectionIdRef.current = inspection.id;
      setPropertyId(inspection.property_id);
      propertyIdRef.current = inspection.property_id;
      setStatus(inspection.status === 'completed' ? 'completed' : 'draft');
      setFormData(restoredData);
      formDataRef.current = restoredData;
      setJustSubmitted(false);

      if (restoredKeys.length === 0) {
        toast({
          title: 'Nothing to Resume',
          description: 'This draft has no saved form data yet. Please start filling the form and click Save.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Inspection Loaded',
          description: 'Continuing from where you left off.',
        });
      }

      log.load('State updated after resume', {
        inspectionId: inspection.id,
        propertyId: inspection.property_id,
        formDataKeys: Object.keys(restoredData).length,
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
          // Property fields (support current + legacy keys)
          address: (savedData as any).address || (savedData as any).propertyAddress || '',
          city: (savedData as any).city || (savedData as any).propertyCity || '',
          state: (savedData as any).state || (savedData as any).propertyState || '',
          zipCode: (savedData as any).zipCode || (savedData as any).propertyZip || '',
          propertyType: (savedData as any).propertyType || 'residential',
          // Inspection fields
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
        inspectionIdRef.current = draft.id;
        setPropertyId(draft.property_id);
        propertyIdRef.current = draft.property_id;
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
    
    // Use refs to get stable values (avoid React state closure issues)
    let currentInspectionId = inspectionIdRef.current;
    let currentPropertyId = propertyIdRef.current;
    
    try {
      setSaving(true);
      pendingChangesRef.current = false;
      
      log.save('Starting save operation', { 
        inspectionIdFromRef: currentInspectionId,
        inspectionIdFromState: inspectionId,
        propertyIdFromRef: currentPropertyId,
        propertyIdFromState: propertyId,
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
      
      // If we don't have an inspection ID but have a property ID, check for existing draft
      if (!currentInspectionId && currentPropertyId) {
        log.save('No inspection ID but have property ID - checking for existing draft', { 
          propertyId: currentPropertyId 
        });
        
        const { data: existingDraft } = await supabase
          .from('inspections')
          .select('id')
          .eq('inspector_id', session.user.id)
          .eq('property_id', currentPropertyId)
          .in('status', ['draft', 'in_progress'])
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (existingDraft) {
          log.save('Found existing draft for property - reusing', { 
            existingInspectionId: existingDraft.id,
            propertyId: currentPropertyId 
          });
          currentInspectionId = existingDraft.id;
          inspectionIdRef.current = existingDraft.id;
          setInspectionId(existingDraft.id);
        }
      }
      
      setDebugInfo(prev => ({
        ...prev,
        lastOperation: currentInspectionId ? 'UPDATE' : 'CREATE',
        lastPayload: payload,
      }));

      if (currentInspectionId) {
        // Update existing inspection
        log.update('Calling update-inspection', { 
          inspectionId: currentInspectionId, 
          payloadKeys: Object.keys(payload),
          ratingsCount: Object.keys(payload.checklist_ratings).length,
        });

        // Also update property if it exists
        if (currentPropertyId) {
          log.update('Updating existing property', { propertyId: currentPropertyId });
          
          const propertyPayload: Record<string, any> = {};
          // Support both new field names (address, city) and legacy names (propertyAddress, propertyCity)
          const address = data.address || data.propertyAddress;
          const city = data.city || data.propertyCity;
          const state = data.state || data.propertyState;
          const zipCode = data.zipCode || data.propertyZip;
          
          if (address) propertyPayload.address = address;
          if (city) propertyPayload.city = city;
          if (state) propertyPayload.state = state;
          if (zipCode) propertyPayload.zip_code = zipCode;
          if (data.propertyType) propertyPayload.property_type = data.propertyType;
          if (data.yearBuilt) propertyPayload.year_built = parseInt(data.yearBuilt);
          if (data.squareFootage) propertyPayload.square_footage = parseInt(data.squareFootage);
          
          if (Object.keys(propertyPayload).length > 0) {
            const { error: propUpdateError } = await supabase
              .from('properties')
              .update(propertyPayload)
              .eq('id', currentPropertyId);
            
            if (propUpdateError) {
              log.error('Property update failed', propUpdateError);
            } else {
              log.update('Property updated successfully', { propertyId: currentPropertyId });
            }
          }
        }

        const { data: result, error } = await supabase.functions.invoke('update-inspection', {
          body: {
            inspection_id: currentInspectionId,
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
        await verifyData(currentInspectionId, payload);
        
      } else {
        // Create new inspection - need a property first
        
        if (!currentPropertyId) {
          // Support both new field names and legacy names
          const address = data.address || data.propertyAddress;
          const city = data.city || data.propertyCity;
          const state = data.state || data.propertyState;
          const zipCode = data.zipCode || data.propertyZip;
          
          // Check if there's an existing property with same address for this user
          if (address && city && state) {
            log.create('Checking for existing property with same address');
            
            const { data: existingProperty } = await supabase
              .from('properties')
              .select('id')
              .eq('created_by', session.user.id)
              .eq('address', address)
              .eq('city', city)
              .eq('state', state)
              .limit(1)
              .maybeSingle();
            
            if (existingProperty) {
              log.create('Found existing property with same address - reusing', { 
                propertyId: existingProperty.id 
              });
              currentPropertyId = existingProperty.id;
              propertyIdRef.current = existingProperty.id;
              setPropertyId(existingProperty.id);
              
              // Update the existing property with latest data
              const propertyPayload: Record<string, any> = {
                zip_code: zipCode || '00000',
                property_type: data.propertyType || 'residential',
              };
              if (data.yearBuilt) propertyPayload.year_built = parseInt(data.yearBuilt);
              if (data.squareFootage) propertyPayload.square_footage = parseInt(data.squareFootage);
              
              await supabase
                .from('properties')
                .update(propertyPayload)
                .eq('id', existingProperty.id);
            }
          }
        
          if (!currentPropertyId) {
            log.create('Creating new property');
            
            const address = data.address || data.propertyAddress;
            const city = data.city || data.propertyCity;
            const state = data.state || data.propertyState;
            const zipCode = data.zipCode || data.propertyZip;
            
            const { data: property, error: propertyError } = await supabase
              .from('properties')
              .insert({
                address: address || 'Draft Property',
                city: city || 'Unknown',
                state: state || 'Unknown',
                zip_code: zipCode || '00000',
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
          propertyIdRef.current = property.id;
          setPropertyId(property.id);
          }
        }

        // Before creating inspection, check if draft already exists for this property
        log.create('Checking for existing draft inspection for property', { propertyId: currentPropertyId });
        
        const { data: existingInspection } = await supabase
          .from('inspections')
          .select('id')
          .eq('inspector_id', session.user.id)
          .eq('property_id', currentPropertyId)
          .in('status', ['draft', 'in_progress'])
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (existingInspection) {
          log.create('Found existing draft inspection - updating instead of creating', { 
            existingInspectionId: existingInspection.id 
          });
          
          currentInspectionId = existingInspection.id;
          inspectionIdRef.current = existingInspection.id;
          setInspectionId(existingInspection.id);
          
          // Update the existing inspection
          const { data: result, error } = await supabase.functions.invoke('update-inspection', {
            body: {
              inspection_id: currentInspectionId,
              updates: payload,
            },
          });
          
          log.update('Update existing draft response', { result, error });
          
          if (error) {
            log.error('Update existing draft failed', error);
            if (showToast) {
              toast({
                title: "Save Failed",
                description: "Could not update inspection. Please try again.",
                variant: "destructive",
              });
            }
            return false;
          }
          
          await verifyData(currentInspectionId, payload);
          
        } else {
          // Create new inspection
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
            // Keep ref in sync immediately (submit can depend on it)
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
