import { cn } from "@/lib/utils";
import { Check, Lock } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Tab {
  id: string;
  label: string;
}

interface ChecklistTabsProps {
  tabs: Tab[];
  activeTab: string;
  completedTabs: string[];
  onTabChange: (tabId: string) => void;
  allowNavigation?: boolean;
}

export function ChecklistTabs({
  tabs,
  activeTab,
  completedTabs,
  onTabChange,
  allowNavigation = true,
}: ChecklistTabsProps) {
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  const handleTabClick = (tabId: string, index: number) => {
    if (!allowNavigation) return;

    // Can navigate to completed tabs or the next available tab
    const isCompleted = completedTabs.includes(tabId);
    const isNext = index === completedTabs.length;
    const isCurrent = tabId === activeTab;

    if (isCompleted || isNext || isCurrent) {
      onTabChange(tabId);
    }
  };

  return (
    <div className="w-full">
      {/* Horizontal Scrollable Pill Tabs */}
      <div className="overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 sm:gap-2 p-1 bg-muted/30 rounded-lg min-w-max">
          {tabs.map((tab, index) => {
            const isCompleted = completedTabs.includes(tab.id);
            const isCurrent = tab.id === activeTab;
            const isLocked = !isCompleted && !isCurrent && index > completedTabs.length;
            const isClickable = allowNavigation && (isCompleted || isCurrent || index === completedTabs.length);

            return (
              <button
                key={tab.id}
                type="button"
                disabled={isLocked}
                onClick={() => handleTabClick(tab.id, index)}
                className={cn(
                  "relative flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap",
                  isCurrent && "bg-background text-foreground shadow-sm",
                  isCompleted && !isCurrent && "text-primary hover:bg-background/50",
                  isLocked && "text-muted-foreground/40 cursor-not-allowed",
                  !isLocked && !isCurrent && "hover:text-foreground hover:bg-background/30",
                  isClickable && !isCurrent && "cursor-pointer"
                )}
              >
                {/* Status Icon */}
                <span
                  className={cn(
                    "flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[10px] sm:text-xs font-semibold shrink-0",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && !isCompleted && "bg-primary/20 text-primary border border-primary",
                    isLocked && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  ) : isLocked ? (
                    <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
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
