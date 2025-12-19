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
    <div className="space-y-4">
      {/* Main Category Navigation - Horizontal Scrollable Menu */}
      <Card className="shadow-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-thin">
            <div className="flex min-w-max border-b border-border">
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
                      "relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-[2px]",
                      isCurrent && "border-primary text-primary bg-primary/5",
                      isCompleted && !isCurrent && "border-transparent text-foreground hover:bg-muted/50",
                      !isCompleted && !isCurrent && isAccessible && "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30",
                      !isAccessible && "border-transparent text-muted-foreground/40 cursor-not-allowed"
                    )}
                  >
                    {/* Step indicator */}
                    <span
                      className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold shrink-0",
                        isCompleted && "bg-primary text-primary-foreground",
                        isCurrent && !isCompleted && "bg-primary text-primary-foreground",
                        !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? <CheckCircle className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    
                    {/* Category label - hide on mobile for space */}
                    <span className="hidden sm:inline">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-category Tabs (if applicable) */}
      {hasSubcategories && (
        <ChecklistTabs
          tabs={currentTabs}
          activeTab={currentTabs[activeSubcategory]?.id || ''}
          completedTabs={currentCompletedTabs}
          onTabChange={handleTabChange}
          allowNavigation={true}
        />
      )}

      {/* Content Area */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span>
              {currentCategory.label}
              {hasSubcategories && currentTabs[activeSubcategory] && (
                <span className="text-muted-foreground font-normal">
                  {' → '}{currentTabs[activeSubcategory].label}
                </span>
              )}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChecklistCategoryContent
            categoryId={currentCategory.id}
            subcategory={hasSubcategories ? currentTabs[activeSubcategory]?.label : undefined}
            formData={formData}
            onChange={onChange}
          />
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden sm:inline">
            Category {activeMainCategory + 1} of {inspectionCategories.length}
          </span>
          {hasSubcategories && (
            <span className="text-xs">
              • Tab {activeSubcategory + 1}/{currentTabs.length}
            </span>
          )}
        </div>

        <Button
          type="button"
          onClick={handleCompleteSubcategory}
          className="gap-2"
        >
          <span className="hidden sm:inline">
            {isLastTab && isLastCategory ? 'Complete Checklist' : 'Next'}
          </span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export { inspectionCategories };
