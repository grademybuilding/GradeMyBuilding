import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  shortTitle?: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepIndex: number) => void;
  allowNavigation?: boolean;
}

export function StepProgress({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  allowNavigation = false,
}: StepProgressProps) {
  const handleStepClick = (index: number) => {
    if (!allowNavigation || !onStepClick) return;
    
    // Can only navigate to completed steps or current step
    if (completedSteps.includes(index) || index === currentStep) {
      onStepClick(index);
    }
  };

  return (
    <div className="w-full">
      {/* Desktop/Tablet Horizontal Stepper */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted mx-12" />
        
        {/* Progress Line Filled */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-primary mx-12 transition-all duration-500"
          style={{ 
            width: `calc(${(currentStep / (steps.length - 1)) * 100}% - 6rem)`,
          }}
        />

        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;
          const isUpcoming = !isCompleted && !isCurrent;
          const isClickable = allowNavigation && (isCompleted || isCurrent);

          return (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center relative z-10",
                isClickable && "cursor-pointer"
              )}
              onClick={() => handleStepClick(index)}
            >
              {/* Step Circle */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20",
                  isUpcoming && "bg-background border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step Title */}
              <span
                className={cn(
                  "mt-2 text-sm font-medium text-center max-w-[100px] transition-colors duration-300",
                  isCurrent && "text-primary",
                  isCompleted && "text-foreground",
                  isUpcoming && "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Compact Stepper */}
      <div className="sm:hidden">
        {/* Current Step Indicator */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-primary font-semibold">
            {steps[currentStep]?.title}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ 
              width: `${((currentStep + 1) / steps.length) * 100}%` 
            }}
          />
        </div>

        {/* Step Dots */}
        <div className="flex justify-between mt-2 px-1">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = index === currentStep;

            return (
              <button
                key={step.id}
                type="button"
                disabled={!allowNavigation || (!isCompleted && !isCurrent)}
                onClick={() => handleStepClick(index)}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/30",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                  allowNavigation && (isCompleted || isCurrent) && "cursor-pointer hover:scale-110"
                )}
              >
                {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
