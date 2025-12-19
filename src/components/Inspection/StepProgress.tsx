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

      {/* Mobile Compact Stepper - Minimal height pill style */}
      <div className="sm:hidden">
        <div className="flex items-center gap-1">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = index === currentStep;
            const isClickable = allowNavigation && (isCompleted || isCurrent);

            return (
              <button
                key={step.id}
                type="button"
                disabled={!isClickable}
                onClick={() => handleStepClick(index)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-md text-[11px] font-medium transition-all",
                  isCurrent && "bg-primary text-primary-foreground",
                  isCompleted && !isCurrent && "bg-primary/20 text-primary",
                  !isCompleted && !isCurrent && "bg-muted/60 text-muted-foreground/60",
                  isClickable && "cursor-pointer"
                )}
              >
                {/* Checkmark or number - compact */}
                {isCompleted && !isCurrent ? (
                  <Check className="h-3 w-3 shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-background/20 flex items-center justify-center text-[9px] font-bold shrink-0">
                    {index + 1}
                  </span>
                )}
                <span className="truncate">{step.shortTitle || step.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
