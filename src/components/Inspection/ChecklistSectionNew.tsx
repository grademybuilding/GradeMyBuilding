import { useState, useCallback, useMemo, useEffect, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChecklistCategoryContent } from "./ChecklistCategoryContent";
import { CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollContext } from "@/pages/NewInspection";

// Main inspection categories for the sidebar/menu navigation
const allInspectionCategories = [
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
  { id: 'radon', label: 'Radon', subcategories: [] },
  { id: 'well', label: 'Well', subcategories: [] },
  { id: 'pool-spa', label: 'Swimming Pools and Spas', subcategories: ['Limitations', 'General', 'Safety Devices', 'Coping, Tile & Decking', 'Vessel Surface', 'Drains', 'Pool Electrical', 'Control Valves', 'Filtering & Cleaning', 'Pool Plumbing', 'Pumps', 'Spa Controls', 'Heating', 'Accessories'] },
];

interface ChecklistSectionProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  onSubmit?: () => void;
}

export function ChecklistSection({ formData, onChange, onSubmit }: ChecklistSectionProps) {
  // Get scroll function from context
  const scrollToTop = useContext(ScrollContext);
  
  // Filter categories based on Inspection Details "Inspection Level" selections
  // (InspectionDetails stores this as formData.inspectionCategories)
  const radonSelected = useMemo(() => {
    const selected = (formData.inspectionCategories ?? []) as string[];
    return selected.includes("Radon");
  }, [formData.inspectionCategories]);

  const wellSelected = useMemo(() => {
    const selected = (formData.inspectionCategories ?? []) as string[];
    return selected.includes("Well");
  }, [formData.inspectionCategories]);

  const poolSpaSelected = useMemo(() => {
    const selected = (formData.inspectionCategories ?? []) as string[];
    return selected.includes("Spa/Swimming Pool");
  }, [formData.inspectionCategories]);

  // Only show Radon/Well/Pool-Spa if they're selected in Inspection Details
  const inspectionCategories = useMemo(() => {
    return allInspectionCategories.filter((cat) => {
      if (cat.id === "radon") return radonSelected;
      if (cat.id === "well") return wellSelected;
      if (cat.id === "pool-spa") return poolSpaSelected;
      return true;
    });
  }, [radonSelected, wellSelected, poolSpaSelected]);

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

  // Keep active category in range when categories list changes (e.g., Radon toggled)
  useEffect(() => {
    if (activeMainCategory >= inspectionCategories.length) {
      setAtSubmitScreen(false);
      setActiveMainCategory(Math.max(0, inspectionCategories.length - 1));
      setActiveSubcategory(0);
    }
  }, [activeMainCategory, inspectionCategories.length]);

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

  const currentCategory = inspectionCategories[activeMainCategory] ?? inspectionCategories[0];
  const hasSubcategories = currentCategory?.subcategories.length > 0;

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
    <div className="space-y-5 sm:space-y-6">
      {/* Inspection Checklist Header & Stepper */}
      <div className="w-full">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 border-b border-border/50">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/15 text-accent">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Inspection Checklist
              </h2>
            </div>

            {/* Horizontal Stepper with Connected Circles */}
            <div className="px-4 py-4 sm:px-6 sm:py-5 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40">
              <div className="flex items-start min-w-max gap-2">
                {inspectionCategories.map((category, index) => {
                  const isCompleted = completedCategories.includes(index);
                  const isCurrent = index === activeMainCategory;
                  const isAccessible = isCompleted || index <= completedCategories.length;
                  const isLast = index === inspectionCategories.length - 1;

                  return (
                    <div key={category.id} className="flex items-start">
                      {/* Step item */}
                      <button
                        type="button"
                        disabled={!isAccessible}
                        onClick={() => handleCategoryChange(index)}
                        className="flex flex-col items-center gap-2 group"
                      >
                        {/* Circle indicator */}
                        <div className={cn(
                          "relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-200",
                          isCurrent && "bg-accent border-accent text-accent-foreground shadow-lg shadow-accent/30",
                          isCompleted && !isCurrent && "bg-accent/20 border-accent text-accent",
                          !isCompleted && !isCurrent && isAccessible && "bg-background border-border text-foreground/70 group-hover:border-accent/50",
                          !isAccessible && "bg-muted/30 border-border/50 text-foreground/40 cursor-not-allowed"
                        )}>
                          {isCompleted || isCurrent ? (
                            <CheckCircle className={cn(
                              "h-5 w-5 sm:h-6 sm:w-6",
                              isCurrent && "text-accent-foreground",
                              isCompleted && !isCurrent && "text-accent"
                            )} />
                          ) : (
                            <span className="text-xs sm:text-sm font-semibold">{index + 1}</span>
                          )}
                        </div>
                        
                        {/* Label */}
                        <span className={cn(
                          "text-[10px] sm:text-xs font-semibold text-center max-w-[70px] sm:max-w-[90px] leading-tight",
                          isCurrent && "text-accent",
                          isCompleted && !isCurrent && "text-foreground",
                          !isCompleted && !isCurrent && "text-foreground/70"
                        )}>
                          {category.label}
                        </span>
                      </button>
                      
                      {/* Connector line */}
                      {!isLast && (
                        <div className="flex items-center h-10 sm:h-12 mx-1 sm:mx-2">
                          <div className={cn(
                            "w-6 sm:w-10 lg:w-14 h-0.5 rounded-full transition-colors",
                            index < activeMainCategory ? "bg-accent" : "bg-border"
                          )} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Category Title + Subcategory Pills */}
            <div className="px-4 py-3 sm:px-5 sm:py-4 bg-muted/30 border-t border-border/50">
              <div className="flex flex-wrap items-center gap-2">
                {/* Category name */}
                <span className="text-sm sm:text-base font-semibold text-foreground mr-2">
                  {currentCategory.label}
                </span>
                
                {/* Subcategory pills or single category pill */}
                {hasSubcategories ? (
                  currentTabs.map((tab) => {
                    const isCompleted = currentCompletedTabs.includes(tab.id);
                    const isSkipped = currentSkippedTabs.includes(tab.id);
                    const isDone = isCompleted || isSkipped;
                    const isCurrent = tab.id === currentTabs[activeSubcategory]?.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabChange(tab.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap border cursor-pointer",
                          isCurrent && "bg-primary text-primary-foreground border-primary shadow-sm",
                          isCompleted && !isCurrent && "bg-accent/15 text-accent border-accent/30 hover:bg-accent/25",
                          isSkipped && !isCurrent && "bg-muted text-foreground/70 border-border hover:bg-muted/80",
                          !isCurrent && !isDone && "bg-background text-foreground/80 border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <span>{tab.label}</span>
                        {isCompleted && <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                      </button>
                    );
                  })
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-primary text-primary-foreground border border-primary">
                    All Items
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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

export { allInspectionCategories as inspectionCategories };
