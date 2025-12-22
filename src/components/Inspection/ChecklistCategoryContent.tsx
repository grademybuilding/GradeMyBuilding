import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, X } from "lucide-react";
import { defectDescriptions } from "@/data/defectDescriptions";

interface ChecklistItem {
  id: string;
  category: string;
  subcategory?: string;
  item: string;
  required: boolean;
  type: 'checkbox' | 'rating' | 'year' | 'multiselect' | 'gallons';
  options?: string[];
}

// Category to label mapping
const categoryMapping: Record<string, string> = {
  'roof': 'Roof',
  'exterior': 'Exterior Cladding',
  'walkways': 'Walkways, Patios & Driveways',
  'decks': 'Wood Decks & Balconies',
  'foundation': 'Foundation & Structure',
  'plumbing': 'Plumbing',
  'electric': 'Electric',
  'hvac': 'Heating & Cooling',
  'doors-windows': 'Doors & Windows',
  'appliances': 'Built-in Appliances',
  'green': 'Green Features',
};

// Subcategory mapping for filtering
const subcategoryMapping: Record<string, Record<string, string[]>> = {
  'roof': {
    'Coverings': ['Coverings', 'Defects - Coverings'],
    'Roof Drainage Systems': ['Roof Drainage Systems', 'Defects - Roof Drainage Systems'],
    'Flashing': ['Flashing', 'Defects - Flashing'],
    'Skylights & Chimneys': ['Skylights & Chimneys', 'Defects - Skylights & Chimneys'],
    'Eaves, Soffits & Fascia': ['Eaves, Soffits & Fascia', 'Defects - Eaves, Soffits & Fascia'],
  },
  'foundation': {
    'Foundation': ['Foundation', 'Defects - Foundation'],
    'Basement & Crawlspace': ['Basement & Crawlspace', 'Defects - Basements & Crawlspaces'],
    'Floor Structure': ['Floor Structure', 'Defects - Floor Structure'],
    'Wall Structure': ['Wall Structure', 'Defects - Wall Structure'],
    'Ceiling Structure': ['Ceiling Structure', 'Defects - Ceiling Structure'],
  },
  'hvac': {
    'Heating Equipment': ['Heating Equipment', 'Defects - Heating Equipment'],
    'Cooling Equipment': ['Cooling Equipment', 'Defects - Cooling Equipment'],
    'Operating Controls': ['Operating Controls', 'Defects - Operating Controls'],
    'Distribution Systems': ['Distribution Systems', 'Defects - Distribution Systems'],
    'Vents & Flues': ['Vents & Flues', 'Defects - Vents & Flues'],
  },
  'doors-windows': {
    'Windows': ['Windows', 'Defects - Windows'],
    'Entry Doors': ['Entry Doors', 'Defects - Entry Doors'],
    'Interior Doors': ['Interior Doors', 'Defects - Interior Doors'],
    'Garage Doors': ['Garage Doors', 'Defects - Garage Doors'],
  },
  'appliances': {
    'Refrigerator': ['Refrigerator', 'Defects - Refrigerator'],
    'Range/Oven/Cooktop': ['Range/Oven/Cooktop', 'Defects - Range/Oven/Cooktop'],
    'Dishwasher': ['Dishwasher', 'Defects - Dishwasher'],
    'Built-in Microwave': ['Built-in Microwave', 'Defects - Built-in Microwave'],
    'Garbage Disposal': ['Garbage Disposal', 'Defects - Garbage Disposal'],
    'Cooking Exhaust': ['Cooking Exhaust', 'Defects - Cooking Exhaust'],
  },
  'plumbing': {
    'Water Supply': ['Water Supply', 'Defects - Water Supply'],
    'Drain Waste Vent': ['Drain Waste Vent', 'Defects - Drain Waste Vent'],
    'Water Heater': ['Water Heater', 'Defects - Water Heater'],
    'Fixtures': ['Fixtures', 'Defects - Fixtures'],
  },
  'electric': {
    'Service Entrance': ['Service Entrance', 'Defects - Service Entrance'],
    'Branch Circuits': ['Branch Circuits', 'Defects - Branch Circuits'],
    'Connected Devices': ['Connected Devices', 'Defects - Connected Devices'],
  },
};

