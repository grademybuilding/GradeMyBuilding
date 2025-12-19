import { useState } from "react";
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

  const steps = [
    { id: 1, title: "Property Info", shortTitle: "Property" },
    { id: 2, title: "Inspection Details", shortTitle: "Details" },
    { id: 3, title: "Checklist", shortTitle: "Checklist" },
  ];

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
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Desktop/Tablet Header - Hidden on mobile */}
      <div className="hidden sm:block sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" onClick={onBack} size="sm" className="h-9 w-9 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground truncate">
              New Inspection
            </h1>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="sm" className="h-8 w-8">
              <Camera className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSave} className="h-8 w-8">
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop Step Progress */}
        <div className="px-4 py-2 bg-muted/30">
          <StepProgress
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
            allowNavigation={true}
          />
        </div>
      </div>

      {/* Mobile: Scrollable Progress Bar inside content */}
      <div className="sm:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 px-3 py-2">
        <StepProgress
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
          allowNavigation={true}
        />
      </div>

      {/* Main Content - Scrollable area with buttons inside */}
      <div className="flex-1 overflow-y-auto pb-32 sm:pb-4">
        <div className="max-w-5xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
          {renderStepContent()}

          {/* Navigation Buttons - INSIDE scroll area, mobile only shows here */}
          <div className="mt-6 sm:hidden flex items-center justify-between gap-3 pb-4">
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

      {/* Desktop/Tablet Fixed Action Bar - Hidden on mobile */}
      <div className="hidden sm:block fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border p-4 safe-area-bottom">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
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

      {/* Mobile Bottom Header Panel - Above system bottom nav */}
      <div className="sm:hidden fixed bottom-16 left-0 right-0 z-40 bg-background border-t border-border safe-area-bottom">
        <div className="flex items-center justify-between px-3 py-2">
          <Button variant="ghost" onClick={onBack} size="sm" className="h-9 w-9 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <h1 className="text-sm font-semibold text-foreground truncate max-w-[180px]">
            New Inspection
          </h1>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Camera className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSave} className="h-9 w-9 p-0">
              <Save className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}