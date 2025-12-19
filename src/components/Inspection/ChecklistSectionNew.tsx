import { useState, useCallback, useMemo, useEffect } from "react";
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

  // Auto scroll to top when category or subcategory changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeMainCategory, activeSubcategory]);

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
    <div className="space-y-4 sm:space-y-6">
      {/* Main Category Navigation - Scrollable horizontal tabs with clear separation */}
      <div className="bg-muted/30 rounded-lg p-2 sm:p-3 border border-border/50">
        <div className="overflow-x-auto scrollbar-none -mx-1 px-1">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-max">
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
                    "flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all",
                    isCurrent && "bg-primary text-primary-foreground shadow-md",
                    isCompleted && !isCurrent && "bg-primary/15 text-primary hover:bg-primary/25",
                    !isCompleted && !isCurrent && isAccessible && "bg-background text-muted-foreground hover:bg-background/80",
                    !isAccessible && "bg-background/50 text-muted-foreground/40 cursor-not-allowed"
                  )}
                >
                  {isCompleted && (
                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  )}
                  
                  {!isCompleted && (
                    <span className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0",
                      isCurrent ? "bg-primary-foreground/20" : "bg-muted"
                    )}>
                      {index + 1}
                    </span>
                  )}
                  
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sub-category Tabs (if applicable) - Clear visual hierarchy */}
      {hasSubcategories && (
        <div className="pt-1">
          <ChecklistTabs
            tabs={currentTabs}
            activeTab={currentTabs[activeSubcategory]?.id || ''}
            completedTabs={currentCompletedTabs}
            onTabChange={handleTabChange}
            allowNavigation={true}
          />
        </div>
      )}

      {/* Content Area - Maximum vertical space */}
      <Card className="shadow-sm border-border">
        <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3 border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-medium">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
            <span className="truncate">
              {currentCategory.label}
              {hasSubcategories && currentTabs[activeSubcategory] && (
                <span className="text-muted-foreground font-normal text-xs sm:text-sm ml-1">
                  → {currentTabs[activeSubcategory].label}
                </span>
              )}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <ChecklistCategoryContent
            categoryId={currentCategory.id}
            subcategory={hasSubcategories ? currentTabs[activeSubcategory]?.label : undefined}
            formData={formData}
            onChange={onChange}
          />
        </CardContent>
      </Card>

      {/* Navigation Buttons - Inside scroll area with clear separation */}
      <div className="flex items-center justify-between py-4 sm:py-5 mt-2 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          size="sm"
          className="h-10 px-4 sm:h-10 sm:px-5"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
          <span className="font-medium">{activeMainCategory + 1}/{inspectionCategories.length}</span>
          {hasSubcategories && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span>{activeSubcategory + 1}/{currentTabs.length}</span>
            </>
          )}
        </div>

        <Button
          type="button"
          onClick={handleCompleteSubcategory}
          size="sm"
          className="h-10 px-4 sm:h-10 sm:px-5"
        >
          <span>{isLastTab && isLastCategory ? 'Complete' : 'Next'}</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

export { inspectionCategories };
