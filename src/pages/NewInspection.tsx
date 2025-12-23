import { useState, useEffect, useRef, useCallback, createContext } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PropertyInfo } from "@/components/Inspection/PropertyInfo";
import { InspectionDetails } from "@/components/Inspection/InspectionDetails";
import { ChecklistSection } from "@/components/Inspection/ChecklistSectionNew";
import { StepProgress } from "@/components/Inspection/StepProgress";
import { DebugPanel } from "@/components/Inspection/DebugPanel";
import { ArrowLeft, Save, Camera, ChevronRight, Loader2, Cloud, CheckCircle } from "lucide-react";
import { useInspection } from "@/hooks/useInspection";
import { cn } from "@/lib/utils";

// Context for scroll-to-top function
export const ScrollContext = createContext<() => void>(() => {});

interface NewInspectionProps {
  onBack: () => void;
  inspectionId?: string;
}

export function NewInspection({ onBack, inspectionId }: NewInspectionProps) {
  const [searchParams] = useSearchParams();
  const showDebug = searchParams.get('debug') === 'true';

  const {
    inspectionId: currentInspectionId,
    formData,
    loading,
    saving,
    lastSaved,
    status,
    isReadOnly,
    justSubmitted,
    handleFieldChange,
    handleManualSave,
    handleSubmit,
    updateNavigationState,
    debugInfo,
  } = useInspection({
    inspectionId,
    autoSaveEnabled: false,
    restoreDraftOnMount: false,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  const steps = [
    { id: 1, title: "Property Info", shortTitle: "Property" },
    { id: 2, title: "Inspection Details", shortTitle: "Details" },
    { id: 3, title: "Checklist", shortTitle: "Checklist" },
  ];

  // Restore navigation state when form data loads (skip immediately after submit)
  useEffect(() => {
    if (justSubmitted) {
      setCurrentStep(0);
      setCompletedSteps([]);
      return;
    }

    if (formData.currentStep !== undefined) {
      setCurrentStep(formData.currentStep);
    }
    if (formData.completedSteps) {
      setCompletedSteps(formData.completedSteps);
    }
  }, [formData.currentStep, formData.completedSteps, justSubmitted]);

  const getScrollParent = useCallback((node: HTMLElement | null) => {
    let current: HTMLElement | null = node;
    while (current) {
      const style = window.getComputedStyle(current);
      const overflowY = style.overflowY;
      const isScrollable = (overflowY === "auto" || overflowY === "scroll") && current.scrollHeight > current.clientHeight;
      if (isScrollable) return current;
      current = current.parentElement;
    }
    return null;
  }, []);

  // Unified scroll-to-top function (works with nested scroll containers)
  const scrollToTop = useCallback(() => {
    requestAnimationFrame(() => {
      const scrollParent = getScrollParent(contentRef.current);
      scrollParent?.scrollTo({ top: 0, behavior: "smooth" });
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [getScrollParent]);

  // Auto scroll to top when main step changes
  useEffect(() => {
    scrollToTop();
  }, [currentStep, scrollToTop]);

  // Save navigation state when step changes
  const handleStepChange = useCallback((newStep: number, newCompletedSteps?: number[]) => {
    setCurrentStep(newStep);
    if (newCompletedSteps) {
      setCompletedSteps(newCompletedSteps);
    }
    
    // Save navigation state for restoration
    updateNavigationState({
      currentStep: newStep,
      completedSteps: newCompletedSteps ?? completedSteps,
    });
  }, [completedSteps, updateNavigationState]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const newCompletedSteps = completedSteps.includes(currentStep) 
        ? completedSteps 
        : [...completedSteps, currentStep];
      handleStepChange(currentStep + 1, newCompletedSteps);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex) || stepIndex === currentStep) {
      handleStepChange(stepIndex);
    }
  };

  const handleSave = async () => {
    await handleManualSave();
  };

  const onSubmitInspection = async () => {
    const success = await handleSubmit();
    if (success) {
      // Reset local navigation state
      setCurrentStep(0);
      setCompletedSteps([]);
      // Navigate back to dashboard
      onBack();
    }
  };

  // Format last saved time
  const formatLastSaved = (date: Date | null) => {
    if (!date) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading inspection...</p>
        </div>
      </div>
    );
  }

  if (isReadOnly) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <CheckCircle className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-xl font-semibold">Inspection Submitted</h1>
          <p className="text-muted-foreground">
            This inspection has already been submitted and cannot be edited.
          </p>
          <Button onClick={onBack}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <PropertyInfo formData={formData} onChange={handleFieldChange} />;
      case 1:
        return <InspectionDetails formData={formData} onChange={handleFieldChange} />;
      case 2:
        return (
          <ScrollContext.Provider value={scrollToTop}>
            <ChecklistSection 
              formData={formData} 
              onChange={handleFieldChange} 
              onSubmit={onSubmitInspection}
            />
          </ScrollContext.Provider>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col animate-fade-in bg-background">
      {/* Unified Sticky Header - All screen sizes */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        {/* Back Button + Title Row */}
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Button variant="ghost" onClick={onBack} size="sm" className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 p-0">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <h1 className="text-base sm:text-xl font-semibold text-foreground truncate">
                New Inspection
              </h1>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Auto-save indicator */}
              {lastSaved && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                  <Cloud className="h-3 w-3" />
                  <span>Saved {formatLastSaved(lastSaved)}</span>
                </div>
              )}
              
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Camera className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSave} 
                disabled={saving}
                className={cn(
                  "h-8 w-8 p-0",
                  saving && "opacity-50"
                )}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Mobile auto-save indicator */}
          {lastSaved && (
            <div className="sm:hidden flex items-center justify-center gap-1.5 text-xs text-muted-foreground pb-2">
              <Cloud className="h-3 w-3" />
              <span>Saved {formatLastSaved(lastSaved)}</span>
            </div>
          )}
        </div>

        {/* Progress Bar - Directly below header, visually grouped */}
        <div className="border-t border-border/50 bg-muted/30">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
            <StepProgress
              steps={steps}
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
              allowNavigation={true}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable area */}
      <div ref={contentRef} className="flex-1 overflow-y-auto pb-24 sm:pb-20">
        {/* Content Container - Centered with max-width */}
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {renderStepContent()}

          {/* Navigation Buttons - Inside scroll area for mobile */}
          {currentStep !== 2 && (
            <div className="sm:hidden mt-6 flex items-center justify-between gap-3 pt-4 border-t border-border/50">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                size="sm"
                className="h-10 px-4 flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <Button onClick={handleNext} size="sm" className="h-10 px-4 flex-1">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop/Tablet Fixed Action Bar */}
      {currentStep !== 2 && (
        <div className="hidden sm:block fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              size="sm"
              className="h-9 px-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button onClick={handleNext} size="sm" className="h-9 px-6">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel - visible with ?debug=true */}
      {showDebug && (
        <DebugPanel
          inspectionId={currentInspectionId}
          status={status}
          lastSaved={lastSaved}
          saving={saving}
          debugInfo={debugInfo}
        />
      )}
    </div>
  );
}
