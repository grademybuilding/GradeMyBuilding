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
      {/* Desktop/Tablet Horizontal Tabs */}
      <ScrollArea className="w-full">
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border">
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
                  "relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap min-w-fit",
                  isCurrent && "bg-background text-foreground shadow-sm",
                  isCompleted && !isCurrent && "text-foreground hover:bg-background/50",
                  isLocked && "text-muted-foreground/50 cursor-not-allowed",
                  !isLocked && !isCurrent && "hover:text-foreground",
                  isClickable && !isCurrent && "cursor-pointer"
                )}
              >
                {/* Status Icon */}
                <span
                  className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold shrink-0",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && !isCompleted && "bg-primary/20 text-primary border border-primary",
                    isLocked && "bg-muted text-muted-foreground"
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

                {/* Tab Label */}
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.label.length > 12 ? tab.label.slice(0, 10) + '...' : tab.label}</span>

                {/* Active Indicator */}
                {isCurrent && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>

      {/* Mobile: Vertical Stack Option (for many tabs) */}
      {tabs.length > 4 && (
        <div className="sm:hidden mt-2 text-xs text-muted-foreground text-center">
          Scroll horizontally to see all sections →
        </div>
      )}
    </div>
  );
}
