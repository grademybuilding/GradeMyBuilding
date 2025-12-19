import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChecklistTabs } from "./ChecklistTabs";
import { ChecklistCategoryContent } from "./ChecklistCategoryContent";
import { CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// Main inspection categories for the sidebar/menu navigation
const inspectionCategories = [
  { id: 'roof', label: 'Roof', subcategories: ['Coverings', 'Roof Drainage Systems', 'Flashing', 'Skylights & Chimneys', 'Eaves, Soffits & Fascia'] },
  { id: 'exterior', label: 'Exterior Cladding', subcategories: [] },
  { id: 'walkways', label: 'Walkways, Patios & Driveways', subcategories: [] },
  { id: 'decks', label: 'Wood Decks & Balconies', subcategories: [] },
  { id: 'foundation', label: 'Foundation & Structure', subcategories: ['Foundation', 'Basement & Crawlspace', 'Floor Structure', 'Wall Structure', 'Ceiling Structure'] },
  { id: 'plumbing', label: 'Plumbing', subcategories: ['Water Supply', 'Drain Waste Vent', 'Water Heater', 'Fixtures'] },
  { id: 'electric', label: 'Electric', subcategories: ['Service Entrance', 'Branch Circuits', 'Connected Devices'] },
  { id: 'hvac', label: 'Heating & Cooling', subcategories: ['Heating Equipment', 'Cooling Equipment', 'Operating Controls', 'Distribution Systems', 'Vents & Flues'] },
  { id: 'doors-windows', label: 'Doors & Windows', subcategories: ['Windows', 'Entry Doors', 'Interior Doors', 'Garage Doors'] },
  { id: 'appliances', label: 'Built-in Appliances', subcategories: ['Refrigerator', 'Range/Oven/Cooktop', 'Dishwasher', 'Built-in Microwave', 'Garbage Disposal', 'Cooking Exhaust'] },
  { id: 'green', label: 'Green Features', subcategories: [] },
];

interface ChecklistSectionProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function ChecklistSection({ formData, onChange }: ChecklistSectionProps) {
  // State for navigation
  const [activeMainCategory, setActiveMainCategory] = useState(0);
  const [activeSubcategory, setActiveSubcategory] = useState(0);
  const [completedCategories, setCompletedCategories] = useState<number[]>([]);
  const [completedSubcategories, setCompletedSubcategories] = useState<Record<number, string[]>>({});

  const currentCategory = inspectionCategories[activeMainCategory];
  const hasSubcategories = currentCategory.subcategories.length > 0;

  // Generate tabs for current category
  const currentTabs = useMemo(() => {
    if (!hasSubcategories) {
      return [{ id: 'main', label: currentCategory.label }];
    }
    return currentCategory.subcategories.map((sub, idx) => ({
      id: `${currentCategory.id}-${idx}`,
      label: sub,
    }));
  }, [currentCategory, hasSubcategories]);

  // Get completed tabs for current category
  const currentCompletedTabs = useMemo(() => {
    return completedSubcategories[activeMainCategory] || [];
  }, [completedSubcategories, activeMainCategory]);

  // Handle tab completion and auto-advance
  const handleCompleteSubcategory = useCallback(() => {
    const currentTabId = currentTabs[activeSubcategory]?.id;
    
    // Mark current tab as completed
    setCompletedSubcategories(prev => ({
      ...prev,
      [activeMainCategory]: [...(prev[activeMainCategory] || []), currentTabId],
    }));

    // Auto-advance to next tab or next category
    if (activeSubcategory < currentTabs.length - 1) {
      // Move to next tab
      setActiveSubcategory(activeSubcategory + 1);
    } else {
      // All tabs completed, mark category as complete and move to next
      setCompletedCategories(prev => [...prev, activeMainCategory]);
      if (activeMainCategory < inspectionCategories.length - 1) {
        setActiveMainCategory(activeMainCategory + 1);
        setActiveSubcategory(0);
      }
    }
  }, [activeSubcategory, activeMainCategory, currentTabs]);

  // Handle tab change
  const handleTabChange = useCallback((tabId: string) => {
    const tabIndex = currentTabs.findIndex(t => t.id === tabId);
    if (tabIndex !== -1) {
      setActiveSubcategory(tabIndex);
    }
  }, [currentTabs]);

  // Handle category change from sidebar
  const handleCategoryChange = useCallback((categoryIndex: number) => {
    // Can only navigate to completed categories or the next available one
    if (completedCategories.includes(categoryIndex) || categoryIndex <= completedCategories.length) {
      setActiveMainCategory(categoryIndex);
      setActiveSubcategory(0);
    }
  }, [completedCategories]);

  // Navigation buttons
  const handlePrevious = useCallback(() => {
    if (activeSubcategory > 0) {
      setActiveSubcategory(activeSubcategory - 1);
    } else if (activeMainCategory > 0) {
      const prevCategoryIndex = activeMainCategory - 1;
      const prevCategory = inspectionCategories[prevCategoryIndex];
      setActiveMainCategory(prevCategoryIndex);
      setActiveSubcategory(
        prevCategory.subcategories.length > 0 
          ? prevCategory.subcategories.length - 1 
          : 0
      );
    }
  }, [activeSubcategory, activeMainCategory]);

  const canGoPrevious = activeMainCategory > 0 || activeSubcategory > 0;
  const isLastTab = activeSubcategory === currentTabs.length - 1;
  const isLastCategory = activeMainCategory === inspectionCategories.length - 1;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Category Navigation - Scrollable Chip Row */}
      <div className="sticky top-0 z-20 -mx-3 px-3 sm:-mx-4 sm:px-4 py-2 bg-background/95 backdrop-blur-sm">
        <div className="overflow-x-auto scrollbar-none -mx-3 px-3 sm:-mx-4 sm:px-4">
          <div className="flex items-center gap-2 min-w-max pb-1">
            {inspectionCategories.map((category, index) => {
              const isCompleted = completedCategories.includes(index);
              const isCurrent = index === activeMainCategory;
              const isAccessible = isCompleted || index <= completedCategories.length;

              return (
                <button
                  key={category.id}
                  type="button"
                  disabled={!isAccessible}
                  onClick={() => handleCategoryChange(index)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all",
                    isCurrent && "bg-primary text-primary-foreground shadow-md",
                    isCompleted && !isCurrent && "bg-primary/15 text-primary hover:bg-primary/25",
                    !isCompleted && !isCurrent && isAccessible && "bg-muted text-muted-foreground hover:bg-muted/80",
                    !isAccessible && "bg-muted/50 text-muted-foreground/40 cursor-not-allowed"
                  )}
                >
                  {/* Checkmark for completed */}
                  {isCompleted && (
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                  )}
                  
                  {/* Step number for current/upcoming */}
                  {!isCompleted && (
                    <span className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0",
                      isCurrent && "bg-primary-foreground/20",
                      !isCurrent && "bg-background"
                    )}>
                      {index + 1}
                    </span>
                  )}
                  
                  {/* Category name - always show full name */}
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sub-category Tabs (if applicable) */}
      {hasSubcategories && (
        <div className="-mx-3 px-3 sm:-mx-4 sm:px-4">
          <ChecklistTabs
            tabs={currentTabs}
            activeTab={currentTabs[activeSubcategory]?.id || ''}
            completedTabs={currentCompletedTabs}
            onTabChange={handleTabChange}
            allowNavigation={true}
          />
        </div>
      )}

      {/* Content Area - Maximized for mobile */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-medium">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
            <span className="truncate">
              {currentCategory.label}
              {hasSubcategories && currentTabs[activeSubcategory] && (
                <span className="text-muted-foreground font-normal text-xs sm:text-sm">
                  {' → '}{currentTabs[activeSubcategory].label}
                </span>
              )}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
          <ChecklistCategoryContent
            categoryId={currentCategory.id}
            subcategory={hasSubcategories ? currentTabs[activeSubcategory]?.label : undefined}
            formData={formData}
            onChange={onChange}
          />
        </CardContent>
      </Card>

      {/* Navigation Buttons - Mobile optimized */}
      <div className="flex items-center justify-between py-2 sm:py-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          size="sm"
          className="gap-1 h-9 px-3"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium">{activeMainCategory + 1}/{inspectionCategories.length}</span>
          {hasSubcategories && (
            <>
              <span>•</span>
              <span>{activeSubcategory + 1}/{currentTabs.length}</span>
            </>
          )}
        </div>

        <Button
          type="button"
          onClick={handleCompleteSubcategory}
          size="sm"
          className="gap-1 h-9 px-3"
        >
          <span>
            {isLastTab && isLastCategory ? 'Done' : 'Next'}
          </span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export { inspectionCategories };
