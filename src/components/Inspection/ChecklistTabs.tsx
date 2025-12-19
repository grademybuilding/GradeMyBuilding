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
      {/* Horizontal Scrollable Tabs */}
      <div className="overflow-x-auto scrollbar-none -mx-3 px-3 sm:-mx-4 sm:px-4">
        <div className="flex items-center gap-2 min-w-max">
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
                  "relative flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap border",
                  isCurrent && "bg-background text-foreground shadow-sm border-border",
                  isCompleted && !isCurrent && "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15",
                  isLocked && "bg-muted/30 text-muted-foreground/40 border-transparent cursor-not-allowed",
                  !isLocked && !isCurrent && !isCompleted && "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted",
                  isClickable && !isCurrent && "cursor-pointer"
                )}
              >
                {/* Status Icon */}
                <span
                  className={cn(
                    "flex items-center justify-center w-5 h-5 sm:w-5 sm:h-5 rounded-full text-[10px] sm:text-xs font-semibold shrink-0",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && !isCompleted && "bg-primary/20 text-primary",
                    isLocked && "bg-muted text-muted-foreground/50"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3" />
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
