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
      {/* Ultra-Compact Header - Minimal height on mobile */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        {/* Mobile: Single-line header */}
        <div className="flex items-center justify-between px-2 py-1.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <Button variant="ghost" onClick={onBack} size="sm" className="p-1 h-7 w-7 sm:h-9 sm:w-9 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-sm sm:text-xl font-semibold text-foreground truncate">
              New Inspection
            </h1>
          </div>
          
          {/* Mobile quick actions - smaller */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 sm:h-8 sm:w-8">
              <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSave} className="h-7 w-7 p-0 sm:h-8 sm:w-8">
              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Compact Step Progress - Integrated with header */}
        <div className="px-2 py-1.5 sm:px-4 sm:py-2 bg-muted/30">
          <StepProgress
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
            allowNavigation={true}
          />
        </div>
      </div>

      {/* Main Content - Maximize vertical space */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-2 py-2 sm:px-4 sm:py-4 pb-28 sm:pb-24">
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