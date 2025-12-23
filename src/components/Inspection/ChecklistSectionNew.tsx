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
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      {/* Main Category Navigation */}
      <div className="w-full">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-card via-card to-card rounded-2xl border border-border/60 shadow-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 bg-muted/30 border-b border-border/40">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={activeMainCategory === 0}
                  className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/80"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {currentCategory.label}
                  </span>
                  <span className="text-xs text-muted-foreground bg-background/60 px-2 py-0.5 rounded-full">
                    {activeMainCategory + 1} / {inspectionCategories.length}
                  </span>
                </div>
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
                className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/80"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Category Pills */}
            <div className="overflow-x-auto scrollbar-none px-3 py-3 sm:px-4 sm:py-4">
              <div className="flex items-center gap-2 min-w-max lg:justify-center">
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
                        "relative flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap",
                        isCurrent && "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]",
                        isCompleted && !isCurrent && "bg-accent/15 text-accent hover:bg-accent/20 border border-accent/30",
                        !isCompleted && !isCurrent && isAccessible && "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent hover:border-border/50",
                        !isAccessible && "bg-muted/20 text-muted-foreground/40 cursor-not-allowed border border-transparent"
                      )}
                    >
                      {/* Step indicator */}
                      <span className={cn(
                        "flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs font-bold transition-all",
                        isCurrent && "bg-primary-foreground/20 text-primary-foreground",
                        isCompleted && !isCurrent && "bg-accent text-accent-foreground",
                        !isCompleted && !isCurrent && isAccessible && "bg-background text-muted-foreground",
                        !isAccessible && "bg-muted text-muted-foreground/40"
                      )}>
                        {isCompleted ? (
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </span>
                      
                      {/* Label - shown on current and completed */}
                      <span className={cn(
                        "text-xs sm:text-sm font-medium hidden sm:inline",
                        (isCurrent || isCompleted) && "inline"
                      )}>
                        {category.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategory Tabs */}
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
