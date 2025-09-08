import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, X } from "lucide-react";
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

const inspectionChecklist: ChecklistItem[] = [
  // Roof Inspection - General
  { 
    id: 'roof-inspection-method', 
    category: 'Roof', 
    subcategory: 'General',
    item: 'Inspection Method', 
    required: true, 
    type: 'multiselect',
    options: ['Binoculars', 'Ground', 'Ladder', 'Roof', 'Drone', 'Moisture meter']
  },
  { 
    id: 'roof-type-style', 
    category: 'Roof', 
    subcategory: 'General',
    item: 'Roof Type/Style', 
    required: true, 
    type: 'multiselect',
    options: ['Gable', 'Shed', 'Mansard', 'Combination', 'Gambrel', 'Flat', 'Hip']
  },
  
  // Roof Inspection - Coverings
  { 
    id: 'roof-age', 
    category: 'Roof', 
    subcategory: 'Coverings',
    item: 'Age (Year Installed)', 
    required: true, 
    type: 'year'
  },
  { 
    id: 'roof-material', 
    category: 'Roof', 
    subcategory: 'Coverings',
    item: 'Material', 
    required: true, 
    type: 'multiselect',
    options: ['Asbestos', 'Ceramic', 'Wood', 'Asphalt', 'Fiberglass', 'Metal', 'Tile', 'Concrete', 'Slate', 'Solar', 'EPDM']
  },
  { 
    id: 'roof-overall-rating', 
    category: 'Roof', 
    subcategory: 'Coverings',
    item: 'Inspector Overall Rating', 
    required: true, 
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
  
  // Foundation & Structure
  { id: 'foundation-cracks', category: 'Foundation & Structure', item: 'Check for foundation cracks', required: true, type: 'checkbox' },
  { id: 'structural-integrity', category: 'Foundation & Structure', item: 'Assess structural integrity', required: true, type: 'checkbox' },
  { id: 'load-bearing', category: 'Foundation & Structure', item: 'Inspect load-bearing elements', required: true, type: 'checkbox' },
  
  // Electrical Systems
  { id: 'electrical-panel', category: 'Electrical', item: 'Inspect electrical panel', required: true, type: 'checkbox' },
  { id: 'outlet-safety', category: 'Electrical', item: 'Check outlet safety and GFCI', required: true, type: 'checkbox' },
  { id: 'wiring-condition', category: 'Electrical', item: 'Assess wiring condition', required: true, type: 'checkbox' },
  
  // Plumbing
  { id: 'water-pressure', category: 'Plumbing', item: 'Test water pressure', required: true, type: 'checkbox' },
  { id: 'leak-detection', category: 'Plumbing', item: 'Check for leaks', required: true, type: 'checkbox' },
  { id: 'drain-function', category: 'Plumbing', item: 'Verify drain functionality', required: true, type: 'checkbox' },
  
  // HVAC
  { id: 'heating-system', category: 'HVAC', item: 'Inspect heating system', required: true, type: 'checkbox' },
  { id: 'ventilation', category: 'HVAC', item: 'Check ventilation adequacy', required: true, type: 'checkbox' },
  { id: 'ductwork', category: 'HVAC', item: 'Examine ductwork condition', required: false, type: 'checkbox' },
  
  // Safety & Security
  { id: 'smoke-detectors', category: 'Safety', item: 'Test smoke detectors', required: true, type: 'checkbox' },
  { id: 'carbon-monoxide', category: 'Safety', item: 'Check CO detectors', required: true, type: 'checkbox' },
  { id: 'security-systems', category: 'Safety', item: 'Verify security systems', required: false, type: 'checkbox' },
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

  const categories = Array.from(new Set(inspectionChecklist.map(item => item.category)));

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
              {item.options?.map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingChange(item.id, rating)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    ratingValues[item.id] === rating
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        );
        
      case 'checkbox':
      default:
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
        {categories.map((category) => (
          <div key={category} className="space-y-3">
            <h3 className="font-semibold text-lg text-foreground border-b border-border pb-2">
              {category}
            </h3>
            <div className="space-y-4">
              {inspectionChecklist
                .filter(item => item.category === category)
                .map((item) => (
                  <div key={item.id} className="space-y-3 p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
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
                      {item.type === 'checkbox' && getStatusIcon(checkedItems[item.id])}
                    </div>
                    
                    {renderItemContent(item)}

                    {/* Show defect description for defect items when checked as fail */}
                    {item.subcategory?.includes('Defects') && checkedItems[item.id] === 'fail' && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-xs text-red-800 font-medium mb-1">Standard Defect Description:</p>
                        <div 
                          className="text-xs text-red-700"
                          dangerouslySetInnerHTML={{ 
                            __html: defectDescriptions[item.id] || 'No description available.' 
                          }} 
                        />
                      </div>
                    )}

                    {/* Notes section for all types */}
                    <Textarea
                      placeholder={`Notes for ${item.item.toLowerCase()}...`}
                      value={notes[item.id] || ''}
                      onChange={(e) => handleNoteChange(item.id, e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}