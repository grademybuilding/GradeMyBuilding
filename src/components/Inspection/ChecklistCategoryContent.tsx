import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, X } from "lucide-react";
import { defectDescriptions } from "@/data/defectDescriptions";
import { missingChecklistDefects } from "@/data/missingChecklistDefects";

interface ChecklistItem {
  id: string;
  category: string;
  subcategory?: string;
  item: string;
  required: boolean;
  type: 'checkbox' | 'rating' | 'year' | 'multiselect' | 'gallons' | 'number' | 'info' | 'textarea' | 'boolean' | 'time' | 'text' | 'radio';
  options?: string[];
  commentText?: string;
}

// Category to label mapping
const categoryMapping: Record<string, string> = {
  'roof': 'Roof',
  'exterior': 'Exterior Cladding',
  'walkways': 'Walkways, Patios & Driveways',
  'decks': 'Wood Decks & Balconies',
  'foundation': 'Foundation & Structure',
  'basement': 'Basement, Foundation and Crawlspace',
  'plumbing': 'Plumbing',
  'electric': 'Electric',
  'electrical': 'Electrical',
  'hvac': 'Heating & Cooling',
  'heating-cooling': 'Heating and Cooling',
  'doors-windows': 'Doors & Windows',
  'doors-windows-interior': 'Doors, Windows & Interior',
  'appliances': 'Built-in Appliances',
  'fireplaces': 'Fireplaces',
  'attic': 'Attic, Insulation & Ventilation',
  'green': 'Green Features',
  'radon': 'Radon',
  'well': 'Well',
  'water-testing': 'Water Testing',
  'pool-spa': 'Swimming Pools and Spas',
  'sewer-lateral': 'Sewer Lateral',
};

// Merge existing checklist with missing defects from XLSX
const mergeChecklists = (existing: ChecklistItem[], missing: typeof missingChecklistDefects): ChecklistItem[] => {
  const existingIds = new Set(existing.map(item => item.id));
  const newItems = missing
    .filter(item => !existingIds.has(item.id))
    .map(item => ({
      ...item,
      type: item.type as ChecklistItem['type'],
    }));
  return [...existing, ...newItems];
};

