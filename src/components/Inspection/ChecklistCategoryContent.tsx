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
  type: 'checkbox' | 'rating' | 'year' | 'multiselect' | 'gallons' | 'number' | 'info' | 'textarea';
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
  'radon': 'Radon',
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
  // Radon - Summary
  { id: 'radon-average-pcil', category: 'Radon', subcategory: 'Summary', item: 'Average pCi/L', required: false, type: 'number' },
  { id: 'radon-epa-resources', category: 'Radon', subcategory: 'Summary', item: 'EPA Resources', required: false, type: 'textarea' },
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

  // Filter items based on category and subcategory
  const filteredItems = inspectionChecklist.filter((item) => {
    if (item.category !== categoryLabel) return false;

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
        return null;

      case 'textarea':
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="Enter notes..."
              value={notes[item.id] || ''}
              onChange={(e) => handleNoteChange(item.id, e.target.value)}
              className="min-h-[120px] text-sm bg-background text-foreground"
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
          
          {groupedItems[groupKey].map((item) => {
            const isDefectItem = item.subcategory?.includes('Defects');
            const defectCategoryLabel = isDefectItem ? `Defects - ${item.subcategory?.replace('Defects - ', '')}` : '';
            const isDefectSelected = selectedDefects[item.id] === true;
            
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
