import { useState, useCallback, useMemo, useEffect, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChecklistTabs } from "./ChecklistTabs";
import { ChecklistCategoryContent } from "./ChecklistCategoryContent";
import { CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollContext } from "@/pages/NewInspection";

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
  onSubmit?: () => void;
}

export function ChecklistSection({ formData, onChange, onSubmit }: ChecklistSectionProps) {
  // Get scroll function from context
  const scrollToTop = useContext(ScrollContext);
  
  // State for navigation - restore from formData if available
  const [activeMainCategory, setActiveMainCategory] = useState(
    formData.currentMainCategory ?? 0
  );
  const [activeSubcategory, setActiveSubcategory] = useState(
    formData.currentSubcategory ?? 0
  );
  const [atSubmitScreen, setAtSubmitScreen] = useState(false);
  const [completedCategories, setCompletedCategories] = useState<number[]>(
    formData.completedCategories ?? []
  );
  const [completedSubcategories, setCompletedSubcategories] = useState<Record<number, string[]>>(
    formData.completedSubcategories ?? {}
  );
  const [skippedSubcategories, setSkippedSubcategories] = useState<Record<number, string[]>>(
    formData.skippedSubcategories ?? {}
  );

  // Save navigation state when it changes
  useEffect(() => {
    // Debounce to avoid too many updates
    const timeoutId = setTimeout(() => {
      onChange('currentMainCategory', activeMainCategory);
      onChange('currentSubcategory', activeSubcategory);
      onChange('completedCategories', completedCategories);
      onChange('completedSubcategories', completedSubcategories);
      onChange('skippedSubcategories', skippedSubcategories);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [activeMainCategory, activeSubcategory, completedCategories, completedSubcategories, skippedSubcategories]);

  const currentCategory = inspectionCategories[activeMainCategory];
  const hasSubcategories = currentCategory.subcategories.length > 0;

  // Auto scroll to top when category/subcategory changes OR when entering submit screen
  useEffect(() => {
    scrollToTop();
  }, [activeMainCategory, activeSubcategory, atSubmitScreen, scrollToTop]);

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

  // Get completed/skipped tabs for current category
  const currentCompletedTabs = useMemo(() => {
    return completedSubcategories[activeMainCategory] || [];
  }, [completedSubcategories, activeMainCategory]);

  const currentSkippedTabs = useMemo(() => {
    return skippedSubcategories[activeMainCategory] || [];
  }, [skippedSubcategories, activeMainCategory]);

  // Handle tab completion and auto-advance (Next button)
  const handleCompleteSubcategory = useCallback(() => {
    const currentTabId = currentTabs[activeSubcategory]?.id;
    const isLastTab = activeSubcategory === currentTabs.length - 1;
    const isLastCategory = activeMainCategory === inspectionCategories.length - 1;

    // Mark current tab as completed (unique)
    setCompletedSubcategories((prev) => {
      const existing = prev[activeMainCategory] || [];
      if (existing.includes(currentTabId)) return prev;
      return {
        ...prev,
        [activeMainCategory]: [...existing, currentTabId],
      };
    });

    // Final: move to submit screen (Submit must ONLY exist here)
    if (isLastTab && isLastCategory) {
      setAtSubmitScreen(true);
      return;
    }

    // Leaving submit screen if any
    setAtSubmitScreen(false);

    // Auto-advance to next tab or next category
    if (!isLastTab) {
      setActiveSubcategory(activeSubcategory + 1);
      return;
    }

    // Category done → mark category as complete and move to next
    setCompletedCategories((prev) => (prev.includes(activeMainCategory) ? prev : [...prev, activeMainCategory]));
    if (activeMainCategory < inspectionCategories.length - 1) {
      setActiveMainCategory(activeMainCategory + 1);
      setActiveSubcategory(0);
    }
  }, [activeSubcategory, activeMainCategory, currentTabs]);

  // Handle skip (moves to next without marking complete)
  const handleSkipSubcategory = useCallback(() => {
    const currentTabId = currentTabs[activeSubcategory]?.id;
    const isLastTab = activeSubcategory === currentTabs.length - 1;
    const isLastCategory = activeMainCategory === inspectionCategories.length - 1;

    // Mark current tab as skipped (unique)
    setSkippedSubcategories((prev) => {
      const existing = prev[activeMainCategory] || [];
      if (existing.includes(currentTabId)) return prev;
      return {
        ...prev,
        [activeMainCategory]: [...existing, currentTabId],
      };
    });

    // Final: move to submit screen (skip never submits)
    if (isLastTab && isLastCategory) {
      setAtSubmitScreen(true);
      return;
    }

    setAtSubmitScreen(false);

    if (!isLastTab) {
      setActiveSubcategory(activeSubcategory + 1);
      return;
    }

    // Leaving category → allow progress forward even when skipped
    setCompletedCategories((prev) => (prev.includes(activeMainCategory) ? prev : [...prev, activeMainCategory]));
    if (activeMainCategory < inspectionCategories.length - 1) {
      setActiveMainCategory(activeMainCategory + 1);
      setActiveSubcategory(0);
    }
  }, [activeSubcategory, activeMainCategory, currentTabs]);

  // Handle tab change
  const handleTabChange = useCallback((tabId: string) => {
    const tabIndex = currentTabs.findIndex((t) => t.id === tabId);
    if (tabIndex !== -1) {
      setAtSubmitScreen(false);
      setActiveSubcategory(tabIndex);
    }
  }, [currentTabs]);

  // Handle category change from sidebar
  const handleCategoryChange = useCallback((categoryIndex: number) => {
    // Can only navigate to completed categories or the next available one
    if (completedCategories.includes(categoryIndex) || categoryIndex <= completedCategories.length) {
      setAtSubmitScreen(false);
      setActiveMainCategory(categoryIndex);
      setActiveSubcategory(0);
    }
  }, [completedCategories]);

  // Navigation buttons
  const handlePrevious = useCallback(() => {
    // If we're on the submit screen, go back to the last checklist screen first
    if (atSubmitScreen) {
      setAtSubmitScreen(false);
      return;
    }

    if (activeSubcategory > 0) {
      setActiveSubcategory(activeSubcategory - 1);
    } else if (activeMainCategory > 0) {
      const prevCategoryIndex = activeMainCategory - 1;
      const prevCategory = inspectionCategories[prevCategoryIndex];
      setActiveMainCategory(prevCategoryIndex);
      setActiveSubcategory(prevCategory.subcategories.length > 0 ? prevCategory.subcategories.length - 1 : 0);
    }
  }, [activeSubcategory, activeMainCategory, atSubmitScreen]);

  const canGoPrevious = activeMainCategory > 0 || activeSubcategory > 0 || atSubmitScreen;
  const isLastTab = activeSubcategory === currentTabs.length - 1;
  const isLastCategory = activeMainCategory === inspectionCategories.length - 1;
  const isFinalChecklistScreen = isLastTab && isLastCategory;
  const canSkip = hasSubcategories && !atSubmitScreen;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Main Category Navigation - Centered container with proper hierarchy */}
      <div className="w-full">
        <div className="max-w-4xl mx-auto">
          {/* Category Stepper Container */}
          <div className="bg-card rounded-xl border border-border shadow-sm">
            {/* Header with navigation controls */}
            <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={activeMainCategory === 0}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Step {activeMainCategory + 1} of {inspectionCategories.length}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (activeMainCategory < inspectionCategories.length - 1) {
                    handleCategoryChange(activeMainCategory + 1);
                  }
                }}
                disabled={activeMainCategory >= inspectionCategories.length - 1 || !completedCategories.includes(activeMainCategory)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Scrollable Steps */}
            <div className="overflow-x-auto scrollbar-none">
              <div className="flex items-stretch min-w-max lg:justify-center">
                {inspectionCategories.map((category, index) => {
                  const isCompleted = completedCategories.includes(index);
                  const isCurrent = index === activeMainCategory;
                  const isAccessible = isCompleted || index <= completedCategories.length;
                  const isFirst = index === 0;
                  const isLast = index === inspectionCategories.length - 1;

                  return (
                    <div key={category.id} className="flex items-center">
                      <button
                        type="button"
                        disabled={!isAccessible}
                        onClick={() => handleCategoryChange(index)}
                        className={cn(
                          "relative flex flex-col items-center gap-1.5 px-3 py-3 sm:px-4 sm:py-4 lg:px-5 min-w-[100px] sm:min-w-[120px] lg:min-w-[140px] transition-all group",
                          isCurrent && "bg-primary/5",
                          !isAccessible && "cursor-not-allowed opacity-50"
                        )}
                      >
                        {/* Step indicator */}
                        <div className={cn(
                          "w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all",
                          isCurrent && "bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20",
                          isCompleted && !isCurrent && "bg-primary/15 text-primary",
                          !isCompleted && !isCurrent && isAccessible && "bg-muted text-muted-foreground group-hover:bg-muted/80",
                          !isAccessible && "bg-muted/50 text-muted-foreground/40"
                        )}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                          ) : (
                            <span className="text-xs sm:text-sm font-semibold">{index + 1}</span>
                          )}
                        </div>
                        
                        {/* Step label */}
                        <span className={cn(
                          "text-[10px] sm:text-xs lg:text-sm font-medium text-center leading-tight max-w-[90px] sm:max-w-[110px] lg:max-w-[130px]",
                          isCurrent && "text-primary",
                          isCompleted && !isCurrent && "text-foreground",
                          !isCompleted && !isCurrent && "text-muted-foreground"
                        )}>
                          {category.label}
                        </span>
                        
                        {/* Active indicator line */}
                        {isCurrent && (
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 sm:w-10 h-0.5 bg-primary rounded-full" />
                        )}
                      </button>
                      
                      {/* Connector line between steps */}
                      {!isLast && (
                        <div className={cn(
                          "w-4 sm:w-6 lg:w-8 h-0.5 -mx-0.5",
                          index < activeMainCategory ? "bg-primary/50" : "bg-border"
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-category Tabs (if applicable) - Centered with clear visual hierarchy */}
      {hasSubcategories && (
        <div className="max-w-4xl mx-auto">
          <ChecklistTabs
            tabs={currentTabs}
            activeTab={currentTabs[activeSubcategory]?.id || ""}
            completedTabs={currentCompletedTabs}
            skippedTabs={currentSkippedTabs}
            onTabChange={handleTabChange}
            allowNavigation={true}
          />
        </div>
      )}

      {/* Content Area - Centered max-width container */}
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-sm border-border">
          <CardHeader className="p-3 sm:p-4 lg:p-5 pb-2 sm:pb-3 lg:pb-4 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg font-medium">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              <span className="truncate">
                {currentCategory.label}
                {hasSubcategories && currentTabs[activeSubcategory] && (
                  <span className="text-muted-foreground font-normal text-xs sm:text-sm lg:text-base ml-1 sm:ml-2">
                    → {currentTabs[activeSubcategory].label}
                  </span>
                )}
                {atSubmitScreen && (
                  <span className="text-muted-foreground font-normal text-xs sm:text-sm lg:text-base ml-1 sm:ml-2">
                    → Review & Submit
                  </span>
                )}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            {atSubmitScreen ? (
              <div className="space-y-2">
                <p className="text-sm text-foreground font-medium">Ready to submit your inspection.</p>
                <p className="text-sm text-muted-foreground">You can still go back to review any sections before submitting.</p>
              </div>
            ) : (
              <ChecklistCategoryContent
                categoryId={currentCategory.id}
                subcategory={hasSubcategories ? currentTabs[activeSubcategory]?.label : undefined}
                formData={formData}
                onChange={onChange}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation Buttons - Centered max-width with clear separation */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between py-4 sm:py-5 lg:py-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            size="sm"
            className="h-10 px-4 sm:h-11 sm:px-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Progress indicator */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <span className="font-medium">{activeMainCategory + 1}/{inspectionCategories.length}</span>
              {hasSubcategories && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span>{activeSubcategory + 1}/{currentTabs.length}</span>
                </>
              )}
            </div>

            {/* Skip button - only at sub-category level; never with Submit */}
            {canSkip && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkipSubcategory}
                size="sm"
                className="h-10 px-3 sm:px-4 text-muted-foreground hover:text-foreground"
              >
                <span>Skip</span>
              </Button>
            )}
          </div>

          {/* Primary action: Next or Submit (never both) */}
          {atSubmitScreen ? (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={!onSubmit}
              size="sm"
              className="h-10 px-4 sm:h-11 sm:px-6 bg-primary hover:bg-primary/90"
            >
              <span>Submit Inspection</span>
              <CheckCircle className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleCompleteSubcategory}
              size="sm"
              className="h-10 px-4 sm:h-11 sm:px-6"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export { inspectionCategories };
