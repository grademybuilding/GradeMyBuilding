import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, X } from "lucide-react";
import { useState } from "react";

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  required: boolean;
}

const inspectionChecklist: ChecklistItem[] = [
  // Foundation & Structure
  { id: 'foundation-cracks', category: 'Foundation & Structure', item: 'Check for foundation cracks', required: true },
  { id: 'structural-integrity', category: 'Foundation & Structure', item: 'Assess structural integrity', required: true },
  { id: 'load-bearing', category: 'Foundation & Structure', item: 'Inspect load-bearing elements', required: true },
  
  // Electrical Systems
  { id: 'electrical-panel', category: 'Electrical', item: 'Inspect electrical panel', required: true },
  { id: 'outlet-safety', category: 'Electrical', item: 'Check outlet safety and GFCI', required: true },
  { id: 'wiring-condition', category: 'Electrical', item: 'Assess wiring condition', required: true },
  
  // Plumbing
  { id: 'water-pressure', category: 'Plumbing', item: 'Test water pressure', required: true },
  { id: 'leak-detection', category: 'Plumbing', item: 'Check for leaks', required: true },
  { id: 'drain-function', category: 'Plumbing', item: 'Verify drain functionality', required: true },
  
  // HVAC
  { id: 'heating-system', category: 'HVAC', item: 'Inspect heating system', required: true },
  { id: 'ventilation', category: 'HVAC', item: 'Check ventilation adequacy', required: true },
  { id: 'ductwork', category: 'HVAC', item: 'Examine ductwork condition', required: false },
  
  // Safety & Security
  { id: 'smoke-detectors', category: 'Safety', item: 'Test smoke detectors', required: true },
  { id: 'carbon-monoxide', category: 'Safety', item: 'Check CO detectors', required: true },
  { id: 'security-systems', category: 'Safety', item: 'Verify security systems', required: false },
];

interface ChecklistSectionProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function ChecklistSection({ formData, onChange }: ChecklistSectionProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, 'pass' | 'fail' | 'na'>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const handleItemCheck = (itemId: string, status: 'pass' | 'fail' | 'na') => {
    const updated = { ...checkedItems, [itemId]: status };
    setCheckedItems(updated);
    onChange('checklist', updated);
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
                  <div key={item.id} className="space-y-2 p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.item}</span>
                        {item.required && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                      {getStatusIcon(checkedItems[item.id])}
                    </div>
                    
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

                    {checkedItems[item.id] && (
                      <Textarea
                        placeholder={`Notes for ${item.item.toLowerCase()}...`}
                        value={notes[item.id] || ''}
                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}