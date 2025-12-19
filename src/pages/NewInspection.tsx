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
      // Mark current step as completed
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
    // Can only navigate to completed steps or current step
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
      {/* Mobile Compact Header - Sticky */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" onClick={onBack} size="sm" className="p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-semibold text-foreground truncate">
                New Inspection
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Create a comprehensive building inspection
              </p>
            </div>
          </div>
          
          {/* Mobile quick actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Camera className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSave} className="h-8 w-8 p-0">
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Compact Step Progress - Sticky below header */}
        <div className="px-3 py-2 sm:px-4 sm:py-3 bg-card/50 border-t border-border/50">
          <StepProgress
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
            allowNavigation={true}
          />
        </div>
      </div>

      {/* Main Content - Flexible height with proper spacing */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-3 py-3 sm:px-4 sm:py-4 pb-32 sm:pb-24">
          {renderStepContent()}
        </div>
      </div>

      {/* Floating Action Bar - Fixed at bottom, respects safe areas */}
      <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border p-3 sm:p-4 safe-area-bottom">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            size="sm"
            className="h-9 px-3 sm:px-4"
          >
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} size="sm" className="h-9 px-4 sm:px-6">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} size="sm" className="h-9 px-4 sm:px-6">
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