// Checklist items for the current implementation
// This is a simplified subset - the full checklist is in the original ChecklistSection
const inspectionChecklist: ChecklistItem[] = [
  // Roof - Coverings
  { id: 'roof-age', category: 'Roof', subcategory: 'Coverings', item: 'Age - Year Installed', required: false, type: 'year' },
  { id: 'roof-material', category: 'Roof', subcategory: 'Coverings', item: 'Material', required: false, type: 'multiselect', options: ['Asbestos', 'Ceramic', 'Wood', 'Asphalt', 'Fiberglass', 'Metal', 'Tile', 'Concrete', 'Slate', 'Solar', 'EPDM'] },
  { id: 'roof-inspector-rating', category: 'Roof', subcategory: 'Coverings', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'roof-under-driven-nails', category: 'Roof', subcategory: 'Defects - Coverings', item: 'Under-Driven Nails', required: false, type: 'checkbox' },
  { id: 'roof-tiles-cracked-broken', category: 'Roof', subcategory: 'Defects - Coverings', item: 'Tiles Cracked/Broken', required: false, type: 'checkbox' },
  { id: 'roof-shingles-missing', category: 'Roof', subcategory: 'Defects - Coverings', item: 'Shingles Missing', required: false, type: 'checkbox' },
  
  // Roof - Drainage Systems
  { id: 'roof-drainage-system-type', category: 'Roof', subcategory: 'Roof Drainage Systems', item: 'Drainage System Type', required: false, type: 'multiselect', options: ['Internal Drains', 'Gutters', 'Scupper Drains'] },
  { id: 'roof-gutter-material', category: 'Roof', subcategory: 'Roof Drainage Systems', item: 'Gutter Material', required: false, type: 'multiselect', options: ['Aluminum', 'Seamless Aluminum', 'Vinyl', 'Copper', 'Steel'] },
  { id: 'roof-drainage-inspector-rating', category: 'Roof', subcategory: 'Roof Drainage Systems', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'roof-gutters-missing', category: 'Roof', subcategory: 'Defects - Roof Drainage Systems', item: 'Gutters Missing', required: false, type: 'checkbox' },
  { id: 'roof-gutter-damaged', category: 'Roof', subcategory: 'Defects - Roof Drainage Systems', item: 'Gutter Damaged', required: false, type: 'checkbox' },
  
  // Roof - Flashing
  { id: 'roof-flashing-material', category: 'Roof', subcategory: 'Flashing', item: 'Flashing Material', required: false, type: 'multiselect', options: ['Aluminum', 'Copper', 'Galvanized Steel', 'Lead', 'Rubber', 'Plastic'] },
  { id: 'roof-flashing-condition', category: 'Roof', subcategory: 'Flashing', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'roof-flashing-damaged', category: 'Roof', subcategory: 'Defects - Flashing', item: 'Flashing Damaged', required: false, type: 'checkbox' },
  { id: 'roof-flashing-loose', category: 'Roof', subcategory: 'Defects - Flashing', item: 'Flashing Loose', required: false, type: 'checkbox' },
  
  // Roof - Skylights & Chimneys
  { id: 'roof-skylights-chimneys-material', category: 'Roof', subcategory: 'Skylights & Chimneys', item: 'Skylight/Chimney Material', required: false, type: 'multiselect', options: ['Glass', 'Acrylic', 'Polycarbonate', 'Brick', 'Stone', 'Metal', 'Stucco'] },
  { id: 'roof-skylights-chimneys-inspector-rating', category: 'Roof', subcategory: 'Skylights & Chimneys', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'roof-skylight-water-penetration', category: 'Roof', subcategory: 'Defects - Skylights & Chimneys', item: 'Skylight Water Penetration', required: false, type: 'checkbox' },
  { id: 'roof-chimney-cap-missing', category: 'Roof', subcategory: 'Defects - Skylights & Chimneys', item: 'Chimney Cap Missing', required: false, type: 'checkbox' },
  
  // Roof - Eaves, Soffits & Fascia
  { id: 'roof-eaves-soffits-fascia-material', category: 'Roof', subcategory: 'Eaves, Soffits & Fascia', item: 'Material', required: false, type: 'multiselect', options: ['Wood', 'Vinyl', 'Aluminum', 'Fiber Cement', 'Steel', 'Composite'] },
  { id: 'roof-eaves-soffits-fascia-inspector-rating', category: 'Roof', subcategory: 'Eaves, Soffits & Fascia', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'roof-fascia-rotted', category: 'Roof', subcategory: 'Defects - Eaves, Soffits & Fascia', item: 'Fascia - Rotted', required: false, type: 'checkbox' },
  { id: 'roof-fascia-damaged', category: 'Roof', subcategory: 'Defects - Eaves, Soffits & Fascia', item: 'Fascia - Damaged', required: false, type: 'checkbox' },
  
  // Exterior Cladding
  { id: 'exterior-material', category: 'Exterior Cladding', item: 'Material Type', required: false, type: 'multiselect', options: ['Vinyl', 'Wood', 'Brick', 'Stone', 'Stucco', 'Fiber Cement', 'Metal'] },
  { id: 'exterior-inspector-rating', category: 'Exterior Cladding', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'exterior-cracks', category: 'Exterior Cladding', subcategory: 'Defects', item: 'Cracks in Cladding', required: false, type: 'checkbox' },
  { id: 'exterior-water-damage', category: 'Exterior Cladding', subcategory: 'Defects', item: 'Water Damage', required: false, type: 'checkbox' },
  
  // Walkways, Patios & Driveways
  { id: 'walkways-material', category: 'Walkways, Patios & Driveways', item: 'Driveway Material', required: false, type: 'multiselect', options: ['Asphalt', 'Brick', 'Cobblestone', 'Concrete', 'Dirt', 'Gravel', 'Pavers'] },
  { id: 'walkways-inspector-rating', category: 'Walkways, Patios & Driveways', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'walkways-cracking', category: 'Walkways, Patios & Driveways', subcategory: 'Defects', item: 'Major Cracking', required: false, type: 'checkbox' },
  
  // Wood Decks & Balconies
  { id: 'decks-material', category: 'Wood Decks & Balconies', item: 'Deck Material', required: false, type: 'multiselect', options: ['Pressure Treated Wood', 'Cedar', 'Redwood', 'Composite', 'PVC'] },
  { id: 'decks-inspector-rating', category: 'Wood Decks & Balconies', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'decks-rot', category: 'Wood Decks & Balconies', subcategory: 'Defects', item: 'Wood Rot', required: false, type: 'checkbox' },
  
  // Foundation & Structure - Foundation
  { id: 'foundation-type', category: 'Foundation & Structure', subcategory: 'Foundation', item: 'Foundation Type', required: false, type: 'multiselect', options: ['Poured Concrete', 'Block', 'Stone', 'Brick', 'Slab', 'Pier'] },
  { id: 'foundation-inspector-rating', category: 'Foundation & Structure', subcategory: 'Foundation', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'foundation-cracks', category: 'Foundation & Structure', subcategory: 'Defects - Foundation', item: 'Foundation Cracks', required: false, type: 'checkbox' },
  { id: 'foundation-settling', category: 'Foundation & Structure', subcategory: 'Defects - Foundation', item: 'Foundation Settling', required: false, type: 'checkbox' },
  
  // Foundation & Structure - Basement & Crawlspace
  { id: 'basement-type', category: 'Foundation & Structure', subcategory: 'Basement & Crawlspace', item: 'Basement Type', required: false, type: 'multiselect', options: ['Full Basement', 'Partial Basement', 'Crawlspace', 'Slab on Grade', 'None'] },
  { id: 'basement-inspector-rating', category: 'Foundation & Structure', subcategory: 'Basement & Crawlspace', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'basement-water-intrusion', category: 'Foundation & Structure', subcategory: 'Defects - Basements & Crawlspaces', item: 'Water Intrusion', required: false, type: 'checkbox' },
  { id: 'basement-mold', category: 'Foundation & Structure', subcategory: 'Defects - Basements & Crawlspaces', item: 'Mold/Mildew Present', required: false, type: 'checkbox' },
  
  // Foundation & Structure - Floor Structure
  { id: 'floor-structure-material', category: 'Foundation & Structure', subcategory: 'Floor Structure', item: 'Floor Joist Material', required: false, type: 'multiselect', options: ['Wood', 'Engineered Wood', 'Steel', 'Concrete'] },
  { id: 'floor-structure-inspector-rating', category: 'Foundation & Structure', subcategory: 'Floor Structure', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'floor-structure-sagging', category: 'Foundation & Structure', subcategory: 'Defects - Floor Structure', item: 'Floor Sagging', required: false, type: 'checkbox' },
  { id: 'floor-structure-rot', category: 'Foundation & Structure', subcategory: 'Defects - Floor Structure', item: 'Wood Rot', required: false, type: 'checkbox' },
  
  // Foundation & Structure - Wall Structure
  { id: 'wall-structure-material', category: 'Foundation & Structure', subcategory: 'Wall Structure', item: 'Wall Framing Material', required: false, type: 'multiselect', options: ['Wood Stud', 'Steel Stud', 'Masonry', 'ICF'] },
  { id: 'wall-structure-inspector-rating', category: 'Foundation & Structure', subcategory: 'Wall Structure', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'wall-structure-bowing', category: 'Foundation & Structure', subcategory: 'Defects - Wall Structure', item: 'Wall Bowing', required: false, type: 'checkbox' },
  { id: 'wall-structure-cracks', category: 'Foundation & Structure', subcategory: 'Defects - Wall Structure', item: 'Wall Cracks', required: false, type: 'checkbox' },
  
  // Foundation & Structure - Ceiling Structure
  { id: 'ceiling-structure-material', category: 'Foundation & Structure', subcategory: 'Ceiling Structure', item: 'Ceiling Material', required: false, type: 'multiselect', options: ['Drywall', 'Plaster', 'Wood', 'Suspended Tiles'] },
  { id: 'ceiling-structure-inspector-rating', category: 'Foundation & Structure', subcategory: 'Ceiling Structure', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'ceiling-structure-sagging', category: 'Foundation & Structure', subcategory: 'Defects - Ceiling Structure', item: 'Ceiling Sagging', required: false, type: 'checkbox' },
  { id: 'ceiling-structure-water-stains', category: 'Foundation & Structure', subcategory: 'Defects - Ceiling Structure', item: 'Water Stains', required: false, type: 'checkbox' },
  
  // Plumbing - Water Supply
  { id: 'plumbing-supply-material', category: 'Plumbing', subcategory: 'Water Supply', item: 'Supply Line Material', required: false, type: 'multiselect', options: ['Copper', 'PEX', 'CPVC', 'Galvanized', 'PVC'] },
  { id: 'plumbing-supply-rating', category: 'Plumbing', subcategory: 'Water Supply', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'plumbing-supply-leaks', category: 'Plumbing', subcategory: 'Defects - Water Supply', item: 'Active Leaks', required: false, type: 'checkbox' },
  { id: 'plumbing-supply-corrosion', category: 'Plumbing', subcategory: 'Defects - Water Supply', item: 'Pipe Corrosion', required: false, type: 'checkbox' },
  
  // Plumbing - Drain Waste Vent
  { id: 'plumbing-dwv-material', category: 'Plumbing', subcategory: 'Drain Waste Vent', item: 'DWV Material', required: false, type: 'multiselect', options: ['PVC', 'ABS', 'Cast Iron', 'Copper'] },
  { id: 'plumbing-dwv-rating', category: 'Plumbing', subcategory: 'Drain Waste Vent', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'plumbing-dwv-slow-drains', category: 'Plumbing', subcategory: 'Defects - Drain Waste Vent', item: 'Slow Drains', required: false, type: 'checkbox' },
  { id: 'plumbing-dwv-clogs', category: 'Plumbing', subcategory: 'Defects - Drain Waste Vent', item: 'Drain Clogs', required: false, type: 'checkbox' },
  
  // Plumbing - Water Heater
  { id: 'plumbing-waterheater-type', category: 'Plumbing', subcategory: 'Water Heater', item: 'Water Heater Type', required: false, type: 'multiselect', options: ['Tank Gas', 'Tank Electric', 'Tankless Gas', 'Tankless Electric', 'Heat Pump'] },
  { id: 'plumbing-waterheater-age', category: 'Plumbing', subcategory: 'Water Heater', item: 'Age - Year Installed', required: false, type: 'year' },
  { id: 'plumbing-waterheater-capacity', category: 'Plumbing', subcategory: 'Water Heater', item: 'Tank Capacity', required: false, type: 'gallons' },
  { id: 'plumbing-waterheater-rating', category: 'Plumbing', subcategory: 'Water Heater', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'plumbing-waterheater-corrosion', category: 'Plumbing', subcategory: 'Defects - Water Heater', item: 'Tank Corrosion', required: false, type: 'checkbox' },
  { id: 'plumbing-waterheater-leaking', category: 'Plumbing', subcategory: 'Defects - Water Heater', item: 'Leaking', required: false, type: 'checkbox' },
  
  // Plumbing - Fixtures
  { id: 'plumbing-fixtures-type', category: 'Plumbing', subcategory: 'Fixtures', item: 'Fixture Types', required: false, type: 'multiselect', options: ['Toilets', 'Sinks', 'Bathtubs', 'Showers', 'Laundry Connections'] },
  { id: 'plumbing-fixtures-rating', category: 'Plumbing', subcategory: 'Fixtures', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'plumbing-fixtures-leaks', category: 'Plumbing', subcategory: 'Defects - Fixtures', item: 'Fixture Leaks', required: false, type: 'checkbox' },
  { id: 'plumbing-fixtures-caulking', category: 'Plumbing', subcategory: 'Defects - Fixtures', item: 'Caulking Deteriorated', required: false, type: 'checkbox' },
  
  // Electric - Service Entrance
  { id: 'electric-service-amperage', category: 'Electric', subcategory: 'Service Entrance', item: 'Service Amperage', required: false, type: 'multiselect', options: ['100 Amp', '150 Amp', '200 Amp', '400 Amp'] },
  { id: 'electric-service-type', category: 'Electric', subcategory: 'Service Entrance', item: 'Panel Type', required: false, type: 'multiselect', options: ['Main Breaker', 'Fuse Box', 'Sub Panel'] },
  { id: 'electric-service-rating', category: 'Electric', subcategory: 'Service Entrance', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'electric-service-panel-issues', category: 'Electric', subcategory: 'Defects - Service Entrance', item: 'Panel Issues', required: false, type: 'checkbox' },
  { id: 'electric-service-double-tapped', category: 'Electric', subcategory: 'Defects - Service Entrance', item: 'Double-Tapped Breakers', required: false, type: 'checkbox' },
  
  // Electric - Branch Circuits
  { id: 'electric-branch-wiring', category: 'Electric', subcategory: 'Branch Circuits', item: 'Wiring Type', required: false, type: 'multiselect', options: ['Copper', 'Aluminum', 'Knob & Tube', 'Romex'] },
  { id: 'electric-branch-rating', category: 'Electric', subcategory: 'Branch Circuits', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'electric-branch-exposed', category: 'Electric', subcategory: 'Defects - Branch Circuits', item: 'Exposed Wiring', required: false, type: 'checkbox' },
  { id: 'electric-branch-improper', category: 'Electric', subcategory: 'Defects - Branch Circuits', item: 'Improper Connections', required: false, type: 'checkbox' },
  
  // Electric - Connected Devices
  { id: 'electric-devices-type', category: 'Electric', subcategory: 'Connected Devices', item: 'Outlet Types', required: false, type: 'multiselect', options: ['Standard', 'GFCI', 'AFCI', 'USB Outlets'] },
  { id: 'electric-devices-rating', category: 'Electric', subcategory: 'Connected Devices', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'electric-devices-gfci-missing', category: 'Electric', subcategory: 'Defects - Connected Devices', item: 'GFCI Missing', required: false, type: 'checkbox' },
  { id: 'electric-devices-not-grounded', category: 'Electric', subcategory: 'Defects - Connected Devices', item: 'Outlets Not Grounded', required: false, type: 'checkbox' },
  
  // Heating & Cooling - Heating Equipment
  { id: 'hvac-heating-type', category: 'Heating & Cooling', subcategory: 'Heating Equipment', item: 'Heating System Type', required: false, type: 'multiselect', options: ['Forced Air', 'Boiler', 'Heat Pump', 'Radiant', 'Baseboard'] },
  { id: 'hvac-heating-fuel', category: 'Heating & Cooling', subcategory: 'Heating Equipment', item: 'Fuel Type', required: false, type: 'multiselect', options: ['Natural Gas', 'Electric', 'Oil', 'Propane'] },
  { id: 'hvac-heating-age', category: 'Heating & Cooling', subcategory: 'Heating Equipment', item: 'Age - Year Installed', required: false, type: 'year' },
  { id: 'hvac-heating-rating', category: 'Heating & Cooling', subcategory: 'Heating Equipment', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'hvac-heating-rust', category: 'Heating & Cooling', subcategory: 'Defects - Heating Equipment', item: 'Rust/Corrosion', required: false, type: 'checkbox' },
  { id: 'hvac-heating-not-operational', category: 'Heating & Cooling', subcategory: 'Defects - Heating Equipment', item: 'Not Operational', required: false, type: 'checkbox' },
  
  // Heating & Cooling - Cooling Equipment
  { id: 'hvac-cooling-type', category: 'Heating & Cooling', subcategory: 'Cooling Equipment', item: 'Cooling System Type', required: false, type: 'multiselect', options: ['Central AC', 'Heat Pump', 'Mini Split', 'Window Unit', 'Evaporative'] },
  { id: 'hvac-cooling-age', category: 'Heating & Cooling', subcategory: 'Cooling Equipment', item: 'Age - Year Installed', required: false, type: 'year' },
  { id: 'hvac-cooling-rating', category: 'Heating & Cooling', subcategory: 'Cooling Equipment', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'hvac-cooling-refrigerant-leak', category: 'Heating & Cooling', subcategory: 'Defects - Cooling Equipment', item: 'Refrigerant Leak', required: false, type: 'checkbox' },
  { id: 'hvac-cooling-not-operational', category: 'Heating & Cooling', subcategory: 'Defects - Cooling Equipment', item: 'Not Operational', required: false, type: 'checkbox' },
  
  // Heating & Cooling - Operating Controls
  { id: 'hvac-controls-thermostat', category: 'Heating & Cooling', subcategory: 'Operating Controls', item: 'Thermostat Type', required: false, type: 'multiselect', options: ['Manual', 'Programmable', 'Smart', 'Zone Control'] },
  { id: 'hvac-controls-rating', category: 'Heating & Cooling', subcategory: 'Operating Controls', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'hvac-controls-not-working', category: 'Heating & Cooling', subcategory: 'Defects - Operating Controls', item: 'Controls Not Working', required: false, type: 'checkbox' },
  
  // Heating & Cooling - Distribution Systems
  { id: 'hvac-distribution-type', category: 'Heating & Cooling', subcategory: 'Distribution Systems', item: 'Distribution Type', required: false, type: 'multiselect', options: ['Ductwork', 'Radiators', 'Baseboard', 'Radiant Floor'] },
  { id: 'hvac-distribution-rating', category: 'Heating & Cooling', subcategory: 'Distribution Systems', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'hvac-distribution-leaks', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Duct Leaks', required: false, type: 'checkbox' },
  { id: 'hvac-distribution-insulation', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Insulation Damaged', required: false, type: 'checkbox' },
  
  // Heating & Cooling - Vents & Flues
  { id: 'hvac-vents-type', category: 'Heating & Cooling', subcategory: 'Vents & Flues', item: 'Vent Type', required: false, type: 'multiselect', options: ['Metal', 'PVC', 'Masonry Chimney'] },
  { id: 'hvac-vents-rating', category: 'Heating & Cooling', subcategory: 'Vents & Flues', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'hvac-vents-blocked', category: 'Heating & Cooling', subcategory: 'Defects - Vents & Flues', item: 'Blocked Vents', required: false, type: 'checkbox' },
  { id: 'hvac-vents-improper', category: 'Heating & Cooling', subcategory: 'Defects - Vents & Flues', item: 'Improper Venting', required: false, type: 'checkbox' },
  
  // Doors & Windows - Windows
  { id: 'windows-type', category: 'Doors & Windows', subcategory: 'Windows', item: 'Window Type', required: false, type: 'multiselect', options: ['Single Hung', 'Double Hung', 'Casement', 'Sliding', 'Fixed', 'Skylight'] },
  { id: 'windows-frame-material', category: 'Doors & Windows', subcategory: 'Windows', item: 'Frame Material', required: false, type: 'multiselect', options: ['Wood', 'Vinyl', 'Aluminum', 'Fiberglass'] },
  { id: 'windows-rating', category: 'Doors & Windows', subcategory: 'Windows', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'windows-seal-failure', category: 'Doors & Windows', subcategory: 'Defects - Windows', item: 'Seal Failure', required: false, type: 'checkbox' },
  { id: 'windows-broken', category: 'Doors & Windows', subcategory: 'Defects - Windows', item: 'Broken Glass', required: false, type: 'checkbox' },
  
  // Doors & Windows - Entry Doors
  { id: 'entry-doors-material', category: 'Doors & Windows', subcategory: 'Entry Doors', item: 'Door Material', required: false, type: 'multiselect', options: ['Wood', 'Steel', 'Fiberglass', 'Aluminum'] },
  { id: 'entry-doors-rating', category: 'Doors & Windows', subcategory: 'Entry Doors', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'entry-doors-weatherstrip', category: 'Doors & Windows', subcategory: 'Defects - Entry Doors', item: 'Weatherstripping Damaged', required: false, type: 'checkbox' },
  { id: 'entry-doors-hardware', category: 'Doors & Windows', subcategory: 'Defects - Entry Doors', item: 'Hardware Issues', required: false, type: 'checkbox' },
  
  // Doors & Windows - Interior Doors
  { id: 'interior-doors-type', category: 'Doors & Windows', subcategory: 'Interior Doors', item: 'Door Type', required: false, type: 'multiselect', options: ['Hollow Core', 'Solid Core', 'Pocket', 'Bi-Fold', 'French'] },
  { id: 'interior-doors-rating', category: 'Doors & Windows', subcategory: 'Interior Doors', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'interior-doors-sticking', category: 'Doors & Windows', subcategory: 'Defects - Interior Doors', item: 'Door Sticking', required: false, type: 'checkbox' },
  { id: 'interior-doors-hardware', category: 'Doors & Windows', subcategory: 'Defects - Interior Doors', item: 'Hardware Issues', required: false, type: 'checkbox' },
  
  // Doors & Windows - Garage Doors
  { id: 'garage-doors-type', category: 'Doors & Windows', subcategory: 'Garage Doors', item: 'Garage Door Type', required: false, type: 'multiselect', options: ['Sectional', 'Roll-Up', 'Swing-Out', 'Slide'] },
  { id: 'garage-doors-material', category: 'Doors & Windows', subcategory: 'Garage Doors', item: 'Material', required: false, type: 'multiselect', options: ['Steel', 'Wood', 'Aluminum', 'Fiberglass'] },
  { id: 'garage-doors-rating', category: 'Doors & Windows', subcategory: 'Garage Doors', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'garage-doors-opener', category: 'Doors & Windows', subcategory: 'Defects - Garage Doors', item: 'Opener Not Working', required: false, type: 'checkbox' },
  { id: 'garage-doors-safety', category: 'Doors & Windows', subcategory: 'Defects - Garage Doors', item: 'Safety Sensors Issue', required: false, type: 'checkbox' },
  
  // Built-in Appliances - Refrigerator
  { id: 'refrigerator-brand', category: 'Built-in Appliances', subcategory: 'Refrigerator', item: 'Brand/Model', required: false, type: 'multiselect', options: ['Samsung', 'LG', 'Whirlpool', 'GE', 'Frigidaire', 'Other'] },
  { id: 'refrigerator-rating', category: 'Built-in Appliances', subcategory: 'Refrigerator', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'refrigerator-not-cooling', category: 'Built-in Appliances', subcategory: 'Defects - Refrigerator', item: 'Not Cooling Properly', required: false, type: 'checkbox' },
  { id: 'refrigerator-ice-maker', category: 'Built-in Appliances', subcategory: 'Defects - Refrigerator', item: 'Ice Maker Issue', required: false, type: 'checkbox' },
  
  // Built-in Appliances - Range/Oven/Cooktop
  { id: 'range-type', category: 'Built-in Appliances', subcategory: 'Range/Oven/Cooktop', item: 'Range Type', required: false, type: 'multiselect', options: ['Gas', 'Electric', 'Induction', 'Dual Fuel'] },
  { id: 'range-rating', category: 'Built-in Appliances', subcategory: 'Range/Oven/Cooktop', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'range-burner-issue', category: 'Built-in Appliances', subcategory: 'Defects - Range/Oven/Cooktop', item: 'Burner Not Working', required: false, type: 'checkbox' },
  { id: 'range-oven-issue', category: 'Built-in Appliances', subcategory: 'Defects - Range/Oven/Cooktop', item: 'Oven Not Working', required: false, type: 'checkbox' },
  
  // Built-in Appliances - Dishwasher
  { id: 'dishwasher-brand', category: 'Built-in Appliances', subcategory: 'Dishwasher', item: 'Brand/Model', required: false, type: 'multiselect', options: ['Bosch', 'KitchenAid', 'Samsung', 'LG', 'Whirlpool', 'Other'] },
  { id: 'dishwasher-rating', category: 'Built-in Appliances', subcategory: 'Dishwasher', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'dishwasher-leak', category: 'Built-in Appliances', subcategory: 'Defects - Dishwasher', item: 'Leaking', required: false, type: 'checkbox' },
  { id: 'dishwasher-not-draining', category: 'Built-in Appliances', subcategory: 'Defects - Dishwasher', item: 'Not Draining', required: false, type: 'checkbox' },
  
  // Built-in Appliances - Built-in Microwave
  { id: 'microwave-type', category: 'Built-in Appliances', subcategory: 'Built-in Microwave', item: 'Microwave Type', required: false, type: 'multiselect', options: ['Over-Range', 'Built-in', 'Drawer'] },
  { id: 'microwave-rating', category: 'Built-in Appliances', subcategory: 'Built-in Microwave', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'microwave-not-working', category: 'Built-in Appliances', subcategory: 'Defects - Built-in Microwave', item: 'Not Working', required: false, type: 'checkbox' },
  { id: 'microwave-door', category: 'Built-in Appliances', subcategory: 'Defects - Built-in Microwave', item: 'Door Issue', required: false, type: 'checkbox' },
  
  // Built-in Appliances - Garbage Disposal
  { id: 'disposal-brand', category: 'Built-in Appliances', subcategory: 'Garbage Disposal', item: 'Brand', required: false, type: 'multiselect', options: ['InSinkErator', 'Moen', 'Waste King', 'GE', 'Other'] },
  { id: 'disposal-rating', category: 'Built-in Appliances', subcategory: 'Garbage Disposal', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'disposal-not-working', category: 'Built-in Appliances', subcategory: 'Defects - Garbage Disposal', item: 'Not Working', required: false, type: 'checkbox' },
  { id: 'disposal-leaking', category: 'Built-in Appliances', subcategory: 'Defects - Garbage Disposal', item: 'Leaking', required: false, type: 'checkbox' },
  
  // Built-in Appliances - Cooking Exhaust
  { id: 'exhaust-type', category: 'Built-in Appliances', subcategory: 'Cooking Exhaust', item: 'Exhaust Type', required: false, type: 'multiselect', options: ['Range Hood', 'Downdraft', 'Recirculating', 'Ventilated'] },
  { id: 'exhaust-rating', category: 'Built-in Appliances', subcategory: 'Cooking Exhaust', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'exhaust-fan-not-working', category: 'Built-in Appliances', subcategory: 'Defects - Cooking Exhaust', item: 'Fan Not Working', required: false, type: 'checkbox' },
  { id: 'exhaust-filter-dirty', category: 'Built-in Appliances', subcategory: 'Defects - Cooking Exhaust', item: 'Filter Dirty/Damaged', required: false, type: 'checkbox' },
  
  // Green Features
  { id: 'green-solar-panels', category: 'Green Features', item: 'Solar Panels', required: false, type: 'checkbox' },
  { id: 'green-solar-rating', category: 'Green Features', item: 'Solar System Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  { id: 'green-energy-efficient-windows', category: 'Green Features', item: 'Energy Efficient Windows', required: false, type: 'checkbox' },
  { id: 'green-smart-thermostat', category: 'Green Features', item: 'Smart Thermostat', required: false, type: 'checkbox' },
  { id: 'green-insulation', category: 'Green Features', item: 'Enhanced Insulation', required: false, type: 'checkbox' },
  { id: 'green-tankless-water-heater', category: 'Green Features', item: 'Tankless Water Heater', required: false, type: 'checkbox' },
  { id: 'green-ev-charger', category: 'Green Features', item: 'EV Charger', required: false, type: 'checkbox' },
];

interface ChecklistCategoryContentProps {
  categoryId: string;
  subcategory?: string;
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function ChecklistCategoryContent({
  categoryId,
  subcategory,
  formData,
  onChange,
}: ChecklistCategoryContentProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, 'pass' | 'fail' | 'na'>>(formData.checklist || {});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>(formData.checklistSelections || {});
  const [yearValues, setYearValues] = useState<Record<string, string>>(formData.checklistYears || {});
  const [gallonsValues, setGallonsValues] = useState<Record<string, string>>(formData.checklistGallons || {});
  const [ratingValues, setRatingValues] = useState<Record<string, string>>(formData.checklistRatings || {});
  const [notes, setNotes] = useState<Record<string, string>>(formData.checklistNotes || {});
  const [selectedDefects, setSelectedDefects] = useState<Record<string, boolean>>(formData.selectedDefects || {});

  const categoryLabel = categoryMapping[categoryId];

  // Filter items based on category and subcategory
  const filteredItems = inspectionChecklist.filter((item) => {
    if (item.category !== categoryLabel) return false;
    
    if (subcategory) {
      const mapping = subcategoryMapping[categoryId]?.[subcategory];
      if (mapping) {
        return mapping.some(sub => 
          item.subcategory?.includes(sub) || item.subcategory === sub
        );
      }
    }
    
    return true;
  });

  // Handler functions
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

  const handleGallonsChange = (itemId: string, gallons: string) => {
    const updated = { ...gallonsValues, [itemId]: gallons };
    setGallonsValues(updated);
    onChange('checklistGallons', updated);
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
              className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
        );

      case 'gallons':
        return (
          <div className="space-y-2">
            <div className="relative">
              <input
                type="number"
                placeholder="Enter capacity"
                value={gallonsValues[item.id] || ''}
                onChange={(e) => handleGallonsChange(item.id, e.target.value)}
                className="w-full px-3 py-2 pr-16 border border-input rounded-md text-sm bg-background"
                min="1"
                max="500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                gallons
              </span>
            </div>
          </div>
        );
        
      case 'rating':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {item.options?.map((rating) => {
                let colorClasses = '';
                if (item.item.includes('Inspector Overall')) {
                  switch (rating) {
                    case 'Excellent':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300';
                      break;
                    case 'Very Good':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300';
                      break;
                    case 'Good':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-yellow-600 text-white border-yellow-600'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300';
                      break;
                    case 'Poor':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300';
                      break;
                    case 'Replace':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300';
                      break;
                    case 'Not Inspected':
                    case 'Partial Inspected':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-gray-600 text-white border-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300';
                      break;
                    default:
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border';
                  }
                } else {
                  colorClasses = ratingValues[item.id] === rating
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border';
                }

                return (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingChange(item.id, rating)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors border font-medium ${colorClasses}`}
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
        if (item.subcategory?.includes('Defects') || item.subcategory?.includes('Green Features')) {
          return (
            <div className="space-y-3">
              <Textarea
                placeholder="Add inspection comments..."
                value={notes[item.id] || defectDescriptions[item.id] || ''}
                onChange={(e) => handleNoteChange(item.id, e.target.value)}
                className="min-h-[100px] text-sm"
              />
            </div>
          );
        }
        
        return (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleItemCheck(item.id, 'pass')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors font-medium ${
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
              className={`px-3 py-1.5 text-xs rounded-md transition-colors font-medium ${
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
              className={`px-3 py-1.5 text-xs rounded-md transition-colors font-medium ${
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

  if (filteredItems.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>No checklist items found for this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredItems.map((item) => (
        <div
          key={item.id}
          className="p-4 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors space-y-3"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {(item.subcategory?.includes('Defects') || item.subcategory?.includes('Green Features')) && (
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
                      ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
                      : item.subcategory.includes('Green Features')
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
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
            {item.type === 'checkbox' && !item.subcategory?.includes('Defects') && !item.subcategory?.includes('Green Features') && getStatusIcon(checkedItems[item.id])}
          </div>
          
          {renderItemContent(item)}
        </div>
      ))}
    </div>
  );
}
