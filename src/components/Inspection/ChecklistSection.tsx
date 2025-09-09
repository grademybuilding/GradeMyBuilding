import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CheckCircle, AlertTriangle, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { defectDescriptions } from "@/data/defectDescriptions";

interface ChecklistItem {
  id: string;
  category: string;
  subcategory?: string;
  item: string;
  required: boolean;
  type: 'checkbox' | 'rating' | 'year' | 'multiselect';
  options?: string[];
}

const inspectionCategories = [
  'Roof',
  'Exterior',
  'Wood Decks & Balconies',
  'Foundation Basement & Crawlspace',
  'Heating & Cooling',
  'Door & Windows',
  'Cooking & Appliances',
  'Green Features'
];

const inspectionChecklist: ChecklistItem[] = [
  // Roof General
  {
    id: 'roof-inspection-method',
    category: 'Roof',
    subcategory: 'General',
    item: 'Inspection Method',
    required: false,
    type: 'multiselect',
    options: ['Binoculars', 'Ground', 'Ladder', 'Roof', 'Drone', 'Moisture meter']
  },
  {
    id: 'roof-type-style',
    category: 'Roof',
    subcategory: 'General', 
    item: 'Roof Type/Style',
    required: false,
    type: 'multiselect',
    options: ['Gable', 'Shed', 'Mansard', 'Combination', 'Gambrel', 'Flat', 'Hip']
  },
  // Roof Coverings
  {
    id: 'roof-age',
    category: 'Roof',
    subcategory: 'Coverings',
    item: 'Age - Year Installed',
    required: false,
    type: 'year'
  },
  {
    id: 'roof-material',
    category: 'Roof',
    subcategory: 'Coverings',
    item: 'Material',
    required: false,
    type: 'multiselect',
    options: ['Asbestos', 'Ceramic', 'Wood', 'Asphalt', 'Fiberglass', 'Metal', 'Tile', 'Concrete', 'Slate', 'Solar', 'EPDM']
  },
  {
    id: 'roof-inspector-rating',
    category: 'Roof',
    subcategory: 'Coverings',
    item: 'Inspector Overall Grading',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Roof Defects - Coverings
  {
    id: 'roof-under-driven-nails',
    category: 'Roof',
    subcategory: 'Defects - Coverings',
    item: 'Under-Driven Nails',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-tiles-cracked-broken',
    category: 'Roof',
    subcategory: 'Defects - Coverings',
    item: 'Tiles Cracked/Broken',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-splitting',
    category: 'Roof',
    subcategory: 'Defects - Coverings',
    item: 'Splitting',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-shingles-missing',
    category: 'Roof',
    subcategory: 'Defects - Coverings',
    item: 'Shingles Missing',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-underlayment-damage',
    category: 'Roof',
    subcategory: 'Defects - Coverings',
    item: 'Underlayment Damage',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-improper-nailing',
    category: 'Roof',
    subcategory: 'Defects - Coverings',
    item: 'Improper/Incomplete Nailing',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-discoloration',
    category: 'Roof',
    subcategory: 'Defects - Coverings',
    item: 'Discoloration',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-delamination',
    category: 'Roof',
    subcategory: 'Defects - Coverings',
    item: 'Delamination',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-damaged-general',
    category: 'Roof',
    subcategory: 'Defects - Coverings',
    item: 'Damaged (General)',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-ponding',
    category: 'Roof',
    subcategory: 'Defects - Coverings',
    item: 'Ponding',
    required: false,
    type: 'checkbox'
  },
  // Roof Drainage Systems
  {
    id: 'roof-drainage-system-type',
    category: 'Roof',
    subcategory: 'Roof Drainage Systems',
    item: 'Drainage System Type',
    required: false,
    type: 'multiselect',
    options: ['Internal Drains', 'Gutters', 'Scupper Drains']
  },
  {
    id: 'roof-gutter-material',
    category: 'Roof',
    subcategory: 'Roof Drainage Systems',
    item: 'Gutter Material',
    required: false,
    type: 'multiselect',
    options: ['Aluminum', 'Seamless Aluminum', 'Vinyl', 'Copper', 'Steel']
  },
  {
    id: 'roof-drainage-inspector-rating',
    category: 'Roof',
    subcategory: 'Roof Drainage Systems',
    item: 'Inspector Overall Grading',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Roof Drainage Systems - Defects
  {
    id: 'roof-gutters-missing',
    category: 'Roof',
    subcategory: 'Defects - Roof Drainage Systems',
    item: 'Gutters Missing',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-gutter-loose',
    category: 'Roof',
    subcategory: 'Defects - Roof Drainage Systems',
    item: 'Gutter Loose',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-gutter-leakage',
    category: 'Roof',
    subcategory: 'Defects - Roof Drainage Systems',
    item: 'Gutter Leakage',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-gutter-improperly-sloped',
    category: 'Roof',
    subcategory: 'Defects - Roof Drainage Systems',
    item: 'Gutter Improperly Sloped',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-gutter-damaged',
    category: 'Roof',
    subcategory: 'Defects - Roof Drainage Systems',
    item: 'Gutter Damaged',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-downspouts-missing',
    category: 'Roof',
    subcategory: 'Defects - Roof Drainage Systems',
    item: 'Downspouts Missing',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-downspouts-drain-near-house',
    category: 'Roof',
    subcategory: 'Defects - Roof Drainage Systems',
    item: 'Downspouts Drain Near House',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-debris',
    category: 'Roof',
    subcategory: 'Defects - Roof Drainage Systems',
    item: 'Debris',
    required: false,
    type: 'checkbox'
  },
  // Flashing
  {
    id: 'roof-flashing-material',
    category: 'Roof',
    subcategory: 'Flashing',
    item: 'Flashing Material',
    required: false,
    type: 'multiselect',
    options: ['Aluminum', 'Copper', 'Galvanized Steel', 'Lead', 'Rubber', 'Plastic']
  },
  {
    id: 'roof-flashing-condition',
    category: 'Roof',
    subcategory: 'Flashing',
    item: 'Inspector Overall Grading',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Flashing Defects
  {
    id: 'roof-flashing-damaged',
    category: 'Roof',
    subcategory: 'Defects - Flashing',
    item: 'Flashing Damaged',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-flashing-loose',
    category: 'Roof',
    subcategory: 'Defects - Flashing',
    item: 'Flashing Loose',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-flashing-missing',
    category: 'Roof',
    subcategory: 'Defects - Flashing',
    item: 'Flashing Missing',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-flashing-improper-installation',
    category: 'Roof',
    subcategory: 'Defects - Flashing',
    item: 'Flashing Improper Installation',
    required: false,
    type: 'checkbox'
  },
  // Skylights & Chimneys
  {
    id: 'roof-skylights-chimneys-material',
    category: 'Roof',
    subcategory: 'Skylights & Chimneys',
    item: 'Skylight/Chimney Material',
    required: false,
    type: 'multiselect',
    options: ['Glass', 'Acrylic', 'Polycarbonate', 'Brick', 'Stone', 'Metal', 'Stucco']
  },
  {
    id: 'roof-skylights-chimneys-inspector-rating',
    category: 'Roof',
    subcategory: 'Skylights & Chimneys',
    item: 'Inspector Overall Grading',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Skylights & Chimneys Defects
  {
    id: 'roof-skylight-water-penetration',
    category: 'Roof',
    subcategory: 'Defects - Skylights & Chimneys',
    item: 'Skylight Water Penetration',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-skylight-cracked',
    category: 'Roof',
    subcategory: 'Defects - Skylights & Chimneys',
    item: 'Skylight Cracked',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-metal-chimney-rust',
    category: 'Roof',
    subcategory: 'Defects - Skylights & Chimneys',
    item: 'Metal Chimney Rust',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-chimney-unlined',
    category: 'Roof',
    subcategory: 'Defects - Skylights & Chimneys',
    item: 'Chimney Unlined',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-chimney-repoint-needed',
    category: 'Roof',
    subcategory: 'Defects - Skylights & Chimneys',
    item: 'Chimney Repoint Needed',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-chimney-flue-dirty',
    category: 'Roof',
    subcategory: 'Defects - Skylights & Chimneys',
    item: 'Chimney Flue Dirty',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-chimney-flue-cracked',
    category: 'Roof',
    subcategory: 'Defects - Skylights & Chimneys',
    item: 'Chimney Flue Cracked',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-chimney-cap-missing',
    category: 'Roof',
    subcategory: 'Defects - Skylights & Chimneys',
    item: 'Chimney Cap Missing',
    required: false,
    type: 'checkbox'
  }
];

interface ChecklistSectionProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function ChecklistSection({ formData, onChange }: ChecklistSectionProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, 'pass' | 'fail' | 'na'>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [yearValues, setYearValues] = useState<Record<string, string>>({});
  const [ratingValues, setRatingValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDefects, setSelectedDefects] = useState<Record<string, boolean>>({});
  const [selectedRoofSubcategory, setSelectedRoofSubcategory] = useState<string>('all');

  const handleItemCheck = (itemId: string, status: 'pass' | 'fail' | 'na') => {
    const updated = { ...checkedItems, [itemId]: status };
    setCheckedItems(updated);
    onChange('checklist', updated);
  };

  const handleMultiSelect = (itemId: string, option: string) => {
    const current = selectedOptions[itemId] || [];
    const updated = current.includes(option)
      ? current.filter(item => item !== option)
      : [...current, option];
    
    const updatedSelections = { ...selectedOptions, [itemId]: updated };
    setSelectedOptions(updatedSelections);
    onChange('checklistSelections', updatedSelections);
  };

  const handleYearChange = (itemId: string, year: string) => {
    const updated = { ...yearValues, [itemId]: year };
    setYearValues(updated);
    onChange('checklistYears', updated);
  };

  const handleRatingChange = (itemId: string, rating: string) => {
    const updated = { ...ratingValues, [itemId]: rating };
    setRatingValues(updated);
    onChange('checklistRatings', updated);
  };

  const handleNoteChange = (itemId: string, note: string) => {
    const updated = { ...notes, [itemId]: note };
    setNotes(updated);
    onChange('checklistNotes', updated);
  };

  const handleDefectCheck = (itemId: string, checked: boolean) => {
    const updated = { ...selectedDefects, [itemId]: checked };
    setSelectedDefects(updated);
    onChange('selectedDefects', updated);
  };

  const categories = selectedCategory === 'all' 
    ? Array.from(new Set(inspectionChecklist.map(item => item.category)))
    : [selectedCategory];

  const getStatusIcon = (status: 'pass' | 'fail' | 'na' | undefined) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'fail':
        return <X className="h-4 w-4 text-red-600" />;
      case 'na':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default:
        return null;
    }
  };

  const renderItemContent = (item: ChecklistItem) => {
    switch (item.type) {
      case 'multiselect':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {item.options?.map((option) => (
                <label key={option} className="flex items-center space-x-2 text-sm">
                  <Checkbox
                    checked={(selectedOptions[item.id] || []).includes(option)}
                    onCheckedChange={() => handleMultiSelect(item.id, option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
        
      case 'year':
        return (
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Enter year (e.g., 2020)"
              value={yearValues[item.id] || ''}
              onChange={(e) => handleYearChange(item.id, e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
        );
        
      case 'rating':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {item.options?.map((rating) => {
                // Color coding for Inspector Overall Grading
                let colorClasses = '';
                if (item.id === 'roof-inspector-rating' || item.id === 'roof-drainage-inspector-rating' || item.id === 'roof-flashing-condition' || item.id === 'roof-skylights-chimneys-inspector-rating') {
                  switch (rating) {
                    case 'Excellent':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300';
                      break;
                    case 'Very Good':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300';
                      break;
                    case 'Good':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-yellow-600 text-white'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300';
                      break;
                    case 'Poor':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300';
                      break;
                    case 'Replace':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-red-600 text-white'
                        : 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300';
                      break;
                    case 'Not Inspected':
                    case 'Partial Inspected':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300';
                      break;
                    default:
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
                  }
                } else {
                  // Default styling for other rating items
                  colorClasses = ratingValues[item.id] === rating
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
                }

                return (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingChange(item.id, rating)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors border ${colorClasses}`}
                  >
                    {rating}
                  </button>
                );
              })}
            </div>
          </div>
        );
        
      case 'checkbox':
      default:
        // For defect items, show editable comment area only
        if (item.subcategory?.includes('Defects')) {
          return (
            <div className="space-y-3">
              {/* Comment area - always visible */}
              <Textarea
                placeholder="Add inspection comments..."
                value={notes[item.id] || defectDescriptions[item.id] || ''}
                onChange={(e) => handleNoteChange(item.id, e.target.value)}
                className="min-h-[120px] text-sm"
              />
            </div>
          );
        }
        
        // For non-defect items, keep the Pass/Fail/N/A buttons
        return (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleItemCheck(item.id, 'pass')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                checkedItems[item.id] === 'pass'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              Pass
            </button>
            <button
              type="button"
              onClick={() => handleItemCheck(item.id, 'fail')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                checkedItems[item.id] === 'fail'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              Fail
            </button>
            <button
              type="button"
              onClick={() => handleItemCheck(item.id, 'na')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                checkedItems[item.id] === 'na'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              N/A
            </button>
          </div>
        );
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Inspection Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="category-filter">Select Inspection Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {inspectionCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {categories.map((category) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center justify-between pb-2">
              <h3 className="font-semibold text-lg text-foreground">
                {category}
              </h3>
              {category === 'Roof' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      {selectedRoofSubcategory === 'all' ? 'All Roof Items' : selectedRoofSubcategory}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border border-border">
                    <DropdownMenuItem onClick={() => setSelectedRoofSubcategory('all')}>
                      All Roof Items
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedRoofSubcategory('Covering')}>
                      Covering
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedRoofSubcategory('Roof Drainage Systems')}>
                      Roof Drainage Systems
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedRoofSubcategory('Flashing')}>
                      Flashing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedRoofSubcategory('Skylights & Chimneys')}>
                      Skylights & Chimneys
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedRoofSubcategory('Other Roof Penetrations')}>
                      Other Roof Penetrations
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="space-y-4">
              {inspectionChecklist
                .filter(item => {
                  if (item.category !== category) return false;
                  if (category === 'Roof' && selectedRoofSubcategory !== 'all') {
                    // Map the dropdown selections to actual subcategories
                    const subcategoryMap: Record<string, string[]> = {
                      'Covering': ['Coverings', 'Defects - Coverings'],
                      'Roof Drainage Systems': ['Roof Drainage Systems', 'Defects - Roof Drainage Systems'],
                      'Flashing': ['Flashing', 'Defects - Flashing'],
                      'Skylights & Chimneys': ['Skylights & Chimneys', 'Defects - Skylights & Chimneys'],
                      'Other Roof Penetrations': ['Other Roof Penetrations', 'Defects - Other Roof Penetrations']
                    };
                    
                    const allowedSubcategories = subcategoryMap[selectedRoofSubcategory] || [];
                    return allowedSubcategories.some(sub => 
                      item.subcategory?.includes(sub) || item.subcategory === sub
                    );
                  }
                  return true;
                })
                .map((item) => (
                  <div key={item.id} className="space-y-3 p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Checkbox for defect items - inline with title */}
                        {item.subcategory?.includes('Defects') && (
                          <Checkbox
                            id={`defect-${item.id}`}
                            checked={selectedDefects[item.id] || false}
                            onCheckedChange={(checked) => handleDefectCheck(item.id, checked as boolean)}
                          />
                        )}
                        {item.subcategory && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              item.subcategory.includes('Defects') 
                                ? "bg-red-50 text-red-700 border-red-200" 
                                : "bg-muted"
                            )}
                          >
                            {item.subcategory}
                          </Badge>
                        )}
                        <span className="text-sm font-medium">{item.item}</span>
                        {item.required && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                      {/* Show status icon only for non-defect checkbox items */}
                      {item.type === 'checkbox' && !item.subcategory?.includes('Defects') && getStatusIcon(checkedItems[item.id])}
                    </div>
                    
                    {renderItemContent(item)}

                    {/* Remove the old defect description display since it's now in the textarea */}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}