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

const CIRCLE_SIZE = 36; // px

export function StepProgress({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  allowNavigation = false,
}: StepProgressProps) {
  const handleStepClick = (index: number) => {
    if (!allowNavigation || !onStepClick) return;
    if (completedSteps.includes(index) || index === currentStep) {
      onStepClick(index);
    }
  };

  const halfCircle = CIRCLE_SIZE / 2;

  return (
    <div className="w-full py-2">
      {/* Desktop / Tablet Horizontal Stepper */}
      <div className="hidden sm:flex items-start justify-between relative">
        {/* Track (gray line behind circles) */}
        <div
          className="absolute h-[2px] bg-border rounded-full"
          style={{ top: halfCircle, left: halfCircle, right: halfCircle }}
        />

        {/* Filled line (blue) – only when past step 0 */}
        {currentStep > 0 && (
          <div
            className="absolute h-[2px] bg-primary rounded-full transition-[width] duration-500 ease-out"
            style={{
              top: halfCircle,
              left: halfCircle,
              width: `calc(${(currentStep / (steps.length - 1)) * 100}% - ${halfCircle}px)`,
            }}
          />
        )}

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
                isClickable && "cursor-pointer group"
              )}
              onClick={() => handleStepClick(index)}
              style={{ width: CIRCLE_SIZE }}
            >
              {/* Circle */}
              <div
                className={cn(
                  "flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 border-2",
                  isCompleted &&
                    "bg-primary border-primary text-primary-foreground",
                  isCurrent &&
                    "bg-primary border-primary text-primary-foreground shadow-md ring-2 ring-primary/30",
                  isUpcoming &&
                    "bg-background border-border text-muted-foreground"
                )}
                style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Title */}
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center leading-tight transition-colors duration-300 whitespace-nowrap",
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

      {/* Mobile Horizontal Scrollable Stepper */}
      <div className="sm:hidden">
        <div className="overflow-x-auto scrollbar-none -mx-1">
          <div className="flex items-center gap-2 px-1 min-w-max">
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
                    "flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                    isCurrent && "bg-primary text-primary-foreground shadow-sm",
                    isCompleted && !isCurrent && "bg-primary/15 text-primary",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground/60",
                    isClickable && "cursor-pointer"
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                        isCurrent ? "bg-primary-foreground/20" : "bg-background/60"
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                  <span>{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