// Complete Inspection Checklist Data
const inspectionChecklist: ChecklistItem[] = [
  // ============== ROOF ==============
  // Roof - Inspection Details
  { id: 'roof-inspection-method', category: 'Roof', subcategory: 'Inspection Details', item: 'Inspection Method', required: false, type: 'multiselect', options: ['Binoculars', 'Ground', 'Ladder', 'Roof', 'Drone', 'Moisture meter'] },
  { id: 'roof-type-style', category: 'Roof', subcategory: 'Inspection Details', item: 'Roof Type/Style', required: false, type: 'multiselect', options: ['Gable', 'Shed', 'Mansard', 'Combination', 'Gambrel', 'Flat', 'Hip'] },
  
  // Roof - Coverings
  { id: 'roof-age', category: 'Roof', subcategory: 'Coverings', item: 'Age - Year Installed', required: false, type: 'year' },
  { id: 'roof-material', category: 'Roof', subcategory: 'Coverings', item: 'Material', required: false, type: 'multiselect', options: ['Asbestos', 'Ceramic', 'Wood', 'Asphalt', 'Fiberglass', 'Metal', 'Tile', 'Concrete', 'Slate', 'Solar', 'EPDM'] },
  { id: 'roof-inspector-rating', category: 'Roof', subcategory: 'Coverings', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Roof - Defects - Coverings
  { id: 'roof-under-driven-nails', category: 'Roof', subcategory: 'Defects - Coverings', item: 'Under-Driven Nails', required: false, type: 'checkbox' },
  { id: 'roof-tiles-cracked-broken', category: 'Roof', subcategory: 'Defects - Coverings', item: 'Tiles Cracked/Broken', required: false, type: 'checkbox' },
  { id: 'roof-splitting', category: 'Roof', subcategory: 'Defects - Coverings', item: 'Splitting', required: false, type: 'checkbox' },
  { id: 'roof-shingles-missing', category: 'Roof', subcategory: 'Defects - Coverings', item: 'Shingles Missing', required: false, type: 'checkbox' },
  { id: 'roof-underlayment-damage', category: 'Roof', subcategory: 'Defects - Coverings', item: 'Underlayment Damage', required: false, type: 'checkbox' },
  { id: 'roof-improper-nailing', category: 'Roof', subcategory: 'Defects - Coverings', item: 'Improper/Incomplete Nailing', required: false, type: 'checkbox' },
  { id: 'roof-discoloration', category: 'Roof', subcategory: 'Defects - Coverings', item: 'Discoloration', required: false, type: 'checkbox' },
  { id: 'roof-delamination', category: 'Roof', subcategory: 'Defects - Coverings', item: 'Delamination', required: false, type: 'checkbox' },
  { id: 'roof-damaged-general', category: 'Roof', subcategory: 'Defects - Coverings', item: 'Damaged (General)', required: false, type: 'checkbox' },
  { id: 'roof-ponding', category: 'Roof', subcategory: 'Defects - Coverings', item: 'Ponding', required: false, type: 'checkbox' },
  
  // Roof - Roof Drainage Systems
  { id: 'roof-drainage-system-type', category: 'Roof', subcategory: 'Roof Drainage Systems', item: 'Drainage System Type', required: false, type: 'multiselect', options: ['Internal Drains', 'Gutters', 'Scupper Drains'] },
  { id: 'roof-gutter-material', category: 'Roof', subcategory: 'Roof Drainage Systems', item: 'Gutter Material', required: false, type: 'multiselect', options: ['Aluminum', 'Seamless Aluminum', 'Vinyl', 'Copper', 'Steel'] },
  { id: 'roof-drainage-inspector-rating', category: 'Roof', subcategory: 'Roof Drainage Systems', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Roof - Defects - Roof Drainage Systems
  { id: 'roof-gutters-missing', category: 'Roof', subcategory: 'Defects - Roof Drainage Systems', item: 'Gutters Missing', required: false, type: 'checkbox' },
  { id: 'roof-gutter-loose', category: 'Roof', subcategory: 'Defects - Roof Drainage Systems', item: 'Gutter Loose', required: false, type: 'checkbox' },
  { id: 'roof-gutter-leakage', category: 'Roof', subcategory: 'Defects - Roof Drainage Systems', item: 'Gutter Leakage', required: false, type: 'checkbox' },
  { id: 'roof-gutter-improperly-sloped', category: 'Roof', subcategory: 'Defects - Roof Drainage Systems', item: 'Gutter Improperly Sloped', required: false, type: 'checkbox' },
  { id: 'roof-gutter-damaged', category: 'Roof', subcategory: 'Defects - Roof Drainage Systems', item: 'Gutter Damaged', required: false, type: 'checkbox' },
  { id: 'roof-downspouts-missing', category: 'Roof', subcategory: 'Defects - Roof Drainage Systems', item: 'Downspouts Missing', required: false, type: 'checkbox' },
  { id: 'roof-downspouts-drain-near-house', category: 'Roof', subcategory: 'Defects - Roof Drainage Systems', item: 'Downspouts Drain Near House', required: false, type: 'checkbox' },
  { id: 'roof-debris', category: 'Roof', subcategory: 'Defects - Roof Drainage Systems', item: 'Debris', required: false, type: 'checkbox' },
  
  // Roof - Flashing
  { id: 'roof-flashing-material', category: 'Roof', subcategory: 'Flashing', item: 'Flashing Material', required: false, type: 'multiselect', options: ['Aluminum', 'Copper', 'Galvanized Steel', 'Lead', 'Rubber', 'Plastic'] },
  { id: 'roof-flashing-condition', category: 'Roof', subcategory: 'Flashing', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Roof - Defects - Flashing
  { id: 'roof-flashing-damaged', category: 'Roof', subcategory: 'Defects - Flashing', item: 'Flashing Damaged', required: false, type: 'checkbox' },
  { id: 'roof-flashing-loose', category: 'Roof', subcategory: 'Defects - Flashing', item: 'Flashing Loose', required: false, type: 'checkbox' },
  { id: 'roof-flashing-missing', category: 'Roof', subcategory: 'Defects - Flashing', item: 'Flashing Missing', required: false, type: 'checkbox' },
  { id: 'roof-flashing-improper-installation', category: 'Roof', subcategory: 'Defects - Flashing', item: 'Flashing Improper Installation', required: false, type: 'checkbox' },
  
  // Roof - Skylights & Chimneys
  { id: 'roof-skylights-chimneys-material', category: 'Roof', subcategory: 'Skylights & Chimneys', item: 'Skylight/Chimney Material', required: false, type: 'multiselect', options: ['Glass', 'Acrylic', 'Polycarbonate', 'Brick', 'Stone', 'Metal', 'Stucco'] },
  { id: 'roof-skylights-chimneys-inspector-rating', category: 'Roof', subcategory: 'Skylights & Chimneys', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Roof - Defects - Skylights & Chimneys
  { id: 'roof-skylight-water-penetration', category: 'Roof', subcategory: 'Defects - Skylights & Chimneys', item: 'Skylight Water Penetration', required: false, type: 'checkbox' },
  { id: 'roof-skylight-cracked', category: 'Roof', subcategory: 'Defects - Skylights & Chimneys', item: 'Skylight Cracked', required: false, type: 'checkbox' },
  { id: 'roof-metal-chimney-rust', category: 'Roof', subcategory: 'Defects - Skylights & Chimneys', item: 'Metal Chimney Rust', required: false, type: 'checkbox' },
  { id: 'roof-chimney-unlined', category: 'Roof', subcategory: 'Defects - Skylights & Chimneys', item: 'Chimney Unlined', required: false, type: 'checkbox' },
  { id: 'roof-chimney-repoint-needed', category: 'Roof', subcategory: 'Defects - Skylights & Chimneys', item: 'Chimney Repoint Needed', required: false, type: 'checkbox' },
  { id: 'roof-chimney-flue-dirty', category: 'Roof', subcategory: 'Defects - Skylights & Chimneys', item: 'Chimney Flue Dirty', required: false, type: 'checkbox' },
  { id: 'roof-chimney-flue-cracked', category: 'Roof', subcategory: 'Defects - Skylights & Chimneys', item: 'Chimney Flue Cracked', required: false, type: 'checkbox' },
  { id: 'roof-chimney-cap-missing', category: 'Roof', subcategory: 'Defects - Skylights & Chimneys', item: 'Chimney Cap Missing', required: false, type: 'checkbox' },
  
  // Roof - Eaves, Soffits & Fascia
  { id: 'roof-eaves-soffits-fascia-material', category: 'Roof', subcategory: 'Eaves, Soffits & Fascia', item: 'Material', required: false, type: 'multiselect', options: ['Wood', 'Vinyl', 'Aluminum', 'Fiber Cement', 'Steel', 'Composite'] },
  { id: 'roof-eaves-soffits-fascia-inspector-rating', category: 'Roof', subcategory: 'Eaves, Soffits & Fascia', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Roof - Defects - Eaves, Soffits & Fascia
  { id: 'roof-wasps-nest', category: 'Roof', subcategory: 'Defects - Eaves, Soffits & Fascia', item: 'Wasps Nest', required: false, type: 'checkbox' },
  { id: 'roof-paint-finish-failing', category: 'Roof', subcategory: 'Defects - Eaves, Soffits & Fascia', item: 'Paint/Finish Failing', required: false, type: 'checkbox' },
  { id: 'roof-gap', category: 'Roof', subcategory: 'Defects - Eaves, Soffits & Fascia', item: 'Gap', required: false, type: 'checkbox' },
  { id: 'roof-fascia-rotted', category: 'Roof', subcategory: 'Defects - Eaves, Soffits & Fascia', item: 'Fascia - Rotted', required: false, type: 'checkbox' },
  { id: 'roof-fascia-loose', category: 'Roof', subcategory: 'Defects - Eaves, Soffits & Fascia', item: 'Fascia - Loose', required: false, type: 'checkbox' },
  { id: 'roof-fascia-damaged', category: 'Roof', subcategory: 'Defects - Eaves, Soffits & Fascia', item: 'Fascia - Damaged', required: false, type: 'checkbox' },
  { id: 'roof-eaves-water-stains', category: 'Roof', subcategory: 'Defects - Eaves, Soffits & Fascia', item: 'Eaves - Water Stains', required: false, type: 'checkbox' },
  { id: 'roof-eaves-damaged', category: 'Roof', subcategory: 'Defects - Eaves, Soffits & Fascia', item: 'Eaves - Damaged', required: false, type: 'checkbox' },

  // ============== EXTERIOR CLADDING ==============
  // Exterior Cladding - Inspection Details
  { id: 'exterior-inspection-method', category: 'Exterior Cladding', subcategory: 'Inspection Details', item: 'Inspection Method', required: false, type: 'multiselect', options: ['Crawlspace Access', 'Infrared', 'Visual', 'Attic Access'] },
  
  // Exterior Cladding - Siding, Flashing & Trim
  { id: 'exterior-siding-material', category: 'Exterior Cladding', subcategory: 'Siding, Flashing & Trim', item: 'Cladding Material', required: false, type: 'multiselect', options: ['Aluminum', 'Plastic', 'Logs', 'Asbestos', 'Asphalt', 'Brick', 'Concrete', 'Fiber Cement', 'Stucco', 'Brick Veneer', 'Engineered Wood', 'Masonry', 'Metal', 'Vinyl', 'Wood', 'Shingles', 'Stone', 'Stone Veneer'] },
  { id: 'exterior-siding-inspector-rating', category: 'Exterior Cladding', subcategory: 'Siding, Flashing & Trim', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Exterior Cladding - Defects - Siding, Flashing & Trim
  { id: 'exterior-multiple-layers-siding', category: 'Exterior Cladding', subcategory: 'Defects - Siding, Flashing & Trim', item: 'Multiple Layers of Siding', required: false, type: 'checkbox' },
  { id: 'exterior-mildew-algae', category: 'Exterior Cladding', subcategory: 'Defects - Siding, Flashing & Trim', item: 'Mildew/Algae', required: false, type: 'checkbox' },
  { id: 'exterior-loose-boards', category: 'Exterior Cladding', subcategory: 'Defects - Siding, Flashing & Trim', item: 'Loose Boards', required: false, type: 'checkbox' },
  { id: 'exterior-hail-damage-minor', category: 'Exterior Cladding', subcategory: 'Defects - Siding, Flashing & Trim', item: 'Hail Damage - Minor', required: false, type: 'checkbox' },
  { id: 'exterior-hail-damage-major', category: 'Exterior Cladding', subcategory: 'Defects - Siding, Flashing & Trim', item: 'Hail Damage - Major', required: false, type: 'checkbox' },
  { id: 'exterior-warping-buckling', category: 'Exterior Cladding', subcategory: 'Defects - Siding, Flashing & Trim', item: 'Warping/Buckling', required: false, type: 'checkbox' },
  { id: 'exterior-flashing-trim-improperly-installed', category: 'Exterior Cladding', subcategory: 'Defects - Siding, Flashing & Trim', item: 'Flashing/Trim Improperly Installed', required: false, type: 'checkbox' },
  { id: 'exterior-evidence-water-intrusion', category: 'Exterior Cladding', subcategory: 'Defects - Siding, Flashing & Trim', item: 'Evidence of Water Intrusion', required: false, type: 'checkbox' },
  { id: 'exterior-cracking-minor', category: 'Exterior Cladding', subcategory: 'Defects - Siding, Flashing & Trim', item: 'Cracking - Minor', required: false, type: 'checkbox' },
  { id: 'exterior-cracking-major', category: 'Exterior Cladding', subcategory: 'Defects - Siding, Flashing & Trim', item: 'Cracking - Major', required: false, type: 'checkbox' },
  { id: 'exterior-ground-clearance', category: 'Exterior Cladding', subcategory: 'Defects - Siding, Flashing & Trim', item: 'Ground Clearance', required: false, type: 'checkbox' },
  { id: 'exterior-splitting', category: 'Exterior Cladding', subcategory: 'Defects - Siding, Flashing & Trim', item: 'Splitting', required: false, type: 'checkbox' },

  // ============== WALKWAYS, PATIOS & DRIVEWAYS ==============
  { id: 'walkways-driveway-material', category: 'Walkways, Patios & Driveways', item: 'Driveway Material', required: false, type: 'multiselect', options: ['Asphalt', 'Brick', 'Cobblestone', 'Concrete', 'Dirt', 'Gravel', 'Pavers', 'Street Parking'] },
  { id: 'walkways-inspector-rating', category: 'Walkways, Patios & Driveways', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Walkways - Defects
  { id: 'walkways-walkway-cracking-major', category: 'Walkways, Patios & Driveways', subcategory: 'Defects', item: 'Walkway Cracking - Major', required: false, type: 'checkbox' },
  { id: 'walkways-walkway-cracking-minor', category: 'Walkways, Patios & Driveways', subcategory: 'Defects', item: 'Walkway Cracking - Minor', required: false, type: 'checkbox' },
  { id: 'walkways-patio-cracking-minor', category: 'Walkways, Patios & Driveways', subcategory: 'Defects', item: 'Patio Cracking - Minor', required: false, type: 'checkbox' },
  { id: 'walkways-patio-cracking-major', category: 'Walkways, Patios & Driveways', subcategory: 'Defects', item: 'Patio Cracking - Major', required: false, type: 'checkbox' },
  { id: 'walkways-driveway-draining-towards-home', category: 'Walkways, Patios & Driveways', subcategory: 'Defects', item: 'Driveway Draining Towards Home', required: false, type: 'checkbox' },
  { id: 'walkways-driveway-cracking-minor', category: 'Walkways, Patios & Driveways', subcategory: 'Defects', item: 'Driveway Cracking - Minor', required: false, type: 'checkbox' },
  { id: 'walkways-driveway-cracking-major', category: 'Walkways, Patios & Driveways', subcategory: 'Defects', item: 'Driveway Cracking - Major', required: false, type: 'checkbox' },
  { id: 'walkways-driveway-trip-hazard', category: 'Walkways, Patios & Driveways', subcategory: 'Defects', item: 'Driveway Trip Hazard', required: false, type: 'checkbox' },

  // ============== WOOD DECKS & BALCONIES ==============
  // Wood Decks - Deck and Balconies
  { id: 'wood-decks-appurtenance', category: 'Wood Decks & Balconies', subcategory: 'Deck and Balconies', item: 'Appurtenance', required: false, type: 'multiselect', options: ['Balcony', 'Covered Porch', 'Deck with Steps', 'Shed', 'Deck', 'Sidewalk', 'Front Porch', 'Pool', 'Sunroom', 'Hot Tub', 'Patio', 'Retaining Wall'] },
  { id: 'wood-decks-material', category: 'Wood Decks & Balconies', subcategory: 'Deck and Balconies', item: 'Material', required: false, type: 'multiselect', options: ['Composite', 'Concrete', 'Wood'] },
  { id: 'wood-decks-inspector-rating', category: 'Wood Decks & Balconies', subcategory: 'Deck and Balconies', item: 'Overall Inspection Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Wood Decks - Defects - Deck and Balconies
  { id: 'wood-decks-ledger-board-improperly-installed', category: 'Wood Decks & Balconies', subcategory: 'Defects - Deck and Balconies', item: 'Ledger Board Improperly Installed', required: false, type: 'checkbox' },
  { id: 'wood-decks-joist-hangers', category: 'Wood Decks & Balconies', subcategory: 'Defects - Deck and Balconies', item: 'Joist Hangers', required: false, type: 'checkbox' },
  { id: 'wood-decks-improper-deck-construction', category: 'Wood Decks & Balconies', subcategory: 'Defects - Deck and Balconies', item: 'Improper Deck Construction Practices', required: false, type: 'checkbox' },
  { id: 'wood-decks-water-sealant-required', category: 'Wood Decks & Balconies', subcategory: 'Defects - Deck and Balconies', item: 'Deck - Water Sealant Required', required: false, type: 'checkbox' },
  { id: 'wood-decks-stairs-deteriorated', category: 'Wood Decks & Balconies', subcategory: 'Defects - Deck and Balconies', item: 'Stairs - Deteriorated', required: false, type: 'checkbox' },
  { id: 'wood-decks-rotted-boards', category: 'Wood Decks & Balconies', subcategory: 'Defects - Deck and Balconies', item: 'Deck - Rotted Boards', required: false, type: 'checkbox' },
  { id: 'wood-decks-nails-exposed', category: 'Wood Decks & Balconies', subcategory: 'Defects - Deck and Balconies', item: 'Deck - Nails Exposed', required: false, type: 'checkbox' },
  { id: 'wood-decks-loose-boards', category: 'Wood Decks & Balconies', subcategory: 'Defects - Deck and Balconies', item: 'Deck - Loose Boards', required: false, type: 'checkbox' },
  { id: 'wood-decks-unstable-support', category: 'Wood Decks & Balconies', subcategory: 'Defects - Deck and Balconies', item: 'Deck - Unstable Support', required: false, type: 'checkbox' },
  { id: 'wood-decks-railing-unsafe', category: 'Wood Decks & Balconies', subcategory: 'Defects - Deck and Balconies', item: 'Railing Unsafe', required: false, type: 'checkbox' },

  // ============== FOUNDATION & STRUCTURE ==============
  // Foundation - Inspection Method
  { id: 'foundation-inspection-method', category: 'Foundation & Structure', item: 'Inspection Method', required: false, type: 'multiselect', options: ['Attic Access', 'Basement Access', 'Crawlspace Access', 'Infrared', 'Visual'] },
  
  // Foundation - Foundation
  { id: 'foundation-material', category: 'Foundation & Structure', subcategory: 'Foundation', item: 'Material', required: false, type: 'multiselect', options: ['Brick', 'Concrete', 'Masonry Block', 'Stone', 'Rock', 'Slab on Grade'] },
  { id: 'foundation-inspector-rating', category: 'Foundation & Structure', subcategory: 'Foundation', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Foundation - Defects - Foundation
  { id: 'foundation-walls-bowing-leaning', category: 'Foundation & Structure', subcategory: 'Defects - Foundation', item: 'Wall(s) Bowing/Leaning', required: false, type: 'checkbox' },
  { id: 'foundation-poor-ventilation', category: 'Foundation & Structure', subcategory: 'Defects - Foundation', item: 'Poor Ventilation of Foundation Area', required: false, type: 'checkbox' },
  { id: 'foundation-improper-construction', category: 'Foundation & Structure', subcategory: 'Defects - Foundation', item: 'Improper Construction Practices', required: false, type: 'checkbox' },
  { id: 'foundation-water-intrusion', category: 'Foundation & Structure', subcategory: 'Defects - Foundation', item: 'Water Intrusion', required: false, type: 'checkbox' },
  { id: 'foundation-cracks-minor', category: 'Foundation & Structure', subcategory: 'Defects - Foundation', item: 'Foundation Cracks - Minor', required: false, type: 'checkbox' },
  { id: 'foundation-cracks-major', category: 'Foundation & Structure', subcategory: 'Defects - Foundation', item: 'Foundation Cracks - Major', required: false, type: 'checkbox' },
  { id: 'foundation-heaving-settling', category: 'Foundation & Structure', subcategory: 'Defects - Foundation', item: 'Heaving/Settling', required: false, type: 'checkbox' },
  
  // Foundation - Basement & Crawlspace
  { id: 'foundation-basement-crawlspace-type', category: 'Foundation & Structure', subcategory: 'Basement & Crawlspace', item: 'Type', required: false, type: 'multiselect', options: ['Full Basement', 'Partial Basement', 'Crawlspace', 'Slab on Grade', 'Walk-out Basement', 'Daylight Basement'] },
  { id: 'foundation-basement-crawlspace-material', category: 'Foundation & Structure', subcategory: 'Basement & Crawlspace', item: 'Material', required: false, type: 'multiselect', options: ['Concrete Block', 'Poured Concrete', 'Stone', 'Brick', 'Wood Frame', 'Steel Frame'] },
  { id: 'foundation-basement-crawlspace-inspector-rating', category: 'Foundation & Structure', subcategory: 'Basement & Crawlspace', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Foundation - Defects - Basements & Crawlspaces
  { id: 'basements-high-moisture-levels', category: 'Foundation & Structure', subcategory: 'Defects - Basements & Crawlspaces', item: 'High Moisture Levels', required: false, type: 'checkbox' },
  { id: 'basements-efflorescence', category: 'Foundation & Structure', subcategory: 'Defects - Basements & Crawlspaces', item: 'Efflorescence', required: false, type: 'checkbox' },
  
  // Foundation - Floor Structure
  { id: 'foundation-floor-structure-material', category: 'Foundation & Structure', subcategory: 'Floor Structure', item: 'Material', required: false, type: 'multiselect', options: ['Concrete Slab', 'Wood Joists', 'Steel Joists', 'Engineered Lumber', 'Composite Deck'] },
  { id: 'foundation-floor-structure-inspector-rating', category: 'Foundation & Structure', subcategory: 'Floor Structure', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Foundation - Defects - Floor Structure
  { id: 'foundation-floor-structure-sagging', category: 'Foundation & Structure', subcategory: 'Defects - Floor Structure', item: 'Floor Sagging', required: false, type: 'checkbox' },
  { id: 'foundation-floor-structure-bouncy', category: 'Foundation & Structure', subcategory: 'Defects - Floor Structure', item: 'Floor Bouncy/Springy', required: false, type: 'checkbox' },
  { id: 'foundation-floor-structure-damaged-joists', category: 'Foundation & Structure', subcategory: 'Defects - Floor Structure', item: 'Damaged/Cracked Joists', required: false, type: 'checkbox' },
  { id: 'foundation-floor-structure-inadequate-support', category: 'Foundation & Structure', subcategory: 'Defects - Floor Structure', item: 'Inadequate Support', required: false, type: 'checkbox' },
  { id: 'foundation-floor-structure-rot-damage', category: 'Foundation & Structure', subcategory: 'Defects - Floor Structure', item: 'Rot/Moisture Damage', required: false, type: 'checkbox' },
  
  // Foundation - Wall Structure
  { id: 'foundation-wall-structure-material', category: 'Foundation & Structure', subcategory: 'Wall Structure', item: 'Material', required: false, type: 'multiselect', options: ['Wood Frame', 'Steel Frame', 'Masonry', 'Concrete Block', 'Poured Concrete', 'Stone'] },
  { id: 'foundation-wall-structure-inspector-rating', category: 'Foundation & Structure', subcategory: 'Wall Structure', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Foundation - Defects - Wall Structure
  { id: 'foundation-wall-structure-bowing', category: 'Foundation & Structure', subcategory: 'Defects - Wall Structure', item: 'Wall Bowing/Bulging', required: false, type: 'checkbox' },
  { id: 'foundation-wall-structure-cracks', category: 'Foundation & Structure', subcategory: 'Defects - Wall Structure', item: 'Structural Cracks', required: false, type: 'checkbox' },
  { id: 'foundation-wall-structure-water-damage', category: 'Foundation & Structure', subcategory: 'Defects - Wall Structure', item: 'Water Damage/Stains', required: false, type: 'checkbox' },
  { id: 'foundation-wall-structure-insulation-issues', category: 'Foundation & Structure', subcategory: 'Defects - Wall Structure', item: 'Insulation Issues', required: false, type: 'checkbox' },
  { id: 'foundation-wall-structure-mold-growth', category: 'Foundation & Structure', subcategory: 'Defects - Wall Structure', item: 'Mold/Mildew Growth', required: false, type: 'checkbox' },
  
  // Foundation - Ceiling Structure
  { id: 'foundation-ceiling-structure-material', category: 'Foundation & Structure', subcategory: 'Ceiling Structure', item: 'Material', required: false, type: 'multiselect', options: ['Exposed Joists', 'Drywall', 'Plaster', 'Drop Ceiling', 'Concrete', 'Unfinished'] },
  { id: 'foundation-ceiling-structure-inspector-rating', category: 'Foundation & Structure', subcategory: 'Ceiling Structure', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Foundation - Defects - Ceiling Structure
  { id: 'foundation-ceiling-structure-sagging', category: 'Foundation & Structure', subcategory: 'Defects - Ceiling Structure', item: 'Ceiling Sagging', required: false, type: 'checkbox' },
  { id: 'foundation-ceiling-structure-water-stains', category: 'Foundation & Structure', subcategory: 'Defects - Ceiling Structure', item: 'Water Stains/Leaks', required: false, type: 'checkbox' },
  { id: 'foundation-ceiling-structure-damaged-joists', category: 'Foundation & Structure', subcategory: 'Defects - Ceiling Structure', item: 'Damaged Ceiling Joists', required: false, type: 'checkbox' },
  { id: 'foundation-ceiling-structure-poor-ventilation', category: 'Foundation & Structure', subcategory: 'Defects - Ceiling Structure', item: 'Poor Ventilation/Air Flow', required: false, type: 'checkbox' },
  { id: 'foundation-ceiling-structure-insulation-problems', category: 'Foundation & Structure', subcategory: 'Defects - Ceiling Structure', item: 'Insulation Problems', required: false, type: 'checkbox' },

  // ============== PLUMBING ==============
  // Plumbing - Hot Water System
  { id: 'plumbing-hot-water-system', category: 'Plumbing', subcategory: 'Water Heater', item: 'Hot Water System', required: false, type: 'multiselect', options: ['Gas', 'Electric', 'Tankless', 'Solar', 'Heat Pump'] },
  { id: 'plumbing-hot-water-manufacturer', category: 'Plumbing', subcategory: 'Water Heater', item: 'Hot Water System Manufacturer', required: false, type: 'multiselect', options: ['Rheem', 'AO Smith', 'Bradford White', 'Whirlpool', 'GE', 'Kenmore', 'State', 'American', 'Other', 'Unknown'] },
  { id: 'plumbing-hot-water-location', category: 'Plumbing', subcategory: 'Water Heater', item: 'Hot Water System Location', required: false, type: 'multiselect', options: ['Basement', 'Garage', 'Utility Room', 'Attic', 'Closet', 'Exterior', 'Crawl Space', 'Other'] },
  { id: 'plumbing-water-heater-age', category: 'Plumbing', subcategory: 'Water Heater', item: 'Water Heater Age - Year Installed', required: false, type: 'year' },
  { id: 'plumbing-hot-water-capacity', category: 'Plumbing', subcategory: 'Water Heater', item: 'Capacity', required: false, type: 'gallons' },
  { id: 'plumbing-water-heater-rating', category: 'Plumbing', subcategory: 'Water Heater', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Plumbing - Water Supply
  { id: 'plumbing-main-water-shutoff-location', category: 'Plumbing', subcategory: 'Water Supply', item: 'Main Water Shut-off Device - Location', required: false, type: 'multiselect', options: ['Basement', 'Crawlspace', 'North', 'South', 'East', 'West'] },
  { id: 'plumbing-water-supply-material', category: 'Plumbing', subcategory: 'Water Supply', item: 'Water Supply Material', required: false, type: 'multiselect', options: ['Copper', 'Galvanized', 'Unknown', 'Hose', 'Pex', 'Poly', 'PVC'] },
  { id: 'plumbing-water-source', category: 'Plumbing', subcategory: 'Water Supply', item: 'Water Source', required: false, type: 'multiselect', options: ['Public', 'Spring', 'Unknown', 'Well'] },
  { id: 'plumbing-filters', category: 'Plumbing', subcategory: 'Water Supply', item: 'Filters', required: false, type: 'multiselect', options: ['None', 'Sediment Filter', 'System flush', 'Unknown', 'Whole house conditioner'] },
  { id: 'plumbing-water-supply-rating', category: 'Plumbing', subcategory: 'Water Supply', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Plumbing - Drain Waste Vent
  { id: 'plumbing-drain-waste-vent-material', category: 'Plumbing', subcategory: 'Drain Waste Vent', item: 'Material', required: false, type: 'multiselect', options: ['ABS', 'Copper', 'Iron', 'Lead', 'PVC', 'Unknown'] },
  { id: 'plumbing-drain-waste-vent-rating', category: 'Plumbing', subcategory: 'Drain Waste Vent', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Plumbing - Fixtures
  { id: 'plumbing-fixtures-type', category: 'Plumbing', subcategory: 'Fixtures', item: 'Fixture Types', required: false, type: 'multiselect', options: ['Toilets', 'Sinks', 'Bathtubs', 'Showers', 'Laundry Connections'] },
  { id: 'plumbing-fixtures-rating', category: 'Plumbing', subcategory: 'Fixtures', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Plumbing - Sump Pump
  { id: 'plumbing-sump-pump-location', category: 'Plumbing', subcategory: 'Sump Pump', item: 'Location', required: false, type: 'multiselect', options: ['Basement', 'Under Stairs', 'Bedroom Closet'] },
  
  // Plumbing - Back-flow Prevention
  { id: 'plumbing-backflow-prevention-location', category: 'Plumbing', subcategory: 'Back-flow Prevention Device', item: 'Location', required: false, type: 'multiselect', options: ['North', 'South', 'East', 'West', 'Front of Building', 'Back of Building', 'Basement'] },
  
  // Plumbing - Defects
  { id: 'plumbing-leaky-faucets', category: 'Plumbing', subcategory: 'Defects', item: 'Leaky Faucets', required: false, type: 'checkbox' },
  { id: 'plumbing-running-toilet', category: 'Plumbing', subcategory: 'Defects', item: 'Running Toilet', required: false, type: 'checkbox' },
  { id: 'plumbing-clogged-drains', category: 'Plumbing', subcategory: 'Defects', item: 'Clogged Drains', required: false, type: 'checkbox' },
  { id: 'plumbing-low-water-pressure', category: 'Plumbing', subcategory: 'Defects', item: 'Low Water Pressure', required: false, type: 'checkbox' },
  { id: 'plumbing-pipe-leaks', category: 'Plumbing', subcategory: 'Defects', item: 'Pipe Leaks', required: false, type: 'checkbox' },
  { id: 'plumbing-water-heater-issues', category: 'Plumbing', subcategory: 'Defects', item: 'Water Heater Issues', required: false, type: 'checkbox' },
  { id: 'plumbing-sewer-backup', category: 'Plumbing', subcategory: 'Defects', item: 'Sewer Backup', required: false, type: 'checkbox' },
  { id: 'plumbing-frozen-pipes', category: 'Plumbing', subcategory: 'Defects', item: 'Frozen Pipes', required: false, type: 'checkbox' },

  // ============== ELECTRIC ==============
  // Electric - Service Entrance
  { id: 'electric-main-panel-type', category: 'Electric', subcategory: 'Service Entrance', item: 'Main Panel Type', required: false, type: 'multiselect', options: ['Circuit Breaker', 'Fuse Box', 'Main Lug', 'Main Breaker'] },
  { id: 'electric-panel-amperage', category: 'Electric', subcategory: 'Service Entrance', item: 'Panel Amperage', required: false, type: 'multiselect', options: ['100 Amp', '150 Amp', '200 Amp', '400 Amp', 'Other'] },
  { id: 'electric-service-entrance-rating', category: 'Electric', subcategory: 'Service Entrance', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Electric - Branch Circuits
  { id: 'electric-wiring-type', category: 'Electric', subcategory: 'Branch Circuits', item: 'Wiring Type', required: false, type: 'multiselect', options: ['Copper', 'Aluminum', 'Knob and Tube', 'Romex', 'Conduit'] },
  { id: 'electric-branch-circuits-rating', category: 'Electric', subcategory: 'Branch Circuits', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Electric - Connected Devices
  { id: 'electric-outlets-type', category: 'Electric', subcategory: 'Connected Devices', item: 'Outlet Types', required: false, type: 'multiselect', options: ['Standard', 'GFCI', 'AFCI', 'USB Outlets'] },
  { id: 'electric-connected-devices-rating', category: 'Electric', subcategory: 'Connected Devices', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Electric - Defects
  { id: 'electric-overloaded-circuits', category: 'Electric', subcategory: 'Defects', item: 'Overloaded Circuits', required: false, type: 'checkbox' },
  { id: 'electric-gfci-issues', category: 'Electric', subcategory: 'Defects', item: 'GFCI Issues', required: false, type: 'checkbox' },
  { id: 'electric-exposed-wiring', category: 'Electric', subcategory: 'Defects', item: 'Exposed Wiring', required: false, type: 'checkbox' },
  { id: 'electric-flickering-lights', category: 'Electric', subcategory: 'Defects', item: 'Flickering Lights', required: false, type: 'checkbox' },
  { id: 'electric-dead-outlets', category: 'Electric', subcategory: 'Defects', item: 'Dead Outlets', required: false, type: 'checkbox' },
  { id: 'electric-panel-issues', category: 'Electric', subcategory: 'Defects', item: 'Panel Issues', required: false, type: 'checkbox' },
  { id: 'electric-improper-grounding', category: 'Electric', subcategory: 'Defects', item: 'Improper Grounding', required: false, type: 'checkbox' },
  { id: 'electric-outdated-wiring', category: 'Electric', subcategory: 'Defects', item: 'Outdated Wiring', required: false, type: 'checkbox' },

  // ============== HEATING & COOLING ==============
  // Heating Equipment
  { id: 'heating-equipment-type', category: 'Heating & Cooling', subcategory: 'Heating Equipment', item: 'Heating Equipment Type', required: false, type: 'multiselect', options: ['Forced Air', 'Hot Water/Steam', 'Heat Pump', 'Electric Baseboard', 'Radiant Floor', 'Geothermal', 'Solar'] },
  { id: 'heating-equipment-fuel-type', category: 'Heating & Cooling', subcategory: 'Heating Equipment', item: 'Fuel Type', required: false, type: 'multiselect', options: ['Natural Gas', 'Propane', 'Electric', 'Oil', 'Wood', 'Coal', 'Solar'] },
  { id: 'heating-equipment-age', category: 'Heating & Cooling', subcategory: 'Heating Equipment', item: 'Age - Year Installed', required: false, type: 'year' },
  { id: 'heating-equipment-inspector-rating', category: 'Heating & Cooling', subcategory: 'Heating Equipment', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Heating Equipment - Defects
  { id: 'heating-equipment-inadequate-ventilation', category: 'Heating & Cooling', subcategory: 'Defects - Heating Equipment', item: 'Inadequate Ventilation', required: false, type: 'checkbox' },
  { id: 'heating-equipment-filter-dirty', category: 'Heating & Cooling', subcategory: 'Defects - Heating Equipment', item: 'Filter Dirty/Missing', required: false, type: 'checkbox' },
  { id: 'heating-equipment-gas-leak', category: 'Heating & Cooling', subcategory: 'Defects - Heating Equipment', item: 'Gas Leak Detected', required: false, type: 'checkbox' },
  { id: 'heating-equipment-heat-exchanger-cracked', category: 'Heating & Cooling', subcategory: 'Defects - Heating Equipment', item: 'Heat Exchanger Cracked', required: false, type: 'checkbox' },
  { id: 'heating-equipment-improper-installation', category: 'Heating & Cooling', subcategory: 'Defects - Heating Equipment', item: 'Improper Installation', required: false, type: 'checkbox' },
  
  // Cooling Equipment
  { id: 'cooling-equipment-type', category: 'Heating & Cooling', subcategory: 'Cooling Equipment', item: 'Cooling Equipment Type', required: false, type: 'multiselect', options: ['Central Air', 'Heat Pump', 'Window Units', 'Ductless Mini-Split', 'Evaporative Cooler', 'Geothermal'] },
  { id: 'cooling-equipment-age', category: 'Heating & Cooling', subcategory: 'Cooling Equipment', item: 'Age - Year Installed', required: false, type: 'year' },
  { id: 'cooling-equipment-inspector-rating', category: 'Heating & Cooling', subcategory: 'Cooling Equipment', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Cooling Equipment - Defects
  { id: 'cooling-equipment-refrigerant-leak', category: 'Heating & Cooling', subcategory: 'Defects - Cooling Equipment', item: 'Refrigerant Leak', required: false, type: 'checkbox' },
  { id: 'cooling-equipment-condenser-dirty', category: 'Heating & Cooling', subcategory: 'Defects - Cooling Equipment', item: 'Condenser Coils Dirty', required: false, type: 'checkbox' },
  { id: 'cooling-equipment-inadequate-cooling', category: 'Heating & Cooling', subcategory: 'Defects - Cooling Equipment', item: 'Inadequate Cooling Capacity', required: false, type: 'checkbox' },
  { id: 'cooling-equipment-electrical-issues', category: 'Heating & Cooling', subcategory: 'Defects - Cooling Equipment', item: 'Electrical Connection Issues', required: false, type: 'checkbox' },
  
  // Operating Controls
  { id: 'operating-controls-thermostat-type', category: 'Heating & Cooling', subcategory: 'Operating Controls', item: 'Thermostat Type', required: false, type: 'multiselect', options: ['Manual', 'Programmable', 'Smart/WiFi', 'Zone Control', 'Heat Pump Control'] },
  { id: 'operating-controls-inspector-rating', category: 'Heating & Cooling', subcategory: 'Operating Controls', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Operating Controls - Defects
  { id: 'operating-controls-thermostat-malfunction', category: 'Heating & Cooling', subcategory: 'Defects - Operating Controls', item: 'Thermostat Malfunction', required: false, type: 'checkbox' },
  { id: 'operating-controls-wiring-issues', category: 'Heating & Cooling', subcategory: 'Defects - Operating Controls', item: 'Control Wiring Issues', required: false, type: 'checkbox' },
  { id: 'operating-controls-improper-calibration', category: 'Heating & Cooling', subcategory: 'Defects - Operating Controls', item: 'Improper Calibration', required: false, type: 'checkbox' },
  
  // Distribution Systems
  { id: 'distribution-systems-ductwork-material', category: 'Heating & Cooling', subcategory: 'Distribution Systems', item: 'Ductwork Material', required: false, type: 'multiselect', options: ['Sheet Metal', 'Flexible Duct', 'Ductboard', 'PVC', 'Cast Iron', 'Copper'] },
  { id: 'distribution-systems-insulation-type', category: 'Heating & Cooling', subcategory: 'Distribution Systems', item: 'Insulation Type', required: false, type: 'multiselect', options: ['Fiberglass', 'Foam Board', 'Spray Foam', 'Cellulose', 'Mineral Wool', 'None'] },
  { id: 'distribution-systems-inspector-rating', category: 'Heating & Cooling', subcategory: 'Distribution Systems', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Distribution Systems - Defects
  { id: 'distribution-systems-duct-leakage', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Duct Leakage', required: false, type: 'checkbox' },
  { id: 'distribution-systems-inadequate-insulation', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Inadequate Insulation', required: false, type: 'checkbox' },
  { id: 'distribution-systems-blocked-returns', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Blocked Return Air Vents', required: false, type: 'checkbox' },
  { id: 'distribution-systems-improper-sizing', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Improper Duct Sizing', required: false, type: 'checkbox' },
  
  // Vents & Flues
  { id: 'vents-flues-material', category: 'Heating & Cooling', subcategory: 'Vents & Flues', item: 'Vent/Flue Material', required: false, type: 'multiselect', options: ['Metal', 'PVC', 'Clay Tile', 'Masonry', 'Stainless Steel', 'Aluminum'] },
  { id: 'vents-flues-inspector-rating', category: 'Heating & Cooling', subcategory: 'Vents & Flues', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Vents & Flues - Defects
  { id: 'vents-flues-blockage', category: 'Heating & Cooling', subcategory: 'Defects - Vents & Flues', item: 'Vent/Flue Blockage', required: false, type: 'checkbox' },
  { id: 'vents-flues-improper-clearance', category: 'Heating & Cooling', subcategory: 'Defects - Vents & Flues', item: 'Improper Clearance', required: false, type: 'checkbox' },
  { id: 'vents-flues-damaged-components', category: 'Heating & Cooling', subcategory: 'Defects - Vents & Flues', item: 'Damaged Vent/Flue Components', required: false, type: 'checkbox' },
  { id: 'vents-flues-carbon-monoxide-risk', category: 'Heating & Cooling', subcategory: 'Defects - Vents & Flues', item: 'Carbon Monoxide Risk', required: false, type: 'checkbox' },

  // ============== DOORS & WINDOWS ==============
  // Windows
  { id: 'windows-type', category: 'Doors & Windows', subcategory: 'Windows', item: 'Window Type', required: false, type: 'multiselect', options: ['Casement', 'Double-hung', 'Drop-down', 'Single Pane', 'Single-hung', 'Sliders', 'Storm', 'Thermal'] },
  { id: 'windows-manufacturer', category: 'Doors & Windows', subcategory: 'Windows', item: 'Window Manufacturer', required: false, type: 'multiselect', options: ['Andersen', 'JELD-WEN', 'Marvin', 'Milgard', 'Pella', 'WeatherShield'] },
  { id: 'windows-age', category: 'Doors & Windows', subcategory: 'Windows', item: 'Window Age', required: false, type: 'year' },
  { id: 'windows-inspector-rating', category: 'Doors & Windows', subcategory: 'Windows', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Windows - Defects
  { id: 'windows-improper-installation', category: 'Doors & Windows', subcategory: 'Defects - Windows', item: 'Improper Installation', required: false, type: 'checkbox' },
  { id: 'windows-painted-shut', category: 'Doors & Windows', subcategory: 'Defects - Windows', item: 'Painted Shut', required: false, type: 'checkbox' },
  { id: 'windows-damaged', category: 'Doors & Windows', subcategory: 'Defects - Windows', item: 'Damaged', required: false, type: 'checkbox' },
  { id: 'windows-failed-seal', category: 'Doors & Windows', subcategory: 'Defects - Windows', item: 'Failed Seal', required: false, type: 'checkbox' },
  { id: 'windows-missing-screen', category: 'Doors & Windows', subcategory: 'Defects - Windows', item: 'Missing Screen', required: false, type: 'checkbox' },
  
  // Entry Doors
  { id: 'entry-door-type', category: 'Doors & Windows', subcategory: 'Entry Doors', item: 'Entry Door Type', required: false, type: 'multiselect', options: ['Single', 'Double', 'French', 'Sliding', 'Storm', 'Screen', 'Security'] },
  { id: 'entry-door-manufacturer', category: 'Doors & Windows', subcategory: 'Entry Doors', item: 'Entry Door Manufacturer', required: false, type: 'multiselect', options: ['Andersen', 'JELD-WEN', 'Therma-Tru', 'Pella', 'Masonite', 'ProVia', 'Fiberglass', 'Steel', 'Wood'] },
  { id: 'entry-door-age', category: 'Doors & Windows', subcategory: 'Entry Doors', item: 'Entry Door Age', required: false, type: 'year' },
  { id: 'entry-door-inspector-rating', category: 'Doors & Windows', subcategory: 'Entry Doors', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Entry Doors - Defects
  { id: 'entry-door-water-staining', category: 'Doors & Windows', subcategory: 'Defects - Entry Doors', item: 'Water Staining', required: false, type: 'checkbox' },
  { id: 'entry-door-poor-weather-stripping', category: 'Doors & Windows', subcategory: 'Defects - Entry Doors', item: 'Poor Weather-stripping', required: false, type: 'checkbox' },
  { id: 'entry-door-noticeable-gap', category: 'Doors & Windows', subcategory: 'Defects - Entry Doors', item: 'Noticeable Gap', required: false, type: 'checkbox' },
  { id: 'entry-door-hinges-missing', category: 'Doors & Windows', subcategory: 'Defects - Entry Doors', item: 'Hinges Missing', required: false, type: 'checkbox' },
  { id: 'entry-door-hinges-loose', category: 'Doors & Windows', subcategory: 'Defects - Entry Doors', item: 'Hinges Loose', required: false, type: 'checkbox' },
  { id: 'entry-door-door-sticks', category: 'Doors & Windows', subcategory: 'Defects - Entry Doors', item: 'Door Sticks', required: false, type: 'checkbox' },
  { id: 'entry-door-latch-alignment', category: 'Doors & Windows', subcategory: 'Defects - Entry Doors', item: 'Door Latch Alignment', required: false, type: 'checkbox' },
  { id: 'entry-door-doesnt-latch', category: 'Doors & Windows', subcategory: 'Defects - Entry Doors', item: "Door Doesn't Latch", required: false, type: 'checkbox' },
  
  // Interior Doors
  { id: 'interior-door-type', category: 'Doors & Windows', subcategory: 'Interior Doors', item: 'Interior Door Type', required: false, type: 'multiselect', options: ['Hollow Core', 'Solid Core', 'Panel', 'Flush', 'Pocket', 'Sliding', 'Bi-fold', 'French'] },
  { id: 'interior-door-inspector-rating', category: 'Doors & Windows', subcategory: 'Interior Doors', item: 'Inspector Overall Grading', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Garage Doors
  { id: 'garage-door-type', category: 'Doors & Windows', subcategory: 'Garage Doors', item: 'Garage Door Type', required: false, type: 'multiselect', options: ['Sliding', 'Folding', 'Up-and-Over', 'Roll-Up', 'Automatic', 'Sectional'] },
  { id: 'garage-door-material', category: 'Doors & Windows', subcategory: 'Garage Doors', item: 'Garage Door Material', required: false, type: 'multiselect', options: ['Metal', 'Insulated', 'Non-insulated', 'Steel', 'Aluminum', 'Wood', 'Wood Composite', 'Fiberglass', 'Vinyl', 'Glass'] },
  { id: 'garage-door-mechanism', category: 'Doors & Windows', subcategory: 'Garage Doors', item: 'Garage Door Mechanism', required: false, type: 'multiselect', options: ['Manual', 'Electric Opener', 'Chain Drive', 'Belt Drive', 'Screw Drive', 'Direct Drive', 'Remote Control', 'Wall Switch'] },
  { id: 'garage-door-inspector-rating', category: 'Doors & Windows', subcategory: 'Garage Doors', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Garage Doors - Defects
  { id: 'garage-door-loud-noises', category: 'Doors & Windows', subcategory: 'Defects - Garage Doors', item: 'Loud Noises', required: false, type: 'checkbox' },
  { id: 'garage-door-improper-installation', category: 'Doors & Windows', subcategory: 'Defects - Garage Doors', item: 'Improper Installation', required: false, type: 'checkbox' },
  { id: 'garage-door-broken-springs', category: 'Doors & Windows', subcategory: 'Defects - Garage Doors', item: 'Broken Springs', required: false, type: 'checkbox' },
  { id: 'garage-door-auto-reverse-sensor', category: 'Doors & Windows', subcategory: 'Defects - Garage Doors', item: 'Auto Reverse Sensor Not Working', required: false, type: 'checkbox' },
  
  // Garage Door Opener - Defects
  { id: 'garage-door-opener-inoperable-wall-switch', category: 'Doors & Windows', subcategory: 'Defects - Garage Door Opener', item: 'Inoperable Wall Switch', required: false, type: 'checkbox' },
  { id: 'garage-door-opener-inoperable-remote', category: 'Doors & Windows', subcategory: 'Defects - Garage Door Opener', item: 'Inoperable Remote', required: false, type: 'checkbox' },
  { id: 'garage-door-opener-delayed-wall-switch', category: 'Doors & Windows', subcategory: 'Defects - Garage Door Opener', item: 'Delayed Wall Switch', required: false, type: 'checkbox' },

  // ============== BUILT-IN APPLIANCES ==============
  // Refrigerator
  { id: 'refrigerator-type', category: 'Built-in Appliances', subcategory: 'Refrigerator', item: 'Refrigerator Type', required: false, type: 'multiselect', options: ['Side-by-side', 'Top Freezer', 'Bottom Freezer', 'French Door', 'Built-in', 'Counter-depth'] },
  { id: 'refrigerator-manufacturer', category: 'Built-in Appliances', subcategory: 'Refrigerator', item: 'Refrigerator Manufacturer', required: false, type: 'multiselect', options: ['Whirlpool', 'GE', 'Samsung', 'LG', 'KitchenAid', 'Frigidaire', 'Bosch', 'Sub-Zero'] },
  { id: 'refrigerator-age', category: 'Built-in Appliances', subcategory: 'Refrigerator', item: 'Refrigerator Age', required: false, type: 'year' },
  { id: 'refrigerator-inspector-rating', category: 'Built-in Appliances', subcategory: 'Refrigerator', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Refrigerator - Defects
  { id: 'refrigerator-not-cooling-properly', category: 'Built-in Appliances', subcategory: 'Defects - Refrigerator', item: 'Not Cooling Properly', required: false, type: 'checkbox' },
  { id: 'refrigerator-excessive-noise', category: 'Built-in Appliances', subcategory: 'Defects - Refrigerator', item: 'Excessive Noise', required: false, type: 'checkbox' },
  { id: 'refrigerator-door-seal-damaged', category: 'Built-in Appliances', subcategory: 'Defects - Refrigerator', item: 'Door Seal Damaged', required: false, type: 'checkbox' },
  { id: 'refrigerator-ice-maker-inoperable', category: 'Built-in Appliances', subcategory: 'Defects - Refrigerator', item: 'Ice Maker Inoperable', required: false, type: 'checkbox' },
  
  // Range/Oven/Cooktop
  { id: 'range-oven-cooktop-type', category: 'Built-in Appliances', subcategory: 'Range/Oven/Cooktop', item: 'Range/Oven/Cooktop Type', required: false, type: 'multiselect', options: ['Electric Range', 'Gas Range', 'Induction Cooktop', 'Electric Cooktop', 'Gas Cooktop', 'Wall Oven', 'Double Oven'] },
  { id: 'range-oven-cooktop-manufacturer', category: 'Built-in Appliances', subcategory: 'Range/Oven/Cooktop', item: 'Range/Oven/Cooktop Manufacturer', required: false, type: 'multiselect', options: ['Whirlpool', 'GE', 'Samsung', 'LG', 'KitchenAid', 'Frigidaire', 'Bosch', 'Viking', 'Wolf'] },
  { id: 'range-oven-cooktop-age', category: 'Built-in Appliances', subcategory: 'Range/Oven/Cooktop', item: 'Range/Oven/Cooktop Age', required: false, type: 'year' },
  { id: 'range-oven-cooktop-inspector-rating', category: 'Built-in Appliances', subcategory: 'Range/Oven/Cooktop', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Range/Oven/Cooktop - Defects
  { id: 'range-oven-cooktop-missing-control-knobs', category: 'Built-in Appliances', subcategory: 'Defects - Range/Oven/Cooktop', item: 'Missing Control Knobs', required: false, type: 'checkbox' },
  { id: 'range-oven-cooktop-exhaust-system-missing', category: 'Built-in Appliances', subcategory: 'Defects - Range/Oven/Cooktop', item: 'Exhaust System Missing', required: false, type: 'checkbox' },
  { id: 'range-oven-cooktop-exhaust-fan-inoperable', category: 'Built-in Appliances', subcategory: 'Defects - Range/Oven/Cooktop', item: 'Exhaust Fan Inoperable', required: false, type: 'checkbox' },
  { id: 'range-oven-cooktop-range-not-fastened', category: 'Built-in Appliances', subcategory: 'Defects - Range/Oven/Cooktop', item: 'Range Not Fastened', required: false, type: 'checkbox' },
  { id: 'range-oven-cooktop-cracked-glasstop', category: 'Built-in Appliances', subcategory: 'Defects - Range/Oven/Cooktop', item: 'Cracked Glasstop', required: false, type: 'checkbox' },
  { id: 'range-oven-cooktop-burner-not-lighting', category: 'Built-in Appliances', subcategory: 'Defects - Range/Oven/Cooktop', item: 'Burner Not Lighting', required: false, type: 'checkbox' },
  { id: 'range-oven-cooktop-exhaust-duct-terminates-attic', category: 'Built-in Appliances', subcategory: 'Defects - Range/Oven/Cooktop', item: 'Exhaust Duct Terminates in Attic', required: false, type: 'checkbox' },
  { id: 'range-oven-cooktop-oven-not-heating-up', category: 'Built-in Appliances', subcategory: 'Defects - Range/Oven/Cooktop', item: 'Oven Not Heating Up', required: false, type: 'checkbox' },
  { id: 'range-oven-cooktop-no-gas-shutoff-valve', category: 'Built-in Appliances', subcategory: 'Defects - Range/Oven/Cooktop', item: 'No Gas Shut-off Valve', required: false, type: 'checkbox' },
  
  // Dishwasher
  { id: 'dishwasher-type', category: 'Built-in Appliances', subcategory: 'Dishwasher', item: 'Dishwasher Type', required: false, type: 'multiselect', options: ['Built-in', 'Portable', 'Drawer', 'Countertop', 'Panel Ready'] },
  { id: 'dishwasher-manufacturer', category: 'Built-in Appliances', subcategory: 'Dishwasher', item: 'Dishwasher Manufacturer', required: false, type: 'multiselect', options: ['Whirlpool', 'GE', 'Samsung', 'LG', 'KitchenAid', 'Frigidaire', 'Bosch', 'Miele'] },
  { id: 'dishwasher-age', category: 'Built-in Appliances', subcategory: 'Dishwasher', item: 'Dishwasher Age', required: false, type: 'year' },
  { id: 'dishwasher-inspector-rating', category: 'Built-in Appliances', subcategory: 'Dishwasher', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Dishwasher - Defects
  { id: 'dishwasher-not-cleaning-properly', category: 'Built-in Appliances', subcategory: 'Defects - Dishwasher', item: 'Not Cleaning Properly', required: false, type: 'checkbox' },
  { id: 'dishwasher-water-leakage', category: 'Built-in Appliances', subcategory: 'Defects - Dishwasher', item: 'Water Leakage', required: false, type: 'checkbox' },
  { id: 'dishwasher-door-latch-problems', category: 'Built-in Appliances', subcategory: 'Defects - Dishwasher', item: 'Door Latch Problems', required: false, type: 'checkbox' },
  { id: 'dishwasher-excessive-noise', category: 'Built-in Appliances', subcategory: 'Defects - Dishwasher', item: 'Excessive Noise', required: false, type: 'checkbox' },
  
  // Built-in Microwave
  { id: 'builtin-microwave-type', category: 'Built-in Appliances', subcategory: 'Built-in Microwave', item: 'Built-in Microwave Type', required: false, type: 'multiselect', options: ['Over-the-range', 'Built-in Wall', 'Drawer', 'Countertop'] },
  { id: 'builtin-microwave-manufacturer', category: 'Built-in Appliances', subcategory: 'Built-in Microwave', item: 'Built-in Microwave Manufacturer', required: false, type: 'multiselect', options: ['Whirlpool', 'GE', 'Samsung', 'LG', 'KitchenAid', 'Frigidaire', 'Bosch', 'Sharp'] },
  { id: 'builtin-microwave-age', category: 'Built-in Appliances', subcategory: 'Built-in Microwave', item: 'Built-in Microwave Age', required: false, type: 'year' },
  { id: 'builtin-microwave-inspector-rating', category: 'Built-in Appliances', subcategory: 'Built-in Microwave', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Built-in Microwave - Defects
  { id: 'builtin-microwave-inoperable', category: 'Built-in Appliances', subcategory: 'Defects - Built-in Microwave', item: 'Inoperable', required: false, type: 'checkbox' },
  { id: 'builtin-microwave-improper-mounting', category: 'Built-in Appliances', subcategory: 'Defects - Built-in Microwave', item: 'Improper Mounting', required: false, type: 'checkbox' },
  
  // Garbage Disposal
  { id: 'garbage-disposal-type', category: 'Built-in Appliances', subcategory: 'Garbage Disposal', item: 'Garbage Disposal Type', required: false, type: 'multiselect', options: ['Continuous Feed', 'Batch Feed', '1/2 HP', '3/4 HP', '1 HP'] },
  { id: 'garbage-disposal-manufacturer', category: 'Built-in Appliances', subcategory: 'Garbage Disposal', item: 'Garbage Disposal Manufacturer', required: false, type: 'multiselect', options: ['InSinkErator', 'Waste King', 'KitchenAid', 'Moen', 'GE', 'Whirlaway'] },
  { id: 'garbage-disposal-age', category: 'Built-in Appliances', subcategory: 'Garbage Disposal', item: 'Garbage Disposal Age', required: false, type: 'year' },
  { id: 'garbage-disposal-inspector-rating', category: 'Built-in Appliances', subcategory: 'Garbage Disposal', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Garbage Disposal - Defects
  { id: 'garbage-disposal-inoperable', category: 'Built-in Appliances', subcategory: 'Defects - Garbage Disposal', item: 'Inoperable', required: false, type: 'checkbox' },
  { id: 'garbage-disposal-excessive-noise', category: 'Built-in Appliances', subcategory: 'Defects - Garbage Disposal', item: 'Excessive Noise', required: false, type: 'checkbox' },
  
  // Cooking Exhaust
  { id: 'cooking-exhaust-type', category: 'Built-in Appliances', subcategory: 'Cooking Exhaust', item: 'Cooking Exhaust Type', required: false, type: 'multiselect', options: ['Range Hood', 'Island Hood', 'Downdraft', 'Over-the-range Microwave', 'Wall Mount', 'Under Cabinet'] },
  { id: 'cooking-exhaust-manufacturer', category: 'Built-in Appliances', subcategory: 'Cooking Exhaust', item: 'Cooking Exhaust Manufacturer', required: false, type: 'multiselect', options: ['Broan', 'Zephyr', 'KitchenAid', 'GE', 'Whirlpool', 'Bosch', 'Viking', 'Best'] },
  { id: 'cooking-exhaust-age', category: 'Built-in Appliances', subcategory: 'Cooking Exhaust', item: 'Cooking Exhaust Age', required: false, type: 'year' },
  { id: 'cooking-exhaust-inspector-rating', category: 'Built-in Appliances', subcategory: 'Cooking Exhaust', item: 'Inspector Overall Rating', required: false, type: 'rating', options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected'] },
  
  // Cooking Exhaust - Defects
  { id: 'cooking-exhaust-fan-inoperable', category: 'Built-in Appliances', subcategory: 'Defects - Cooking Exhaust', item: 'Fan Inoperable', required: false, type: 'checkbox' },
  { id: 'cooking-exhaust-excessive-noise', category: 'Built-in Appliances', subcategory: 'Defects - Cooking Exhaust', item: 'Excessive Noise', required: false, type: 'checkbox' },
  { id: 'cooking-exhaust-inadequate-ventilation', category: 'Built-in Appliances', subcategory: 'Defects - Cooking Exhaust', item: 'Inadequate Ventilation', required: false, type: 'checkbox' },
  { id: 'cooking-exhaust-light-inoperable', category: 'Built-in Appliances', subcategory: 'Defects - Cooking Exhaust', item: 'Light Inoperable', required: false, type: 'checkbox' },

  // ============== GREEN FEATURES ==============
  { id: 'green-well-sealed', category: 'Green Features', item: 'Well Sealed', required: false, type: 'checkbox' },
  { id: 'green-well-insulated', category: 'Green Features', item: 'Well Insulated', required: false, type: 'checkbox' },
  { id: 'green-waterless-urinals', category: 'Green Features', item: 'Waterless Urinals', required: false, type: 'checkbox' },
  { id: 'green-trees-provide-shade', category: 'Green Features', item: 'Trees Provide Shade', required: false, type: 'checkbox' },
  { id: 'green-storm-water-systems', category: 'Green Features', item: 'Storm Water Systems', required: false, type: 'checkbox' },
  { id: 'green-south-facing', category: 'Green Features', item: 'South Facing', required: false, type: 'checkbox' },
  { id: 'green-reduces-heat-island-effects', category: 'Green Features', item: 'Reduces Heat-Island Effects', required: false, type: 'checkbox' },
  { id: 'green-recycled-renewable-materials', category: 'Green Features', item: 'Recycled or Renewable Materials', required: false, type: 'checkbox' },
  { id: 'green-properly-installed-flashing', category: 'Green Features', item: 'Properly Installed Flashing', required: false, type: 'checkbox' },
  { id: 'green-permeable-material-driveways', category: 'Green Features', item: 'Permeable Material on Driveways/Walkways', required: false, type: 'checkbox' },
  { id: 'green-motion-sensors', category: 'Green Features', item: 'Motion Sensors', required: false, type: 'checkbox' },
  { id: 'green-low-voc', category: 'Green Features', item: 'Low VOC', required: false, type: 'checkbox' },
  { id: 'green-low-consumption-fixtures', category: 'Green Features', item: 'Low Consumption Fixtures', required: false, type: 'checkbox' },
  { id: 'green-limited-water-usage-design', category: 'Green Features', item: 'Limited Water Usage Design', required: false, type: 'checkbox' },
  { id: 'green-light-colored-carpet', category: 'Green Features', item: 'Light-colored Carpet', required: false, type: 'checkbox' },
  { id: 'green-high-performance-hvac-filters', category: 'Green Features', item: 'High Performance HVAC Filters', required: false, type: 'checkbox' },
  { id: 'green-high-efficiency-cooling', category: 'Green Features', item: 'High-efficiency Cooling', required: false, type: 'checkbox' },
  { id: 'green-gutters-downspouts-clean', category: 'Green Features', item: 'Gutters/Downspouts Clean', required: false, type: 'checkbox' },
  { id: 'green-good-weatherstripping', category: 'Green Features', item: 'Good Weatherstripping', required: false, type: 'checkbox' },
  { id: 'green-geothermal-heating-cooling', category: 'Green Features', item: 'Geothermal Heating/Cooling System', required: false, type: 'checkbox' },
  { id: 'green-filters-clean', category: 'Green Features', item: 'Filters Clean', required: false, type: 'checkbox' },
  { id: 'green-energy-efficient-windows', category: 'Green Features', item: 'Energy Efficient Windows', required: false, type: 'checkbox' },
  { id: 'green-ductwork-sealed', category: 'Green Features', item: 'Ductwork Sealed', required: false, type: 'checkbox' },
  { id: 'green-dimmers', category: 'Green Features', item: 'Dimmers', required: false, type: 'checkbox' },
  { id: 'green-close-to-public-transportation', category: 'Green Features', item: 'Close to Public Transportation', required: false, type: 'checkbox' },
  { id: 'green-can-build-up', category: 'Green Features', item: 'Can Build Up', required: false, type: 'checkbox' },

  // ============== RADON ==============
  // Radon - Monitor Details (matching Inspection Details fields exactly)
  { id: 'radon-start-time', category: 'Radon', subcategory: 'Monitor Details', item: 'Start Time', required: false, type: 'time' },
  { id: 'radon-end-time', category: 'Radon', subcategory: 'Monitor Details', item: 'End Time', required: false, type: 'time' },
  { id: 'radon-monitor-location', category: 'Radon', subcategory: 'Monitor Details', item: 'Monitor Location', required: false, type: 'multiselect', options: ['Basement', 'Lower Level', 'Main Level'] },
  { id: 'radon-method', category: 'Radon', subcategory: 'Monitor Details', item: 'Method', required: false, type: 'multiselect', options: ['Continuous'] },
  { id: 'radon-measurement-interval', category: 'Radon', subcategory: 'Monitor Details', item: 'Measurement Interval (hr)', required: false, type: 'number' },
  { id: 'radon-elapsed-time', category: 'Radon', subcategory: 'Monitor Details', item: 'Elapsed Time (days)', required: false, type: 'number' },
  { id: 'radon-serial-number', category: 'Radon', subcategory: 'Monitor Details', item: 'Serial Number', required: false, type: 'text' },
  { id: 'radon-model-number', category: 'Radon', subcategory: 'Monitor Details', item: 'Model Number', required: false, type: 'text' },
  
  // Radon - Test Results
  { id: 'radon-average-pcil', category: 'Radon', subcategory: 'Test Results', item: 'Average pCi/L', required: false, type: 'number' },
  { id: 'radon-epa-resources', category: 'Radon', subcategory: 'Test Results', item: 'EPA Resources', required: false, type: 'info' },

  // ============== WATER TESTING ==============
  // Water Testing - Testing Details (matching Inspection Details fields exactly)
  { id: 'water-testing-locations', category: 'Water Testing', subcategory: 'Testing Details', item: 'Testing Locations', required: false, type: 'multiselect', options: ['Kitchen Sink', 'Bathroom Sink'] },
  { id: 'water-testing-method', category: 'Water Testing', subcategory: 'Testing Details', item: 'Testing Method', required: false, type: 'multiselect', options: ['17 in One Water Test Strips', 'Coliform 48 Hour Test Kit'] },
  { id: 'water-testing-abnormal-smell-taste', category: 'Water Testing', subcategory: 'Testing Details', item: 'Abnormal Smell or Taste', required: false, type: 'radio', options: ['Yes', 'No', 'N/A'] },
  { id: 'water-testing-start-day', category: 'Water Testing', subcategory: 'Testing Details', item: 'Start Day', required: false, type: 'text' },
  { id: 'water-testing-end-day', category: 'Water Testing', subcategory: 'Testing Details', item: 'End Day', required: false, type: 'text' },
  { id: 'water-testing-device-info', category: 'Water Testing', subcategory: 'Testing Details', item: 'Testing Device Information', required: false, type: 'text' },

  // Water Testing - Test Results
  { id: 'water-testing-ph', category: 'Water Testing', subcategory: 'Test Results', item: 'pH Level', required: false, type: 'number' },
  { id: 'water-testing-chlorine', category: 'Water Testing', subcategory: 'Test Results', item: 'Chlorine Level', required: false, type: 'number' },
  { id: 'water-testing-hardness', category: 'Water Testing', subcategory: 'Test Results', item: 'Hardness (ppm)', required: false, type: 'number' },
  { id: 'water-testing-iron', category: 'Water Testing', subcategory: 'Test Results', item: 'Iron Level (ppm)', required: false, type: 'number' },
  { id: 'water-testing-nitrate', category: 'Water Testing', subcategory: 'Test Results', item: 'Nitrate Level (ppm)', required: false, type: 'number' },
  { id: 'water-testing-nitrite', category: 'Water Testing', subcategory: 'Test Results', item: 'Nitrite Level (ppm)', required: false, type: 'number' },
  { id: 'water-testing-lead', category: 'Water Testing', subcategory: 'Test Results', item: 'Lead Level (ppb)', required: false, type: 'number' },
  { id: 'water-testing-copper', category: 'Water Testing', subcategory: 'Test Results', item: 'Copper Level (ppm)', required: false, type: 'number' },
  { id: 'water-testing-coliform', category: 'Water Testing', subcategory: 'Test Results', item: 'Coliform Bacteria', required: false, type: 'multiselect', options: ['Positive', 'Negative', 'Pending'] },

  // Water Testing - Recommendations
  { id: 'water-levels-within-range', category: 'Water Testing', subcategory: 'Recommendations', item: 'Substance Levels Within Range', required: false, type: 'checkbox', commentText: 'Test strip results showed the water substances to be within range and not abnormal.' },
  { id: 'water-levels-slightly-abnormal', category: 'Water Testing', subcategory: 'Recommendations', item: 'Substance Levels Slightly Abnormal', required: false, type: 'checkbox', commentText: 'The water test results for some substances were slightly abnormal. Follow-up laboratory testing from a qualified contractor is recommended.' },
  { id: 'water-lab-not-used', category: 'Water Testing', subcategory: 'Recommendations', item: 'Laboratory Testing Not Used', required: false, type: 'checkbox', commentText: 'A lab was not used for the water testing. The test strips are only a baseline test and may produce average or in some cases, inaccurate readings.' },
  { id: 'water-levels-highly-abnormal', category: 'Water Testing', subcategory: 'Recommendations', item: 'Substance Levels Highly Abnormal', required: false, type: 'checkbox', commentText: 'The water test results for some substances were highly abnormal. Follow-up laboratory testing from a qualified contractor is recommended soon to verify the baseline readings.' },

  // ============== WELL ==============
  // Well - Inspection Details
  { id: 'well-utilities-on', category: 'Well', subcategory: 'Inspection Details', item: 'Utilities On', required: false, type: 'boolean', options: ['On', 'Off'], commentText: 'Indicates whether utilities were on during the inspection.' },
  { id: 'well-property-occupied', category: 'Well', subcategory: 'Inspection Details', item: 'Property Occupied', required: false, type: 'boolean', options: ['Yes', 'No'], commentText: 'Indicates whether the property was occupied during the inspection.' },
  { id: 'well-weather', category: 'Well', subcategory: 'Inspection Details', item: 'Weather', required: false, type: 'multiselect', options: ['Sunny', 'Cloudy', 'Rainy', 'Partly Sunny', 'Partly Cloudy', 'Snow'], commentText: 'Weather conditions during the well inspection.' },
  { id: 'well-soil-conditions', category: 'Well', subcategory: 'Inspection Details', item: 'Soil Conditions', required: false, type: 'multiselect', options: ['Dry', 'Wet', 'Semi Wet', 'Frozen'], commentText: 'Soil conditions around the well area.' },
  { id: 'well-location-of-well-head', category: 'Well', subcategory: 'Inspection Details', item: 'Location of Well Head', required: false, type: 'multiselect', options: ['Front of House', 'Right of House', 'Left of House', 'Back of House', 'Basement'], commentText: 'We reference where the well head in conjunction to the property. Grading should be considered near the well head. Water should not pool around casing, but go around it or away.' },

  // Well System Details - Boolean items (radio buttons)
  { id: 'well-well-head-casing-photos', category: 'Well', subcategory: 'Well System Details', item: 'Well Head / Casing Photos', required: false, type: 'boolean', options: ['Yes', 'No'], commentText: 'Well head should be secured to casing, Should not be loose or have holes or cracks. The well head, cap, should be tight and vermin-proof.' },
  { id: 'well-electrical-components', category: 'Well', subcategory: 'Well System Details', item: 'Electrical Components', required: false, type: 'boolean', options: ['Functional', 'Not Functional'], commentText: 'Electrical conduit and connections were functional' },
  { id: 'well-height-of-well-casing', category: 'Well', subcategory: 'Well System Details', item: 'Height of Well Casing', required: false, type: 'boolean', options: ['Complies', 'Does Not Comply'], commentText: 'Well heads should extend 12 inches above ground if installed after 1991 to prevent contamination into the well head.' },
  { id: 'well-water-flow-information', category: 'Well', subcategory: 'Well System Details', item: 'Water Flow Information', required: false, type: 'boolean', options: ['Adequate', 'Inadequate'], commentText: 'The pressure should be between 40 and 60 pounds per square inch (psi). As the well pump cycles on and off, it is normal for the pressure to vary from low (pump cut-in) to high (pump cut-out) pressure.' },
  { id: 'well-final-comments', category: 'Well', subcategory: 'Well System Details', item: 'Final Comments', required: false, type: 'textarea', commentText: 'Items to be further evaluated prior to grading a building by a qualified plumber.' },

  // Well System Details - Checkbox items (multiselect)
  { id: 'well-casing-diameter', category: 'Well', subcategory: 'Well System Details', item: 'Well Casing Diameter', required: false, type: 'multiselect', options: ['6 Inch Steel', '4 Inch Steel', '5 inch', '7 inch', 'NA'], commentText: 'The steel casing should be in functional condition. Small amounts of surface rust is ok, but if you see pitting or large amounts of rust or metal flaking, further evaluation is recommended by a plumber.' },
  { id: 'well-pressure-tank', category: 'Well', subcategory: 'Well System Details', item: 'Pressure Tank', required: false, type: 'multiselect', options: ['Functional Condition', 'Deficient Condition', 'Further Evaluation Recommended', 'N/A', 'Pressure tank was buried'], commentText: 'Pressure Tank air pressure: Water logged test: The pressure tank should sound like a bell when knocked. Tank pressure should be about 2-3 PSI less than the turn on pressure on the pressure switch.' },
  { id: 'well-pressure-switch', category: 'Well', subcategory: 'Well System Details', item: 'Pressure Switch', required: false, type: 'multiselect', options: ['Appears Functional', 'Appears non functional', 'NA', 'Further evaluation needed'], commentText: 'Typically well pumps draw between 5-9 amps depending on pump horse power, well depth, etc. Pressure switch should be in functional condition.' },
  { id: 'well-pressure-gauge', category: 'Well', subcategory: 'Well System Details', item: 'Pressure Gauge', required: false, type: 'multiselect', options: ['Appears functional', 'Not functional', 'NA'], commentText: 'Pressure gauge should be in working condition. If pressure gauge is not functioning correctly, please replace.' },
  { id: 'well-pump-shut-off-switch', category: 'Well', subcategory: 'Well System Details', item: 'Pump Shut Off Switch', required: false, type: 'multiselect', options: ['Functional', 'Not functional', 'Not Labeled'], commentText: 'Shut off switch may be near the pressure tank or at the electrical meter. Shut off switch should be functional.' },
  { id: 'well-water-supply-lines', category: 'Well', subcategory: 'Well System Details', item: 'Condition of Water Supply Lines', required: false, type: 'multiselect', options: ['Functional', 'Further evaluation recommended'], commentText: 'Water Pipe material: Check for leaks, if seen, and will report them. If a leak develops later on, please seek further evaluation from a plumber.' },
  { id: 'well-components-checked', category: 'Well', subcategory: 'Well System Details', item: 'Components Checked', required: false, type: 'multiselect', options: ['Water Softener', 'Above Ground Water Storage Tank', 'NA', 'RO Filter'], commentText: 'We do not open filtration equipment, these components can sometimes be brittle and break. Please ask seller when the last time filters for water/softeners were replaced.' },
  { id: 'well-sample-faucet', category: 'Well', subcategory: 'Well System Details', item: 'Sample Faucet', required: false, type: 'multiselect', options: ['Complies', 'Does not Comply', 'Sample faucet Missing', 'Not Available', 'Community well'], commentText: 'Sample faucet should be installed upstream of the pressure tank, 12 inches above the floor, inside diameter of 1/4 inch and smooth sample end.' },
  { id: 'well-set-backs', category: 'Well', subcategory: 'Well System Details', item: 'Well Set Backs', required: false, type: 'multiselect', options: ['Septic System', 'Buildings', 'Other'], commentText: 'Septic 25 plus feet, Building 10 plus feet' },

  // ============== SWIMMING POOLS AND SPAS ==============
  // Limitations
  { id: 'pool-vessels-empty', category: 'Swimming Pools and Spas', subcategory: 'Limitations', item: 'Vessel(s) Were Empty', required: false, type: 'boolean', options: ['Yes', 'No'], commentText: 'The pool/spa vessels were empty and could not be tested. Be aware that empty shells may be structurally affected. Further evaluation by a qualified specialist is recommended.' },
  { id: 'pool-spa-not-inspected', category: 'Swimming Pools and Spas', subcategory: 'Limitations', item: 'Spa Not Inspected', required: false, type: 'boolean', options: ['Yes', 'No'], commentText: 'The spa was not inspected nor tested.' },
  { id: 'pool-spa-view', category: 'Swimming Pools and Spas', subcategory: 'Limitations', item: 'Pool/Spa View', required: false, type: 'boolean', options: ['Yes', 'No'] },

  // General
  { id: 'pool-type', category: 'Swimming Pools and Spas', subcategory: 'General', item: 'Type of Pool/Spa', required: false, type: 'multiselect', options: ['Inground Pool', 'Inground Spa', 'Above Ground Pool', 'Inground Pool and Spa', 'Above Ground Spa'] },

  // Safety Devices
  { id: 'pool-barriers', category: 'Swimming Pools and Spas', subcategory: 'Safety Devices', item: 'Pool Barriers', required: false, type: 'multiselect', options: ['Pool Area Fenced Off', 'Perimeter Yard Fencing', 'Pool Retractable Cover', 'Door Alarms', 'Gate(s) Self-closing/Self-latching', 'Spa Latching Cover', 'Pool Hard Cover', 'All doors Self-closing/Self-latching', 'Pool Web Cover', 'Spa is Being Removed'], commentText: 'All pool fencing should be a minimum of 60 inches with the latch a minimum of 54 inches off the grade. Gates should be self-closing and self-latching and open away from the pool/spa area.' },
  { id: 'pool-no-fencing', category: 'Swimming Pools and Spas', subcategory: 'Defects - Safety Devices', item: 'No pool fencing', required: false, type: 'checkbox', commentText: 'No separate pool area fencing was installed at this time. We recommend upgrading by installing pool fencing.' },
  { id: 'pool-no-door-alarms', category: 'Swimming Pools and Spas', subcategory: 'Defects - Safety Devices', item: 'Door alarms are not installed', required: false, type: 'checkbox', commentText: 'All doors that lead to the pool area should be protected with door alarms unless separate pool fencing is installed.' },
  { id: 'pool-gates-non-compliant', category: 'Swimming Pools and Spas', subcategory: 'Defects - Safety Devices', item: 'Perimeter gates do not comply with barrier requirement', required: false, type: 'checkbox', commentText: 'The perimeter gates that provide access to the pool/spa area should be self-closing and self-latching and open away from the pool area.' },
  { id: 'pool-doors-not-self-closing', category: 'Swimming Pools and Spas', subcategory: 'Defects - Safety Devices', item: 'The doors that provide access to the pool area are not self-closing and self-latching', required: false, type: 'checkbox', commentText: 'If door alarms are not present, then this is required.' },
  { id: 'pool-spa-cover-latches', category: 'Swimming Pools and Spas', subcategory: 'Defects - Safety Devices', item: 'Spa cover latches not working', required: false, type: 'checkbox', commentText: 'The spa cover latches should be installed so that they can be locked closed when not being used.' },

  // Pool Area Coping, Tile and Decking
  { id: 'pool-coping-type', category: 'Swimming Pools and Spas', subcategory: 'Coping, Tile & Decking', item: 'Coping Type', required: false, type: 'multiselect', options: ['None', 'Concrete', 'Stone', 'Brick', 'N/A'] },
  { id: 'pool-decking-type', category: 'Swimming Pools and Spas', subcategory: 'Coping, Tile & Decking', item: 'Decking Type', required: false, type: 'multiselect', options: ['Concrete', 'Stamped Concrete', 'Brick', 'Paver', 'Wood', 'Composite', 'Stone'] },
  { id: 'pool-reseal-coping', category: 'Swimming Pools and Spas', subcategory: 'Defects - Coping, Tile & Decking', item: 'Reseal Coping', required: false, type: 'checkbox', commentText: 'We recommend re-sealed between the deck and coping to prevent water from leaking behind the pool walls.' },
  { id: 'pool-cracked-tile', category: 'Swimming Pools and Spas', subcategory: 'Defects - Coping, Tile & Decking', item: 'Cracked Tile Noted', required: false, type: 'checkbox', commentText: 'The cracked tile(s) should be evaluated and repaired as needed by a qualified pool contractor.' },
  { id: 'pool-bond-beam-cracking', category: 'Swimming Pools and Spas', subcategory: 'Defects - Coping, Tile & Decking', item: 'Bond Beam Cracking Noted', required: false, type: 'checkbox', commentText: 'The cracking at the pool tile appears to be at the bond beam area. This can be a serious defect and should be further evaluated by a qualified pool contractor to determine the extent of the repair needed.' },
  { id: 'pool-broken-drain-covers', category: 'Swimming Pools and Spas', subcategory: 'Defects - Coping, Tile & Decking', item: 'Broken Drain Cover(s)', required: false, type: 'checkbox', commentText: 'The broken deck drain covers should be replaced.' },
  { id: 'pool-settling-noted', category: 'Swimming Pools and Spas', subcategory: 'Defects - Coping, Tile & Decking', item: 'Settling Noted', required: false, type: 'checkbox', commentText: 'The settling noted should be repaired and monitored for any additional changes.' },
  { id: 'pool-deteriorated-grout', category: 'Swimming Pools and Spas', subcategory: 'Defects - Coping, Tile & Decking', item: 'Deteriorated Tile Grout Noted', required: false, type: 'checkbox', commentText: 'The deteriorated grout at the tile should be evaluated and repaired by a qualified contractor.' },

  // Vessel Surface
  { id: 'pool-interior-finish', category: 'Swimming Pools and Spas', subcategory: 'Vessel Surface', item: 'Interior Finish Material', required: false, type: 'multiselect', options: ['Plaster/Gunite', 'Aggregate (Pebble)', 'Acrylic', 'Dark Bottom', 'N/A', 'Fiberglass', 'Vinyl'] },
  { id: 'pool-surface-defects', category: 'Swimming Pools and Spas', subcategory: 'Defects - Vessel Surface', item: 'Surface Defects need further evaluation and likely repair', required: false, type: 'checkbox', commentText: 'The plaster surface is worn and needs to be re-surfaced.' },
  { id: 'pool-cosmetic-stains', category: 'Swimming Pools and Spas', subcategory: 'Defects - Vessel Surface', item: 'Cosmetic stains noted', required: false, type: 'checkbox', commentText: 'Usually caused by a chemical imbalance and easily corrected.' },

  // Drains
  { id: 'pool-drain-types', category: 'Swimming Pools and Spas', subcategory: 'Drains', item: 'Drain Type(s)', required: false, type: 'multiselect', options: ['Anti-vortex Drain Covers', 'Anti-Entrapment Drains', 'Multiple Drains'] },
  { id: 'pool-install-antivortex', category: 'Swimming Pools and Spas', subcategory: 'Defects - Drains', item: 'Install Anti-vortex Cover(s)', required: false, type: 'checkbox', commentText: 'All pool/spa drain covers should be anti-vortex style covers for increased safety.' },
  { id: 'pool-install-antientrapment', category: 'Swimming Pools and Spas', subcategory: 'Defects - Drains', item: 'Install anti-entrapment drains', required: false, type: 'checkbox', commentText: 'We recommend upgrading the pool drain to anti-entrapment style drains for better protection.' },

  // Pool Electrical
  { id: 'pool-circuit-breaker-location', category: 'Swimming Pools and Spas', subcategory: 'Pool Electrical', item: 'Circuit Breaker Location(s)', required: false, type: 'multiselect', options: ['Equipment Area', 'Main House Panel', 'Garage', 'N/A', 'Shed', 'Other', 'Near Spa'] },
  { id: 'pool-equipment-bonding', category: 'Swimming Pools and Spas', subcategory: 'Pool Electrical', item: 'Equipment Bonding', required: false, type: 'multiselect', options: ['Pump(s)', 'Heater', 'Windows', 'Filter', 'None', 'Slide', 'Not visible'] },
  { id: 'pool-electric-controls', category: 'Swimming Pools and Spas', subcategory: 'Pool Electrical', item: 'Electric Controls', required: false, type: 'multiselect', options: ['Wall Remote', 'Local Subpanel', 'Spa Side Remote', 'Phone App', 'Adjacent to Spa', 'Handheld Remote', 'X10 Style Plug-in Remote', 'Spa Control Panel'] },
  { id: 'pool-wiring-type', category: 'Swimming Pools and Spas', subcategory: 'Pool Electrical', item: 'Wiring Type', required: false, type: 'multiselect', options: ['Rigid Metal', 'Liquid Tight Conduit', 'NM (Romex)', 'N/A'] },
  { id: 'pool-gfci-protection', category: 'Swimming Pools and Spas', subcategory: 'Pool Electrical', item: 'GFCI Protection', required: false, type: 'multiselect', options: ['At Equipment Area', 'At Exterior', 'At Subpanel', 'Pool Light(s)', 'Spa Light(s)', 'None'] },
  { id: 'pool-damaged-conduit', category: 'Swimming Pools and Spas', subcategory: 'Defects - Pool Electrical', item: 'Damaged Conduit', required: false, type: 'checkbox', commentText: 'The damaged conduit should be repaired or replaced as needed.' },
  { id: 'pool-unterminated-wiring', category: 'Swimming Pools and Spas', subcategory: 'Defects - Pool Electrical', item: 'Unterminated Wiring', required: false, type: 'checkbox', commentText: 'The unterminated wiring coming to and from the spa should be properly capped off or removed.' },
  { id: 'pool-light-not-working', category: 'Swimming Pools and Spas', subcategory: 'Defects - Pool Electrical', item: 'Pool light not working', required: false, type: 'checkbox', commentText: 'Repair or replace as needed and verify GFCI protection.' },
  { id: 'pool-bonding-missing', category: 'Swimming Pools and Spas', subcategory: 'Defects - Pool Electrical', item: 'Bonding connection missing', required: false, type: 'checkbox', commentText: 'The Pool Spa heater bonding connection is not tied into the bonding system for the equipment.' },
  { id: 'pool-spa-remote-inop', category: 'Swimming Pools and Spas', subcategory: 'Defects - Pool Electrical', item: 'Spa Side Remote Inop', required: false, type: 'checkbox', commentText: 'The spa side remote control panel is not working and should be repaired or replaced with a remote control.' },

  // Control Valves
  { id: 'pool-valve-types', category: 'Swimming Pools and Spas', subcategory: 'Control Valves', item: 'Valve Type(s)', required: false, type: 'multiselect', options: ['Standard Manual Valves', 'Automatic Valves with Actuator', 'Not visible', 'In-ground Valves'] },
  { id: 'pool-valve-leak', category: 'Swimming Pools and Spas', subcategory: 'Defects - Control Valves', item: 'Leak at valve', required: false, type: 'checkbox' },

  // Filtering/Cleaning
  { id: 'pool-filtration-type', category: 'Swimming Pools and Spas', subcategory: 'Filtering & Cleaning', item: 'Filtration Type', required: false, type: 'multiselect', options: ['Diatomaceous Earth', 'Sand', 'Cartridge', 'None'] },
  { id: 'pool-water-treatment', category: 'Swimming Pools and Spas', subcategory: 'Filtering & Cleaning', item: 'Water Treatment', required: false, type: 'multiselect', options: ['Standard Chlorine', 'Auto-Chlorination', 'Other', 'N/A', 'Salt Water System'] },
  { id: 'pool-filtering-components', category: 'Swimming Pools and Spas', subcategory: 'Filtering & Cleaning', item: 'Filtering Components', required: false, type: 'multiselect', options: ['Skimmer', 'Pool Sweep', 'Auto-chlorinator'] },
  { id: 'pool-skimmer-noted', category: 'Swimming Pools and Spas', subcategory: 'Filtering & Cleaning', item: 'Skimmer Noted', required: false, type: 'boolean', options: ['Yes', 'No'] },
  { id: 'pool-filter-high-pressure', category: 'Swimming Pools and Spas', subcategory: 'Defects - Filtering & Cleaning', item: 'Filter High Pressure', required: false, type: 'checkbox', commentText: 'The pool filter gauge shows high pressure and needs service.' },
  { id: 'pool-skimmer-damaged', category: 'Swimming Pools and Spas', subcategory: 'Defects - Filtering & Cleaning', item: 'Skimmer Box Damaged', required: false, type: 'checkbox', commentText: 'The damaged skimmer box should be repaired to minimize leakage into the surrounding soil.' },
  { id: 'pool-salt-system-error', category: 'Swimming Pools and Spas', subcategory: 'Defects - Filtering & Cleaning', item: 'Salt System Error Noted', required: false, type: 'checkbox', commentText: 'The error message noted on the salt water control system indicates the need for service or repair.' },
  { id: 'pool-filter-gauge-inop', category: 'Swimming Pools and Spas', subcategory: 'Defects - Filtering & Cleaning', item: 'Filter pressure gauge is inoperative', required: false, type: 'checkbox' },

  // Pool Plumbing
  { id: 'pool-pipes', category: 'Swimming Pools and Spas', subcategory: 'Pool Plumbing', item: 'Pipes', required: false, type: 'multiselect', options: ['PVC', 'Copper', 'Metal'] },
  { id: 'pool-fill-valve-type', category: 'Swimming Pools and Spas', subcategory: 'Pool Plumbing', item: 'Fill Valve Type', required: false, type: 'multiselect', options: ['Manual', 'Auto-fill valve with float', 'None', 'Not found'] },
  { id: 'pool-fill-valve-leak', category: 'Swimming Pools and Spas', subcategory: 'Defects - Pool Plumbing', item: 'Fill-valve Leaking', required: false, type: 'checkbox', commentText: 'The pool fill valve is leaking and should be repaired.' },
  { id: 'pool-pvc-paint', category: 'Swimming Pools and Spas', subcategory: 'Defects - Pool Plumbing', item: 'PVC piping should be painted', required: false, type: 'checkbox', commentText: 'PVC can be damaged by sunlight and should be painted or coated for UV protection.' },
  { id: 'pool-water-level-low', category: 'Swimming Pools and Spas', subcategory: 'Defects - Pool Plumbing', item: 'Water Level Too Low', required: false, type: 'checkbox', commentText: 'The fill valve does keep the water level at the proper height and should be repaired or adjusted as needed.' },
  { id: 'pool-pipe-leak', category: 'Swimming Pools and Spas', subcategory: 'Defects - Pool Plumbing', item: 'Pipe Leaking', required: false, type: 'checkbox', commentText: 'The leaking pipe should be repaired.' },

  // Pumps
  { id: 'pool-pump-types', category: 'Swimming Pools and Spas', subcategory: 'Pumps', item: 'Pump Types', required: false, type: 'multiselect', options: ['Standard', 'Circulation', 'Variable Speed', 'Sweep', 'Waterfall', 'Other', 'Booster', 'N/A'] },
  { id: 'pool-pump-loose', category: 'Swimming Pools and Spas', subcategory: 'Defects - Pumps', item: 'Pump is Loose', required: false, type: 'checkbox', commentText: 'The pool pump should be properly secured or anchored to prevent movement.' },
  { id: 'pool-pump-halves-leak', category: 'Swimming Pools and Spas', subcategory: 'Defects - Pumps', item: 'Leaking Pump Halves', required: false, type: 'checkbox', commentText: 'The leaking pump halves should be tightened or repaired as needed.' },
  { id: 'pool-equipment-replace', category: 'Swimming Pools and Spas', subcategory: 'Defects - Pumps', item: 'All Equipment Needs to be Replaced', required: false, type: 'checkbox' },
  { id: 'pool-pump-leak', category: 'Swimming Pools and Spas', subcategory: 'Defects - Pumps', item: 'Leak', required: false, type: 'checkbox' },

  // Spa Controls
  { id: 'pool-spa-jets', category: 'Swimming Pools and Spas', subcategory: 'Spa Controls', item: 'Spa Jets', required: false, type: 'multiselect', options: ['Jets were operational', 'Air Blower (bubbler)', 'Booster Pump'] },
  { id: 'pool-spa-controls', category: 'Swimming Pools and Spas', subcategory: 'Spa Controls', item: 'Control(s)', required: false, type: 'multiselect', options: ['Spa Side Control', 'Remote Control', 'In-house Control'], commentText: 'We recommend verifying equipment with seller.' },
  { id: 'pool-spa-control-not-working', category: 'Swimming Pools and Spas', subcategory: 'Defects - Spa Controls', item: 'Spa Side Control Not Working', required: false, type: 'checkbox', commentText: 'The spa side remote control is not working.' },
  { id: 'pool-remote-not-working', category: 'Swimming Pools and Spas', subcategory: 'Defects - Spa Controls', item: 'Remote Not Working', required: false, type: 'checkbox', commentText: 'The pool/spa remote control is not working properly and should be repaired or replaced as needed.' },
  { id: 'pool-jets-not-operational', category: 'Swimming Pools and Spas', subcategory: 'Defects - Spa Controls', item: 'Jets were not operational', required: false, type: 'checkbox', commentText: 'The spa jets were not working properly and should be evaluated and repaired by a qualified specialist.' },
  { id: 'pool-air-bubbler-not-working', category: 'Swimming Pools and Spas', subcategory: 'Defects - Spa Controls', item: 'Air Injection (Bubbler) Not Working', required: false, type: 'checkbox', commentText: 'The spa air injection or bubbler is not working properly and should be repaired or replaced as needed.' },

  // Heating
  { id: 'pool-heating-type', category: 'Swimming Pools and Spas', subcategory: 'Heating', item: 'Heating Type', required: false, type: 'multiselect', options: ['Natural Gas Heater', 'Solar Heating', 'Electric Heater', 'Propane Heater', 'None', 'In-deck Solar'] },
  { id: 'pool-heater-age', category: 'Swimming Pools and Spas', subcategory: 'Heating', item: 'Age of Heater (Approx)', required: false, type: 'number' },
  { id: 'pool-heater-btu', category: 'Swimming Pools and Spas', subcategory: 'Heating', item: 'BTU Rating', required: false, type: 'number' },
  { id: 'pool-heater-serviceable', category: 'Swimming Pools and Spas', subcategory: 'Heating', item: 'Serviceable', required: false, type: 'boolean', options: ['Yes', 'No'] },
  { id: 'pool-heater-not-operational', category: 'Swimming Pools and Spas', subcategory: 'Defects - Heating', item: 'The pool heater is not operational', required: false, type: 'checkbox', commentText: 'The pool heater is not operational and should be further evaluated and repaired or replaced as needed.' },
  { id: 'pool-heater-rust-leak', category: 'Swimming Pools and Spas', subcategory: 'Defects - Heating', item: 'Rust and Leaking', required: false, type: 'checkbox', commentText: 'The pool heater has excessive corrosion and appears to be leaking and may need replacement. Further evaluation by a qualified specialist is needed.' },

  // Accessories
  { id: 'pool-diving-board-removed', category: 'Swimming Pools and Spas', subcategory: 'Accessories', item: 'Diving Board was Removed', required: false, type: 'boolean', options: ['Yes', 'No'], commentText: 'The diving board has apparently been removed.' },
  { id: 'pool-diving-board', category: 'Swimming Pools and Spas', subcategory: 'Accessories', item: 'Diving Board', required: false, type: 'boolean', options: ['Present', 'Not Present'], commentText: 'Diving boards are not inspected as part of our inspection. Any comments made regarding this equipment is done as a courtesy only. Diving boards are inherently dangerous and should be inspected regularly and closely monitored when in use.' },
  { id: 'pool-no-wall-diving', category: 'Swimming Pools and Spas', subcategory: 'Accessories', item: 'No Wall Diving', required: false, type: 'boolean', options: ['Yes', 'No'], commentText: 'The raised wall above the pool surface is not designed for diving as the pool depth may not be adequate. These areas should be monitored to prevent injury.' },
  { id: 'pool-exposed-bolts', category: 'Swimming Pools and Spas', subcategory: 'Defects - Accessories', item: 'Exposed Bolts from Diving Board', required: false, type: 'checkbox', commentText: 'The exposed bolts at the previous diving board location should be ground down or removed for safety.' },
  { id: 'pool-builtin-slide', category: 'Swimming Pools and Spas', subcategory: 'Accessories', item: 'Built-in Slide', required: false, type: 'boolean', options: ['Present', 'Not Present'], commentText: 'The slide is not inspected as part of our inspection. These are inherently dangerous and should be inspected regularly and monitored when in use. Always verify that the water flow is functional to prevent injury. Built-in slides may need to be re-coated or re-sealed every few years for safe operation.' },
  { id: 'pool-fiberglass-slide', category: 'Swimming Pools and Spas', subcategory: 'Accessories', item: 'Fiberglass Slide', required: false, type: 'boolean', options: ['Present', 'Not Present'], commentText: 'The slide is not inspected as part of our inspection. These are inherently dangerous and should be inspected regularly and monitored when in use. Always verify that the water flow is functional to prevent injury.' },

  // ============== SEWER LATERAL ==============
  // Sewer Lateral - Inspection Details
  { id: 'sewer-scan', category: 'Sewer Lateral', subcategory: 'Inspection Details', item: 'Sewer Scan', required: false, type: 'boolean', options: ['Yes', 'No'], commentText: 'A Sewer Scan was conducted of the main drain line from the building to the city or private sewer connection. The following is a report of our findings. If a video was completed, it will be provided under attachment section.' },
  { id: 'sewer-in-attendance', category: 'Sewer Lateral', subcategory: 'Inspection Details', item: 'In Attendance', required: false, type: 'multiselect', options: ['Client', "Client's Agent", 'Listing Agent', 'Tenants', 'Home Owner', 'No One Present', 'Clients representative'] },
  { id: 'sewer-occupancy', category: 'Sewer Lateral', subcategory: 'Inspection Details', item: 'Occupancy', required: false, type: 'multiselect', options: ['Occupied', 'Vacant'] },
  { id: 'sewer-analysis-recommendations', category: 'Sewer Lateral', subcategory: 'Inspection Details', item: 'Analysis and Recommendations', required: false, type: 'boolean', options: ['Yes', 'No'], commentText: 'We recommend that you carefully review this report. All defects should be evaluated and repaired as necessary by a qualified professional. We recommend all areas that are noted in this report showing blockage and other anomalies should be evaluated further to find out the cause and repaired as necessary.' },
  { id: 'sewer-limitations', category: 'Sewer Lateral', subcategory: 'Inspection Details', item: 'Drain System: Brief Explanation of Limitations', required: false, type: 'info', commentText: 'All items noted in the sewer report are a reflection of the condition of the sewer lateral lines at the time of the inspection and not a warranty or guarantee of how long they will continue to work or of future damage. Not all improvements will be identified during this inspection. Unexpected repairs should still be anticipated. The inspection report should not be considered a guarantee or warranty of any kind. The inspection is not a code inspection, any previous permits for the property will not be examined nor does it qualify as a city occupancy inspection. Please refer to the pre-inspection agreement for a full explanation of the scope of the inspection report. Reading and reviewing the entire inspection report is recommended as items can be missed when being moved to the summary page. We may have been unable to fully view the sewer line. Concealed defects are NOT within the scope of our inspections. There may be deferred maintenance or items needing further evaluation, services, or repairs. The inspection report is not a pass or fail report. The inspection is not a code inspection and is not to be used as a code inspection.' },

  // Sewer Lateral - General Information
  { id: 'sewer-overview', category: 'Sewer Lateral', subcategory: 'General Information', item: 'Overview', required: false, type: 'info', commentText: 'Inspector was retained for a scope of the building\'s main sewer line in an effort to identify areas of suspect clogs or damage and to document the areas for further review. The inspector will try to enter the sewer line through the main cleanout if the cleanout is not accessible they will then try the roof vent or a floor drain. The inspection does not include sink drains, laundry drains, or any other drains connecting to the main sewer line. On rare occasions, there could be multiple lines going to the city main the inspector is not responsible for those lines. Further investigations of these areas or destructive testing may reveal additional conditions that were not readily visible at the time of inspection.' },
  { id: 'sewer-summary-findings', category: 'Sewer Lateral', subcategory: 'General Information', item: 'Summary of Findings', required: false, type: 'info', commentText: 'The inspection does not include other drains such as laundry, kitchen, floor drains, bathroom drains etc. The inspection may be constrained due to the design of the pipe and obstructions inside the pipe and at access points and is limited to the time and date of the inspection. We will note that in the report if a limitation exists. If the need for repairs is noted within this report, we recommend that you have a qualified plumber evaluate the noted defects and repair them as necessary. We recommend all areas we locate in this report showing blockage and other anomalies should be evaluated further to determine the cause and repair. It should be understood that sometimes due to extent of debris or roots found, we are unable to fully access the line. We recommend a further review of lines in these cases when cleared and the lines can be better accessed at that time.' },

  // Sewer Lateral - Main Sewer Line (Info Items)
  { id: 'sewer-length-inspected', category: 'Sewer Lateral', subcategory: 'Main Sewer Line', item: 'Approximate Length of Pipe Inspected', required: false, type: 'number', commentText: 'The inspector was able to inspect approximately this many feet of the sewer line. All measurements are approximate distances based on the access point.' },
  { id: 'sewer-city-main-distance', category: 'Sewer Lateral', subcategory: 'Main Sewer Line', item: 'Distance to City Main', required: false, type: 'number', commentText: 'It was approximately this many feet to the city main.' },
  { id: 'sewer-cast-iron-clay-satisfactory', category: 'Sewer Lateral', subcategory: 'Main Sewer Line', item: 'Cast Iron/Clay Tile with No Visible Defects', required: false, type: 'boolean', options: ['Yes', 'No'], commentText: 'Cast Iron and Clay Tile sewer lines depending on when they were installed could be approaching the end of their average life expectancy. At the time of the inspection, the sewer line was in satisfactory condition. It is recommended to budget for potential repairs or upgrades in the future.' },
  { id: 'sewer-access-location', category: 'Sewer Lateral', subcategory: 'Main Sewer Line', item: 'Main Drain Access Location', required: false, type: 'multiselect', options: ['Interior clean out', 'Roof vent', 'Yard clean out', 'No accessible clean out', 'Yard Trap', 'Toilet Flange'] },
  { id: 'sewer-materials', category: 'Sewer Lateral', subcategory: 'Main Sewer Line', item: 'Materials from Access', required: false, type: 'multiselect', options: ['ABS', 'Cast Iron', 'Clay', 'Galvanized', 'PVC', 'Orangeburg', 'SDR', 'Unknown'], commentText: 'All sewer line materials are not always identifiable.' },
  { id: 'sewer-no-access', category: 'Sewer Lateral', subcategory: 'Main Sewer Line', item: 'No Sewer Access', required: false, type: 'boolean', options: ['Yes', 'No'], commentText: 'There was no visible clean-out for the sewer line. It is recommended to have a clean-out installed and to have the sewer line inspected prior to the final inspection report.' },
  { id: 'sewer-septic-tank', category: 'Sewer Lateral', subcategory: 'Main Sewer Line', item: 'Septic Tank', required: false, type: 'boolean', options: ['Yes', 'No'], commentText: 'Upon arrival the inspector noticed that the main sewer line is connected to a private sewage containment system, not a public sewer system. It is recommended to have the system inspected by a qualified septic inspector.' },
  { id: 'sewer-needs-repairs', category: 'Sewer Lateral', subcategory: 'Main Sewer Line', item: 'Sewer Line Needs Repairs/Maintenance', required: false, type: 'boolean', options: ['Yes', 'No'], commentText: 'The sewer lateral inspection revealed one or more of the following issues roots, cracks, separation, breaks, etc in the sewer line. It is recommended to have a qualified plumber evaluate and repair it as necessary.' },
  { id: 'sewer-satisfactory', category: 'Sewer Lateral', subcategory: 'Main Sewer Line', item: 'Sewer Line Satisfactory', required: false, type: 'boolean', options: ['Yes', 'No'], commentText: 'At the time of the inspection, the visible portion of the sewer line was in satisfactory condition.' },
  { id: 'sewer-unable-reach-city-main', category: 'Sewer Lateral', subcategory: 'Main Sewer Line', item: 'Unable to Reach City Main', required: false, type: 'boolean', options: ['Yes', 'No'], commentText: 'At the time of the sewer lateral inspection. The inspector was not able to reach the city main for one of the following reasons. Roots in the sewer line, a visible obstruction in the sewer, submerged obstruction in the sewer line that is not visible, bends in the sewer line, distance in between accessible cleanouts in the sewer line, other restrictions, or no visible sewer access.' },
  { id: 'sewer-video-link', category: 'Sewer Lateral', subcategory: 'Main Sewer Line', item: 'Sewer Scope Video Link', required: false, type: 'textarea', commentText: 'Please click the link below or copy and paste it to the search bar to watch the sewer line video inspection.' },

  // Sewer Lateral - Main Sewer Line (Defects)
  { id: 'sewer-90-degree-turn', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: '90 Degree Turn Preventing Full Inspection', required: false, type: 'checkbox' },
  { id: 'sewer-backflow-no-access', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Back Flow Prevention Valve With No Access', required: false, type: 'checkbox' },
  { id: 'sewer-backflow-valve', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Back Flow Valve', required: false, type: 'checkbox' },
  { id: 'sewer-belly', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Belly', required: false, type: 'checkbox' },
  { id: 'sewer-buildup', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Build Up in the Sewer Line', required: false, type: 'checkbox' },
  { id: 'sewer-cleanout-inaccessible', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Clean Out Inaccessible', required: false, type: 'checkbox' },
  { id: 'sewer-cleanout-needed', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Clean Out Needed Every 100 Feet', required: false, type: 'checkbox' },
  { id: 'sewer-damaged-cap', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Damaged Clean Out Cap', required: false, type: 'checkbox' },
  { id: 'sewer-damaged-line', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Damaged Line', required: false, type: 'checkbox' },
  { id: 'sewer-light-root-growth', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Light Root Growth Clay Tile (Regular Maintenance Recommended)', required: false, type: 'checkbox' },
  { id: 'sewer-obstruction', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Obstruction', required: false, type: 'checkbox' },
  { id: 'sewer-offset', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Offset', required: false, type: 'checkbox' },
  { id: 'sewer-orangeburg', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Orangeburg', required: false, type: 'checkbox' },
  { id: 'sewer-recommend-cleanout', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Recommend Adding an Outside Cleanout', required: false, type: 'checkbox' },
  { id: 'sewer-recommend-hydrojetting', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Recommend Hydro-jetting', required: false, type: 'checkbox' },
  { id: 'sewer-repair-observed', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Repair Observed', required: false, type: 'checkbox' },
  { id: 'sewer-root-intrusion', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Root Intrusion', required: false, type: 'checkbox' },
  { id: 'sewer-scale-buildup', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Scale Build Up', required: false, type: 'checkbox' },
  { id: 'sewer-separation', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Separation', required: false, type: 'checkbox' },
  { id: 'sewer-cap-doesnt-fit', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Sewer Line Cap Doesnt Fit Properly', required: false, type: 'checkbox' },
  { id: 'sewer-vent-stack-clogged', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Vent Stack Clogged', required: false, type: 'checkbox' },
  { id: 'sewer-vent-stack-obstructed', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Vent Stack Obstructed', required: false, type: 'checkbox' },
  { id: 'sewer-yard-trap-covered', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Yard Trap Access Covered', required: false, type: 'checkbox' },
  { id: 'sewer-yard-trap-present', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'Yard Trap Present', required: false, type: 'checkbox' },
  { id: 'sewer-no-visible-access', category: 'Sewer Lateral', subcategory: 'Defects - Main Sewer Line', item: 'No Visible Access', required: false, type: 'checkbox' },

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

  // Support both category IDs ("foundation") and labels ("Foundation & Structure")
  const categoryLabel = categoryMapping[categoryId] ?? categoryId;

  // Merge the existing checklist with missing defects
  const fullChecklist = mergeChecklists(inspectionChecklist, missingChecklistDefects);

  // Filter items based on category and subcategory
  const filteredItems = fullChecklist.filter((item) => {
    // Match by exact category name OR by mapped category label
    const categoryMatches = item.category === categoryLabel || 
      item.category === categoryId ||
      Object.entries(categoryMapping).some(([key, value]) => 
        (key === categoryId || value === categoryLabel) && 
        (item.category === key || item.category === value)
      );
    
    if (!categoryMatches) return false;

    // When a subcategory is selected, match items with that subcategory OR items with Defects - subcategory
    if (subcategory) {
      // Check for exact subcategory match
      if (item.subcategory === subcategory) return true;
      // Also include related defects for this subcategory
      if (item.subcategory === `Defects - ${subcategory}`) return true;
      return false;
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
            {item.commentText && (
              <p className="text-xs text-muted-foreground italic mb-2">{item.commentText}</p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {item.options?.map((option) => (
                <label key={option} className="flex items-center space-x-2 text-sm">
                  <Checkbox
                    checked={(selectedOptions[item.id] || []).includes(option)}
                    onCheckedChange={() => handleMultiSelect(item.id, option)}
                  />
                  <span className="text-foreground">{option}</span>
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
              className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
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
                className="w-full px-3 py-2 pr-16 border border-input rounded-md text-sm bg-background text-foreground"
                min="1"
                max="500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                gallons
              </span>
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <div className="relative">
              <input
                type="number"
                step="0.1"
                placeholder="Enter value"
                value={gallonsValues[item.id] || ''}
                onChange={(e) => handleGallonsChange(item.id, e.target.value)}
                className="w-full px-3 py-2 pr-16 border border-input rounded-md text-sm bg-background text-foreground"
              />
              {item.id === 'radon-average-pcil' && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  pCi/L
                </span>
              )}
            </div>
          </div>
        );

      case 'boolean':
        // Radio button UI for boolean type items
        return (
          <div className="space-y-3">
            {item.commentText && (
              <p className="text-xs text-muted-foreground italic mb-2">{item.commentText}</p>
            )}
            <div className="flex gap-4 flex-wrap">
              {item.options?.map((option) => (
                <label key={option} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={item.id}
                    value={option}
                    checked={ratingValues[item.id] === option}
                    onChange={(e) => handleRatingChange(item.id, e.target.value)}
                    className="h-4 w-4 text-primary border-input focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'info':
        // EPA Resources info block for Radon
        if (item.id === 'radon-epa-resources') {
          return (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-foreground">
                This report includes test results from a radon-testing device that records the levels of radon gas in an air sample. The actual radon levels in the home may vary depending on many factors including, time, temperature, season, barometric pressure, ventilation, and other factors.
              </p>
              <p className="text-sm text-foreground">
                Homes tested using the EPA's protocol should not be mitigated on the basis of a single short term test as used for real estate transactions under EPA protocols. A follow-up test is necessary for mitigation decision-making regardless of the initial test result.
              </p>
              <p className="text-sm text-foreground">
                Consulting with a professional radon mitigation specialist is your best option for retesting if there is a concern for mitigation to reducing the level of radon in the home.
              </p>
              <p className="text-sm text-foreground">
                EPA recommends that you should "fix your home" if the radon level is equal to or greater than 4 pCi/L (the Action Level) and "consider fixing your home" if the radon level is equal to or greater than 2 pCi/L.
              </p>
              <p className="text-sm text-foreground">
                Homes should be checked every few years to make sure homes are lower than the 4 pCi/L level set by the EPA, whether or not you have a mitigation system.
              </p>
              <a 
                href="https://www.epa.gov/radon" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
              >
                More information at the EPA's website →
              </a>
            </div>
          );
        }
        // EPA Resources info block for Water Testing
        if (item.id === 'water-testing-epa-resources') {
          return (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-foreground">
                This report includes testing utilizing water test strips. The tests are not EPA-approved and may give inaccurate readings. These tests should be considered a baseline measurement of substances in the drinking water.
              </p>
              <p className="text-sm text-foreground">
                Any abnormal readings should have a follow-up test by an EPA-approved laboratory.
              </p>
              <a 
                href="https://www.epa.gov/privatewells/protect-your-homes-water" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
              >
                More information at the EPA's website →
              </a>
            </div>
          );
        }
        // Generic info block for other items (like Sewer Lateral)
        if (item.commentText) {
          return (
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-foreground">{item.commentText}</p>
            </div>
          );
        }
        return null;

      case 'time':
        return (
          <div className="space-y-2">
            <input
              type="time"
              value={notes[item.id] || ''}
              onChange={(e) => handleNoteChange(item.id, e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
            />
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <input
              type="text"
              placeholder={item.item === 'Serial Number' ? 'Enter serial number' : 
                          item.item === 'Model Number' ? 'Enter model number' :
                          item.item === 'Start Day' ? 'e.g., Monday' :
                          item.item === 'End Day' ? 'e.g., Wednesday' :
                          item.item === 'Testing Device Information' ? 'e.g., Best Prod 17 in One Test Kit for Water' :
                          'Enter value'}
              value={notes[item.id] || ''}
              onChange={(e) => handleNoteChange(item.id, e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
            />
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {item.commentText && (
              <p className="text-xs text-muted-foreground italic mb-2">{item.commentText}</p>
            )}
            <div className="flex gap-4 flex-wrap">
              {item.options?.map((option) => (
                <label key={option} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={item.id}
                    value={option}
                    checked={ratingValues[item.id] === option}
                    onChange={(e) => handleRatingChange(item.id, e.target.value)}
                    className="h-4 w-4 text-primary border-input focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'textarea':
        const defaultEpaText = item.id === 'radon-epa-resources' 
          ? `This report includes test results from a radon-testing device that records the levels of radon gas in an air sample. The actual radon levels in the home may vary depending on many factors including, time, temperature, season, barometric pressure, ventilation, and other factors.

Homes tested using the EPAs protocol should not be mitigated on the basis of a single short term test as used for real estate transactions under EPA protocols. A follow-up test is necessary for mitigation decision-making regardless of the initial test result.

Consulting with a professional radon mitigation specialist is your best option for retesting if there is a concern for mitigation to reducing the level of radon in the home.

EPA recommends that you should "fix your home" if the radon level is equal to or greater than 4 pCi/L (the Action Level) and "consider fixing your home" if the radon level is equal to or greater than 2 pCi/L.

Homes should be checked every few years to make sure homes are lower than the 4pCi/L level set by the EPA, whether or not you have a mitigation system.

More information can be found directly at the EPA's website: https://www.epa.gov/radon`
          : '';
        
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="Enter notes..."
              value={notes[item.id] ?? defaultEpaText}
              onChange={(e) => handleNoteChange(item.id, e.target.value)}
              className="min-h-[200px] text-sm bg-background text-foreground"
            />
          </div>
        );
        
      case 'rating':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {item.options?.map((rating) => {
                let colorClasses = '';
                if (item.item.includes('Inspector Overall') || item.item.includes('Overall Inspection')) {
                  switch (rating) {
                    case 'Excellent':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 dark:border-emerald-700';
                      break;
                    case 'Very Good':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 dark:border-green-700';
                      break;
                    case 'Good':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-yellow-600 text-white'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50 dark:border-yellow-700';
                      break;
                    case 'Poor':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50 dark:border-orange-700';
                      break;
                    case 'Replace':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-red-600 text-white'
                        : 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 dark:border-red-700';
                      break;
                    case 'Not Inspected':
                    case 'Partial Inspected':
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600';
                      break;
                    default:
                      colorClasses = ratingValues[item.id] === rating
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
                  }
                } else {
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
        // For defect items, show checkbox with category badge and description textarea
        if (item.subcategory?.includes('Defects')) {
          const isDefectSelected = selectedDefects[item.id] === true;
          const defectCategoryLabel = `Defects - ${item.subcategory.replace('Defects - ', '')}`;
          
          return (
            <div className="space-y-0">
              <Textarea
                placeholder="Add inspection comments..."
                value={notes[item.id] || defectDescriptions[item.id] || ''}
                onChange={(e) => handleNoteChange(item.id, e.target.value)}
                className="min-h-[100px] text-sm bg-background text-foreground border-t-0 rounded-t-none"
              />
            </div>
          );
        }
        
        // For green feature items
        if (item.category === 'Green Features') {
          return (
            <div className="space-y-3">
              <Textarea
                placeholder="Add inspection comments..."
                value={notes[item.id] || ''}
                onChange={(e) => handleNoteChange(item.id, e.target.value)}
                className="min-h-[100px] text-sm bg-background text-foreground"
              />
            </div>
          );
        }
        
        return (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleItemCheck(item.id, 'pass')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                checkedItems[item.id] === 'pass'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
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
                  : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
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
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
              }`}
            >
              N/A
            </button>
          </div>
        );
    }
  };

  // Group items by subcategory for better organization
  const groupedItems = filteredItems.reduce((acc, item) => {
    const key = item.subcategory || 'General';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  // Sort keys to put defects at the end
  const sortedKeys = Object.keys(groupedItems).sort((a, b) => {
    const aIsDefect = a.includes('Defects');
    const bIsDefect = b.includes('Defects');
    if (aIsDefect && !bIsDefect) return 1;
    if (!aIsDefect && bIsDefect) return -1;
    return 0;
  });

  // Helper function to check if items should be rendered as a flex row pair
  const isFlexRowPair = (item: ChecklistItem, nextItem: ChecklistItem | undefined) => {
    // Radon Start/End Time should be in the same row
    if (item.id === 'radon-start-time' && nextItem?.id === 'radon-end-time') return true;
    // Radon Serial/Model Number should be in the same row
    if (item.id === 'radon-serial-number' && nextItem?.id === 'radon-model-number') return true;
    // Radon Measurement Interval and Elapsed Time
    if (item.id === 'radon-measurement-interval' && nextItem?.id === 'radon-elapsed-time') return true;
    // Water Testing Start/End Day
    if (item.id === 'water-testing-start-day' && nextItem?.id === 'water-testing-end-day') return true;
    return false;
  };

  // IDs that should be skipped because they're rendered as part of a pair
  const skipIds = ['radon-end-time', 'radon-model-number', 'radon-elapsed-time', 'water-testing-end-day'];

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No checklist items found for this category.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedKeys.map((groupKey) => (
        <div key={groupKey} className="space-y-4">
          {/* Only show group header if there are multiple groups or if it's a defects section */}
          {(sortedKeys.length > 1 || groupKey.includes('Defects')) && (
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <h4 className={cn(
                "text-sm font-medium",
                groupKey.includes('Defects') ? "text-destructive" : "text-foreground"
              )}>
                {groupKey.includes('Defects') ? (
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    {groupKey.replace('Defects - ', '')} Defects
                  </span>
                ) : (
                  groupKey
                )}
              </h4>
            </div>
          )}
          
          {groupedItems[groupKey].map((item, index) => {
            const isDefectItem = item.subcategory?.includes('Defects');
            const defectCategoryLabel = isDefectItem ? `Defects - ${item.subcategory?.replace('Defects - ', '')}` : '';
            const isDefectSelected = selectedDefects[item.id] === true;
            const groupItems = groupedItems[groupKey];
            const nextItem = groupItems[index + 1];
            
            // Skip items that are part of a flex row pair (they're rendered with their partner)
            if (skipIds.includes(item.id)) {
              return null;
            }
            
            // Check if this item should be rendered in a flex row with the next item
            const shouldRenderFlexRow = isFlexRowPair(item, nextItem);
            
            // Special rendering for defect items to match reference design
            if (isDefectItem) {
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-border bg-card overflow-hidden"
                >
                  {/* Header row with checkbox, badge, and item name */}
                  <div className="flex items-center gap-3 p-3 border-b border-border/50">
                    <Checkbox
                      id={item.id}
                      checked={isDefectSelected}
                      onCheckedChange={(checked) => handleDefectCheck(item.id, checked as boolean)}
                      className="h-5 w-5"
                    />
                    <Badge 
                      variant="outline" 
                      className="text-xs font-normal border-destructive/50 text-destructive bg-destructive/5 whitespace-nowrap"
                    >
                      {defectCategoryLabel}
                    </Badge>
                    <label 
                      htmlFor={item.id}
                      className="font-medium text-sm text-foreground cursor-pointer flex-1"
                    >
                      {item.item}
                    </label>
                  </div>
                  {/* Description textarea */}
                  {renderItemContent(item)}
                </div>
              );
            }
            
            // Flex row rendering for paired items (like Start Time / End Time)
            if (shouldRenderFlexRow && nextItem) {
              return (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border bg-card transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(checkedItems[item.id])}
                        <span className="font-medium text-sm text-foreground">{item.item}</span>
                        {item.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                    </div>
                    {renderItemContent(item)}
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-card transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(checkedItems[nextItem.id])}
                        <span className="font-medium text-sm text-foreground">{nextItem.item}</span>
                        {nextItem.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                    </div>
                    {renderItemContent(nextItem)}
                  </div>
                </div>
              );
            }
            
            // Standard rendering for non-defect items
            return (
              <div
                key={item.id}
                className="p-4 rounded-lg border border-border bg-card transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(checkedItems[item.id])}
                    <span className="font-medium text-sm text-foreground">{item.item}</span>
                    {item.required && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                  </div>
                </div>
                {renderItemContent(item)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
