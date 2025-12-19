import { cn } from "@/lib/utils";
import { Check, Lock, MinusCircle } from "lucide-react";

interface Tab {
  id: string;
  label: string;
}

interface ChecklistTabsProps {
  tabs: Tab[];
  activeTab: string;
  completedTabs: string[];
  skippedTabs?: string[];
  onTabChange: (tabId: string) => void;
  allowNavigation?: boolean;
}

export function ChecklistTabs({
  tabs,
  activeTab,
  completedTabs,
  skippedTabs = [],
  onTabChange,
  allowNavigation = true,
}: ChecklistTabsProps) {
  const doneTabsSet = new Set([...completedTabs, ...skippedTabs]);
  const doneCount = tabs.filter((t) => doneTabsSet.has(t.id)).length;

  const handleTabClick = (tabId: string, index: number) => {
    if (!allowNavigation) return;

    // Can navigate to done tabs (completed/skipped) or the next available tab
    const isDone = doneTabsSet.has(tabId);
    const isNext = index === doneCount;
    const isCurrent = tabId === activeTab;

    if (isDone || isNext || isCurrent) {
      onTabChange(tabId);
    }
  };

  return (
    <div className="w-full">
      {/* Responsive Tabs: Wrap on desktop, scroll on mobile */}
      <div className="overflow-x-auto scrollbar-none md:overflow-x-visible -mx-3 px-3 sm:-mx-4 sm:px-4">
        <div className="flex items-center gap-2 min-w-max md:min-w-0 md:flex-wrap">
          {tabs.map((tab, index) => {
            const isCompleted = completedTabs.includes(tab.id);
            const isSkipped = skippedTabs.includes(tab.id);
            const isDone = isCompleted || isSkipped;
            const isCurrent = tab.id === activeTab;
            const isLocked = !isDone && !isCurrent && index > doneCount;
            const isClickable = allowNavigation && (isDone || isCurrent || index === doneCount);

            return (
              <button
                key={tab.id}
                type="button"
                disabled={isLocked}
                onClick={() => handleTabClick(tab.id, index)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap border",
                  isCurrent && "bg-background text-foreground shadow-sm border-border",
                  isCompleted && !isCurrent && "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15",
                  isSkipped && !isCurrent && "bg-muted/60 text-muted-foreground border-border/50 hover:bg-muted",
                  isLocked && "bg-muted/30 text-muted-foreground/40 border-transparent cursor-not-allowed",
                  !isLocked && !isCurrent && !isDone && "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted",
                  isClickable && !isCurrent && "cursor-pointer"
                )}
              >
                {/* Status Icon */}
                <span
                  className={cn(
                    "flex items-center justify-center w-5 h-5 sm:w-5 sm:h-5 rounded-full text-[10px] sm:text-xs font-semibold shrink-0",
                    isCompleted && "bg-primary text-primary-foreground",
                    isSkipped && "bg-muted text-muted-foreground",
                    isCurrent && !isDone && "bg-primary/20 text-primary",
                    isLocked && "bg-muted text-muted-foreground/50"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3" />
                  ) : isSkipped ? (
                    <MinusCircle className="h-3 w-3" />
                  ) : isLocked ? (
                    <Lock className="h-3 w-3" />
                  ) : (
                    index + 1
                  )}
                </span>

                {/* Tab Label - Full text, no truncation */}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
