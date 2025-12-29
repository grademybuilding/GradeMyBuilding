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
                    // Active: Solid primary with shadow
                    isCurrent && "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30",
                    // Completed: Solid green with white text
                    isCompleted && !isCurrent && "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-sm",
                    // Skipped: Solid amber with white text
                    isSkipped && !isCurrent && "bg-amber-500 text-white border-amber-500 hover:bg-amber-600 shadow-sm",
                    // Locked: Light muted
                    isLocked && "bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 cursor-not-allowed",
                    // Remaining (accessible): Light gray with visible border
                    !isLocked && !isCurrent && !isDone && "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-slate-200 dark:hover:bg-slate-700",
                    isClickable && !isCurrent && "cursor-pointer"
                  )}
                >
                  {/* Status Icon */}
                  <span
                    className={cn(
                      "flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-xs font-bold shrink-0 transition-all",
                      // Active: Semi-transparent white
                      isCurrent && "bg-white/25 text-primary-foreground",
                      // Completed: White circle with green check
                      isCompleted && !isCurrent && "bg-white/30 text-white",
                      // Skipped: White circle with amber icon
                      isSkipped && !isCurrent && "bg-white/30 text-white",
                      // Remaining: Visible number circle
                      !isDone && !isCurrent && !isLocked && "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
                      // Locked: Muted circle
                      isLocked && "bg-slate-200 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500"
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
