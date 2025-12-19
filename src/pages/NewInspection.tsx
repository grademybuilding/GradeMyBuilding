import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PropertyInfo } from "@/components/Inspection/PropertyInfo";
import { InspectionDetails } from "@/components/Inspection/InspectionDetails";
import { ChecklistSection } from "@/components/Inspection/ChecklistSectionNew";
import { StepProgress } from "@/components/Inspection/StepProgress";
import { ArrowLeft, Save, Camera, FileText } from "lucide-react";
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
    <div className="p-4 space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Inspection</h1>
          <p className="text-muted-foreground">Create a comprehensive building inspection</p>
        </div>
      </div>

      {/* Step Progress - Horizontal Stepper */}
      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-card border border-border">
        <StepProgress
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
          allowNavigation={true}
        />
      </div>

      {/* Current Step Content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border sticky bottom-0 bg-background pb-4">
        <div className="flex gap-2 flex-1">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handlePrev} className="flex-1 sm:flex-none">
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} className="flex-1">
              Next Step
            </Button>
          ) : null}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} className="flex-1 sm:flex-none">
            <Save className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Save Draft</span>
            <span className="sm:hidden">Save</span>
          </Button>
          <Button variant="secondary" className="flex-1 sm:flex-none">
            <Camera className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Photos</span>
            <span className="sm:hidden">Photos</span>
          </Button>
          {currentStep === steps.length - 1 && (
            <Button onClick={handleSubmit} className="flex-1 sm:flex-none">
              <FileText className="h-4 w-4 mr-2" />
              Submit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}