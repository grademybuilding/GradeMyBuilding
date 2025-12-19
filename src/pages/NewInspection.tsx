import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PropertyInfo } from "@/components/Inspection/PropertyInfo";
import { InspectionDetails } from "@/components/Inspection/InspectionDetails";
import { ChecklistSection } from "@/components/Inspection/ChecklistSectionNew";
import { StepProgress } from "@/components/Inspection/StepProgress";
import { ArrowLeft, Save, Camera, FileText, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewInspectionProps {
  onBack: () => void;
}

export function NewInspection({ onBack }: NewInspectionProps) {
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  const steps = [
    { id: 1, title: "Property Info", shortTitle: "Property" },
    { id: 2, title: "Inspection Details", shortTitle: "Details" },
    { id: 3, title: "Checklist", shortTitle: "Checklist" },
  ];

  // Auto scroll to top when step changes
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex) || stepIndex === currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const handleSave = () => {
    toast({
      title: "Inspection Saved",
      description: "Your inspection has been saved successfully.",
    });
    console.log("Saving inspection:", formData);
  };

  const handleSubmit = () => {
    toast({
      title: "Inspection Submitted",
      description: "Your inspection has been submitted for review.",
    });
    console.log("Submitting inspection:", formData);
    onBack();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <PropertyInfo formData={formData} onChange={handleFieldChange} />;
      case 1:
        return <InspectionDetails formData={formData} onChange={handleFieldChange} />;
      case 2:
        return <ChecklistSection formData={formData} onChange={handleFieldChange} />;
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
            
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Camera className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSave} className="h-8 w-8 p-0">
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
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

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} size="sm" className="h-10 px-4 flex-1">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} size="sm" className="h-10 px-4 flex-1">
                <FileText className="h-4 w-4 mr-1" />
                Submit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Fixed Action Bar */}
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
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} size="sm" className="h-9 px-6">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} size="sm" className="h-9 px-6">
                <FileText className="h-4 w-4 mr-2" />
                Submit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}