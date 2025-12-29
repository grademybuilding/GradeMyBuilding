import { useEffect, useMemo, useRef } from "react";
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

  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const orderedTabIds = useMemo(() => tabs.map((t) => t.id), [tabs]);

  // Keep the active tab fully visible on scrollable layouts
  useEffect(() => {
    const el = buttonRefs.current[activeTab];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeTab, orderedTabIds]);

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
      {/* Subcategory tabs container */}
      <div className="bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden">
        {/* Header label */}
        <div className="px-4 py-2.5 bg-muted/40 border-b border-border/40">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Subcategories
          </span>
        </div>
        
        {/* Scrollable tabs */}
        <div
          ref={containerRef}
          className="overflow-x-auto scrollbar-none scroll-smooth px-3 py-3 sm:px-4"
        >
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
                  ref={(el) => {
                    buttonRefs.current[tab.id] = el;
                  }}
                  key={tab.id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleTabClick(tab.id, index)}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap border-2",
                    // Active
                    isCurrent && "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30",
                    // Completed (purple)
                    isCompleted && !isCurrent && "bg-complete text-complete-foreground border-complete hover:bg-complete/90 shadow-sm",
                    // Skipped (orange)
                    isSkipped && !isCurrent && "bg-warning text-warning-foreground border-warning hover:bg-warning/90 shadow-sm",
                    // Locked
                    isLocked && "bg-muted/40 text-muted-foreground/50 border-border/60 cursor-not-allowed",
                    // Remaining
                    !isLocked && !isCurrent && !isDone && "bg-muted text-foreground border-border hover:border-primary/50 hover:bg-muted/80",
                    isClickable && !isCurrent && "cursor-pointer"
                  )}
                >
                  {/* Status Icon */}
                  <span
                    className={cn(
                      "flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-xs font-bold shrink-0 transition-all",
                      isCurrent && "bg-primary-foreground/25 text-primary-foreground",
                      isCompleted && !isCurrent && "bg-complete-foreground/20 text-complete-foreground",
                      isSkipped && !isCurrent && "bg-warning-foreground/20 text-warning-foreground",
                      !isDone && !isCurrent && !isLocked && "bg-background text-muted-foreground",
                      isLocked && "bg-background/60 text-muted-foreground/50"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    ) : isSkipped ? (
                      <MinusCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    ) : isLocked ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      index + 1
                    )}
                  </span>

                  {/* Tab Label */}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
