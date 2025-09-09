import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PropertyInfo } from "@/components/Inspection/PropertyInfo";
import { InspectionDetails } from "@/components/Inspection/InspectionDetails";
import { ChecklistSection } from "@/components/Inspection/ChecklistSection";
import { ArrowLeft, Save, Camera, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewInspectionProps {
  onBack: () => void;
}

export function NewInspection({ onBack }: NewInspectionProps) {
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const steps = [
    { title: "Property Info", component: PropertyInfo },
    { title: "Inspection Details", component: InspectionDetails },
    { title: "Roof", component: ChecklistSection },
    { title: "Exterior", component: ChecklistSection },
    { title: "Wood Decks & Balconies", component: ChecklistSection },
    { title: "Foundation Basement & Crawlspace", component: ChecklistSection },
    { title: "Heating & Cooling", component: ChecklistSection },
    { title: "Electric", component: ChecklistSection },
    { title: "Plumbing", component: ChecklistSection },
    { title: "Door & Windows", component: ChecklistSection },
    { title: "Cooking & Appliances", component: ChecklistSection },
    { title: "Green Features", component: ChecklistSection },
  ];

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="p-4 space-y-6 animate-fade-in max-w-4xl mx-auto">
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

      {/* Progress Steps */}
      <div className="flex items-center justify-between bg-card p-4 rounded-lg shadow-card">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${index <= currentStep 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {index + 1}
            </div>
            <span className={`ml-2 text-sm font-medium hidden sm:block ${
              index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                index < currentStep ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <CurrentStepComponent formData={formData} onChange={handleFieldChange} />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
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
            Save Draft
          </Button>
          <Button variant="secondary" className="flex-1 sm:flex-none">
            <Camera className="h-4 w-4 mr-2" />
            Add Photos
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