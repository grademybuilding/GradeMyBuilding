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
  'Exterior Cladding',
  'Walkways, Patios & Driveways',
  'Wood Decks & Balconies',
  'Foundation & Structure',
  'Heating & Cooling',
  'Doors & Windows',
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
  },
  // Roof Eaves, Soffits & Fascia
  {
    id: 'roof-eaves-soffits-fascia-material',
    category: 'Roof',
    subcategory: 'Eaves, Soffits & Fascia',
    item: 'Material',
    required: false,
    type: 'multiselect',
    options: ['Wood', 'Vinyl', 'Aluminum', 'Fiber Cement', 'Steel', 'Composite']
  },
  {
    id: 'roof-eaves-soffits-fascia-inspector-rating',
    category: 'Roof',
    subcategory: 'Eaves, Soffits & Fascia',
    item: 'Inspector Overall Grading',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Roof Eaves, Soffits & Fascia Defects
  {
    id: 'roof-wasps-nest',
    category: 'Roof',
    subcategory: 'Defects - Eaves, Soffits & Fascia',
    item: 'Wasps Nest',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-paint-finish-failing',
    category: 'Roof',
    subcategory: 'Defects - Eaves, Soffits & Fascia',
    item: 'Paint/Finish Failing',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-gap',
    category: 'Roof',
    subcategory: 'Defects - Eaves, Soffits & Fascia',
    item: 'Gap',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-fascia-rotted',
    category: 'Roof',
    subcategory: 'Defects - Eaves, Soffits & Fascia',
    item: 'Fascia - Rotted',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-fascia-loose',
    category: 'Roof',
    subcategory: 'Defects - Eaves, Soffits & Fascia',
    item: 'Fascia - Loose',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-fascia-damaged',
    category: 'Roof',
    subcategory: 'Defects - Eaves, Soffits & Fascia',
    item: 'Fascia - Damaged',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-eaves-water-stains',
    category: 'Roof',
    subcategory: 'Defects - Eaves, Soffits & Fascia',
    item: 'Eaves - Water Stains',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'roof-eaves-damaged',
    category: 'Roof',
    subcategory: 'Defects - Eaves, Soffits & Fascia',
    item: 'Eaves - Damaged',
    required: false,
    type: 'checkbox'
  },
  // Walkways, Patios & Driveways
  {
    id: 'walkways-driveway-material',
    category: 'Walkways, Patios & Driveways',
    item: 'Driveway Material',
    required: false,
    type: 'multiselect',
    options: ['Asphalt', 'Brick', 'Cobblestone', 'Concrete', 'Dirt', 'Gravel', 'Pavers', 'Street Parking']
  },
  {
    id: 'walkways-inspector-rating',
    category: 'Walkways, Patios & Driveways',
    item: 'Inspector Overall Rating',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Walkways, Patios & Driveways Defects
  {
    id: 'walkways-walkway-cracking-major',
    category: 'Walkways, Patios & Driveways',
    subcategory: 'Defects',
    item: 'Walkway Cracking - Major',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'walkways-patio-cracking-minor',
    category: 'Walkways, Patios & Driveways',
    subcategory: 'Defects',
    item: 'Patio Cracking - Minor',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'walkways-patio-cracking-major',
    category: 'Walkways, Patios & Driveways',
    subcategory: 'Defects',
    item: 'Patio Cracking - Major',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'walkways-walkway-cracking-minor',
    category: 'Walkways, Patios & Driveways',
    subcategory: 'Defects',
    item: 'Walkway Cracking - Minor',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'walkways-driveway-draining-towards-home',
    category: 'Walkways, Patios & Driveways',
    subcategory: 'Defects',
    item: 'Driveway Draining Towards Home',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'walkways-driveway-cracking-minor',
    category: 'Walkways, Patios & Driveways',
    subcategory: 'Defects',
    item: 'Driveway Cracking - Minor',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'walkways-driveway-cracking-major',
    category: 'Walkways, Patios & Driveways',
    subcategory: 'Defects',
    item: 'Driveway Cracking - Major',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'walkways-driveway-trip-hazard',
    category: 'Walkways, Patios & Driveways',
    subcategory: 'Defects',
    item: 'Driveway Trip Hazard',
    required: false,
    type: 'checkbox'
  },
  // Wood Decks and Balconies
  {
    id: 'wood-decks-appurtenance',
    category: 'Wood Decks & Balconies',
    subcategory: 'Deck and Balconies',
    item: 'Appurtenance',
    required: false,
    type: 'multiselect',
    options: ['Balcony', 'Covered Porch', 'Deck with Steps', 'Shed', 'Deck', 'Sidewalk', 'Front Porch', 'Pool', 'Sunroom', 'Hot Tub', 'Patio', 'Retaining Wall']
  },
  {
    id: 'wood-decks-material',
    category: 'Wood Decks & Balconies',
    subcategory: 'Deck and Balconies',
    item: 'Material',
    required: false,
    type: 'multiselect',
    options: ['Composite', 'Concrete', 'Wood']
  },
  {
    id: 'wood-decks-inspector-rating',
    category: 'Wood Decks & Balconies',
    subcategory: 'Deck and Balconies',
    item: 'Overall Inspection Rating',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Wood Decks and Balconies Defects
  {
    id: 'wood-decks-ledger-board-improperly-installed',
    category: 'Wood Decks & Balconies',
    subcategory: 'Defects - Deck and Balconies',
    item: 'Ledger Board Improperly Installed',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'wood-decks-joist-hangers',
    category: 'Wood Decks & Balconies',
    subcategory: 'Defects - Deck and Balconies',
    item: 'Joist Hangers',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'wood-decks-improper-deck-construction',
    category: 'Wood Decks & Balconies',
    subcategory: 'Defects - Deck and Balconies',
    item: 'Improper Deck Construction Practices',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'wood-decks-water-sealant-required',
    category: 'Wood Decks & Balconies',
    subcategory: 'Defects - Deck and Balconies',
    item: 'Deck - Water Sealant Required',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'wood-decks-stairs-deteriorated',
    category: 'Wood Decks & Balconies',
    subcategory: 'Defects - Deck and Balconies',
    item: 'Stairs - Deteriorated',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'wood-decks-rotted-boards',
    category: 'Wood Decks & Balconies',
    subcategory: 'Defects - Deck and Balconies',
    item: 'Deck - Rotted Boards',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'wood-decks-nails-exposed',
    category: 'Wood Decks & Balconies',
    subcategory: 'Defects - Deck and Balconies',
    item: 'Deck - Nails Exposed',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'wood-decks-loose-boards',
    category: 'Wood Decks & Balconies',
    subcategory: 'Defects - Deck and Balconies',
    item: 'Deck - Loose Boards',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'wood-decks-unstable-support',
    category: 'Wood Decks & Balconies',
    subcategory: 'Defects - Deck and Balconies',
    item: 'Deck - Unstable Support',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'wood-decks-railing-unsafe',
    category: 'Wood Decks & Balconies',
    subcategory: 'Defects - Deck and Balconies',
    item: 'Railing Unsafe',
    required: false,
    type: 'checkbox'
  },
  // Foundation & Structure
  {
    id: 'foundation-inspection-method',
    category: 'Foundation & Structure',
    item: 'Inspection Method',
    required: false,
    type: 'multiselect',
    options: ['Attic Access', 'Basement Access', 'Crawlspace Access', 'Infrared', 'Visual']
  },
  {
    id: 'foundation-material',
    category: 'Foundation & Structure',
    subcategory: 'Foundation',
    item: 'Material',
    required: false,
    type: 'multiselect',
    options: ['Brick', 'Concrete', 'Masonry Block', 'Stone', 'Rock', 'Slab on Grade']
  },
  {
    id: 'foundation-inspector-rating',
    category: 'Foundation & Structure',
    subcategory: 'Foundation',
    item: 'Inspector Overall Rating',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Foundation Defects
  {
    id: 'foundation-walls-bowing-leaning',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Foundation',
    item: 'Wall(s) Bowing/Leaning',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-poor-ventilation',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Foundation',
    item: 'Poor Ventilation of Foundation Area',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-improper-construction',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Foundation',
    item: 'Improper Construction Practices',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-water-intrusion',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Foundation',
    item: 'Water Intrusion',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-cracks-minor',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Foundation',
    item: 'Foundation Cracks - Minor',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-cracks-major',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Foundation',
    item: 'Foundation Cracks - Major',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-heaving-settling',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Foundation',
    item: 'Heaving/Settling',
    required: false,
    type: 'checkbox'
  },
  // Basement & Crawlspace
  {
    id: 'foundation-basement-crawlspace-type',
    category: 'Foundation & Structure',
    subcategory: 'Basement & Crawlspace',
    item: 'Type',
    required: false,
    type: 'multiselect',
    options: ['Full Basement', 'Partial Basement', 'Crawlspace', 'Slab on Grade', 'Walk-out Basement', 'Daylight Basement']
  },
  {
    id: 'foundation-basement-crawlspace-material',
    category: 'Foundation & Structure',
    subcategory: 'Basement & Crawlspace',
    item: 'Material',
    required: false,
    type: 'multiselect',
    options: ['Concrete Block', 'Poured Concrete', 'Stone', 'Brick', 'Wood Frame', 'Steel Frame']
  },
  {
    id: 'foundation-basement-crawlspace-inspector-rating',
    category: 'Foundation & Structure',
    subcategory: 'Basement & Crawlspace',
    item: 'Inspector Overall Rating',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Basements & Crawlspaces Defects
  {
    id: 'basements-high-moisture-levels',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Basements & Crawlspaces',
    item: 'High Moisture Levels',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'basements-efflorescence',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Basements & Crawlspaces',
    item: 'Efflorescence',
    required: false,
    type: 'checkbox'
  },
  // Floor Structure
  {
    id: 'foundation-floor-structure-material',
    category: 'Foundation & Structure',
    subcategory: 'Floor Structure',
    item: 'Material',
    required: false,
    type: 'multiselect',
    options: ['Concrete Slab', 'Wood Joists', 'Steel Joists', 'Engineered Lumber', 'Composite Deck']
  },
  {
    id: 'foundation-floor-structure-inspector-rating',
    category: 'Foundation & Structure',
    subcategory: 'Floor Structure',
    item: 'Inspector Overall Rating',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Floor Structure Defects
  {
    id: 'foundation-floor-structure-sagging',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Floor Structure',
    item: 'Floor Sagging',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-floor-structure-bouncy',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Floor Structure',
    item: 'Floor Bouncy/Springy',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-floor-structure-damaged-joists',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Floor Structure',
    item: 'Damaged/Cracked Joists',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-floor-structure-inadequate-support',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Floor Structure',
    item: 'Inadequate Support',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-floor-structure-rot-damage',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Floor Structure',
    item: 'Rot/Moisture Damage',
    required: false,
    type: 'checkbox'
  },
  // Wall Structure
  {
    id: 'foundation-wall-structure-material',
    category: 'Foundation & Structure',
    subcategory: 'Wall Structure',
    item: 'Material',
    required: false,
    type: 'multiselect',
    options: ['Wood Frame', 'Steel Frame', 'Masonry', 'Concrete Block', 'Poured Concrete', 'Stone']
  },
  {
    id: 'foundation-wall-structure-inspector-rating',
    category: 'Foundation & Structure',
    subcategory: 'Wall Structure',
    item: 'Inspector Overall Rating',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Wall Structure Defects
  {
    id: 'foundation-wall-structure-bowing',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Wall Structure',
    item: 'Wall Bowing/Bulging',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-wall-structure-cracks',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Wall Structure',
    item: 'Structural Cracks',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-wall-structure-water-damage',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Wall Structure',
    item: 'Water Damage/Stains',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-wall-structure-insulation-issues',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Wall Structure',
    item: 'Insulation Issues',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-wall-structure-mold-growth',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Wall Structure',
    item: 'Mold/Mildew Growth',
    required: false,
    type: 'checkbox'
  },
  // Ceiling Structure
  {
    id: 'foundation-ceiling-structure-material',
    category: 'Foundation & Structure',
    subcategory: 'Ceiling Structure',
    item: 'Material',
    required: false,
    type: 'multiselect',
    options: ['Exposed Joists', 'Drywall', 'Plaster', 'Drop Ceiling', 'Concrete', 'Unfinished']
  },
  {
    id: 'foundation-ceiling-structure-inspector-rating',
    category: 'Foundation & Structure',
    subcategory: 'Ceiling Structure',
    item: 'Inspector Overall Rating',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Ceiling Structure Defects
  {
    id: 'foundation-ceiling-structure-sagging',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Ceiling Structure',
    item: 'Ceiling Sagging',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-ceiling-structure-water-stains',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Ceiling Structure',
    item: 'Water Stains/Leaks',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-ceiling-structure-damaged-joists',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Ceiling Structure',
    item: 'Damaged Ceiling Joists',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-ceiling-structure-poor-ventilation',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Ceiling Structure',
    item: 'Poor Ventilation/Air Flow',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'foundation-ceiling-structure-insulation-problems',
    category: 'Foundation & Structure',
    subcategory: 'Defects - Ceiling Structure',
    item: 'Insulation Problems',
    required: false,
    type: 'checkbox'
  },
  // Exterior Cladding General
  {
    id: 'exterior-inspection-method',
    category: 'Exterior Cladding',
    subcategory: 'General',
    item: 'Inspection Method',
    required: false,
    type: 'multiselect',
    options: ['Crawlspace Access', 'Infrared', 'Visual', 'Attic Access']
  },
  // Exterior Cladding Siding, Flashing & Trim
  {
    id: 'exterior-siding-material',
    category: 'Exterior Cladding',
    subcategory: 'Siding, Flashing & Trim',
    item: 'Cladding Material',
    required: false,
    type: 'multiselect',
    options: ['Aluminum', 'Plastic', 'Logs', 'Asbestos', 'Asphalt', 'Brick', 'Concrete', 'Fiber Cement', 'Stucco', 'Brick Veneer', 'Engineered Wood', 'Masonry', 'Metal', 'Vinyl', 'Wood', 'Shingles', 'Stone', 'Stone Veneer']
  },
  {
    id: 'exterior-siding-inspector-rating',
    category: 'Exterior Cladding',
    subcategory: 'Siding, Flashing & Trim',
    item: 'Inspector Overall Rating',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Exterior Cladding Defects - Siding, Flashing & Trim
  {
    id: 'exterior-multiple-layers-siding',
    category: 'Exterior Cladding',
    subcategory: 'Defects - Siding, Flashing & Trim',
    item: 'Multiple Layers of Siding',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'exterior-mildew-algae',
    category: 'Exterior Cladding',
    subcategory: 'Defects - Siding, Flashing & Trim',
    item: 'Mildew/Algae',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'exterior-loose-boards',
    category: 'Exterior Cladding',
    subcategory: 'Defects - Siding, Flashing & Trim',
    item: 'Loose Boards',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'exterior-hail-damage-minor',
    category: 'Exterior Cladding',
    subcategory: 'Defects - Siding, Flashing & Trim',
    item: 'Hail Damage - Minor',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'exterior-hail-damage-major',
    category: 'Exterior Cladding',
    subcategory: 'Defects - Siding, Flashing & Trim',
    item: 'Hail Damage - Major',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'exterior-warping-buckling',
    category: 'Exterior Cladding',
    subcategory: 'Defects - Siding, Flashing & Trim',
    item: 'Warping/Buckling',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'exterior-flashing-trim-improperly-installed',
    category: 'Exterior Cladding',
    subcategory: 'Defects - Siding, Flashing & Trim',
    item: 'Flashing/Trim Improperly Installed',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'exterior-evidence-water-intrusion',
    category: 'Exterior Cladding',
    subcategory: 'Defects - Siding, Flashing & Trim',
    item: 'Evidence of Water Intrusion',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'exterior-cracking-minor',
    category: 'Exterior Cladding',
    subcategory: 'Defects - Siding, Flashing & Trim',
    item: 'Cracking - Minor',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'exterior-cracking-major',
    category: 'Exterior Cladding',
    subcategory: 'Defects - Siding, Flashing & Trim',
    item: 'Cracking - Major',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'exterior-ground-clearance',
    category: 'Exterior Cladding',
    subcategory: 'Defects - Siding, Flashing & Trim',
    item: 'Ground Clearance',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'exterior-splitting',
    category: 'Exterior Cladding',
    subcategory: 'Defects - Siding, Flashing & Trim',
    item: 'Splitting',
    required: false,
    type: 'checkbox'
  },
  // Heating & Cooling - Heating Equipment
  {
    id: 'heating-equipment-type',
    category: 'Heating & Cooling',
    subcategory: 'Heating Equipment',
    item: 'Heating Equipment Type',
    required: false,
    type: 'multiselect',
    options: ['Forced Air', 'Hot Water/Steam', 'Heat Pump', 'Electric Baseboard', 'Radiant Floor', 'Geothermal', 'Solar']
  },
  {
    id: 'heating-equipment-fuel-type',
    category: 'Heating & Cooling',
    subcategory: 'Heating Equipment',
    item: 'Fuel Type',
    required: false,
    type: 'multiselect',
    options: ['Natural Gas', 'Propane', 'Electric', 'Oil', 'Wood', 'Coal', 'Solar']
  },
  {
    id: 'heating-equipment-age',
    category: 'Heating & Cooling',
    subcategory: 'Heating Equipment',
    item: 'Age - Year Installed',
    required: false,
    type: 'year'
  },
  {
    id: 'heating-equipment-inspector-rating',
    category: 'Heating & Cooling',
    subcategory: 'Heating Equipment',
    item: 'Inspector Overall Rating',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Heating Equipment Defects
  {
    id: 'heating-equipment-inadequate-ventilation',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Heating Equipment', 
    item: 'Inadequate Ventilation',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'heating-equipment-filter-dirty',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Heating Equipment',
    item: 'Filter Dirty/Missing',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'heating-equipment-gas-leak',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Heating Equipment',
    item: 'Gas Leak Detected',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'heating-equipment-heat-exchanger-cracked',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Heating Equipment',
    item: 'Heat Exchanger Cracked',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'heating-equipment-improper-installation',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Heating Equipment',
    item: 'Improper Installation',
    required: false,
    type: 'checkbox'
  },
  // Cooling Equipment
  {
    id: 'cooling-equipment-type',
    category: 'Heating & Cooling',
    subcategory: 'Cooling Equipment',
    item: 'Cooling Equipment Type',
    required: false,
    type: 'multiselect',
    options: ['Central Air', 'Heat Pump', 'Window Units', 'Ductless Mini-Split', 'Evaporative Cooler', 'Geothermal']
  },
  {
    id: 'cooling-equipment-age',
    category: 'Heating & Cooling',
    subcategory: 'Cooling Equipment',
    item: 'Age - Year Installed',
    required: false,
    type: 'year'
  },
  {
    id: 'cooling-equipment-inspector-rating',
    category: 'Heating & Cooling',
    subcategory: 'Cooling Equipment',
    item: 'Inspector Overall Rating',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Cooling Equipment Defects
  {
    id: 'cooling-equipment-refrigerant-leak',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Cooling Equipment',
    item: 'Refrigerant Leak',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'cooling-equipment-condenser-dirty',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Cooling Equipment',
    item: 'Condenser Coils Dirty',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'cooling-equipment-inadequate-cooling',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Cooling Equipment',
    item: 'Inadequate Cooling Capacity',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'cooling-equipment-electrical-issues',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Cooling Equipment',
    item: 'Electrical Connection Issues',
    required: false,
    type: 'checkbox'
  },
  // Operating Controls
  {
    id: 'operating-controls-thermostat-type',
    category: 'Heating & Cooling',
    subcategory: 'Operating Controls',
    item: 'Thermostat Type',
    required: false,
    type: 'multiselect',
    options: ['Manual', 'Programmable', 'Smart/WiFi', 'Zone Control', 'Heat Pump Control']
  },
  {
    id: 'operating-controls-inspector-rating',
    category: 'Heating & Cooling',
    subcategory: 'Operating Controls',
    item: 'Inspector Overall Rating',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Operating Controls Defects
  {
    id: 'operating-controls-thermostat-malfunction',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Operating Controls',
    item: 'Thermostat Malfunction',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'operating-controls-wiring-issues',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Operating Controls',
    item: 'Control Wiring Issues',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'operating-controls-improper-calibration',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Operating Controls',
    item: 'Improper Calibration',
    required: false,
    type: 'checkbox'
  },
  // Distribution Systems
  {
    id: 'distribution-systems-ductwork-material',
    category: 'Heating & Cooling',
    subcategory: 'Distribution Systems',
    item: 'Ductwork Material',
    required: false,
    type: 'multiselect',
    options: ['Sheet Metal', 'Flexible Duct', 'Ductboard', 'PVC', 'Cast Iron', 'Copper']
  },
  {
    id: 'distribution-systems-insulation-type',
    category: 'Heating & Cooling',
    subcategory: 'Distribution Systems',
    item: 'Insulation Type',
    required: false,
    type: 'multiselect',
    options: ['Fiberglass', 'Foam Board', 'Spray Foam', 'Cellulose', 'Mineral Wool', 'None']
  },
  {
    id: 'distribution-systems-inspector-rating',
    category: 'Heating & Cooling',
    subcategory: 'Distribution Systems',
    item: 'Inspector Overall Rating',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Distribution Systems Defects
  {
    id: 'distribution-systems-duct-leakage',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Distribution Systems',
    item: 'Duct Leakage',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'distribution-systems-inadequate-insulation',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Distribution Systems',
    item: 'Inadequate Insulation',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'distribution-systems-blocked-returns',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Distribution Systems',
    item: 'Blocked Return Air Vents',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'distribution-systems-improper-sizing',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Distribution Systems',
    item: 'Improper Duct Sizing',
    required: false,
    type: 'checkbox'
  },
  // Vents & Flues
  {
    id: 'vents-flues-material',
    category: 'Heating & Cooling',
    subcategory: 'Vents & Flues',
    item: 'Vent/Flue Material',
    required: false,
    type: 'multiselect',
    options: ['Metal', 'PVC', 'Clay Tile', 'Masonry', 'Stainless Steel', 'Aluminum']
  },
  {
    id: 'vents-flues-inspector-rating',
    category: 'Heating & Cooling',
    subcategory: 'Vents & Flues',
    item: 'Inspector Overall Rating',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
  },
  // Vents & Flues Defects
  {
    id: 'vents-flues-blockage',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Vents & Flues',
    item: 'Vent/Flue Blockage',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'vents-flues-improper-clearance',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Vents & Flues',
    item: 'Improper Clearance',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'vents-flues-damaged-components',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Vents & Flues',
    item: 'Damaged Vent/Flue Components',
    required: false,
    type: 'checkbox'
  },
  {
    id: 'vents-flues-carbon-monoxide-risk',
    category: 'Heating & Cooling',
    subcategory: 'Defects - Vents & Flues',
    item: 'Carbon Monoxide Risk',
    required: false,
    type: 'checkbox'
  },
  // Windows
  {
    id: 'windows-type',
    category: 'Doors & Windows',
    subcategory: 'Windows',
    item: 'Window Type',
    required: false,
    type: 'multiselect',
    options: ['Casement', 'Double-hung', 'Drop-down', 'Single Pane', 'Single-hung', 'Sliders', 'Storm', 'Thermal']
  },
  {
    id: 'windows-manufacturer',
    category: 'Doors & Windows',
    subcategory: 'Windows',
    item: 'Window Manufacturer',
    required: false,
    type: 'multiselect',
    options: ['Andersen', 'JELD-WEN', 'Marvin', 'Milgard', 'Pella', 'WeatherShield']
  },
  {
    id: 'windows-age',
    category: 'Doors & Windows',
    subcategory: 'Windows',
    item: 'Window Age',
    required: false,
    type: 'year'
  },
  {
    id: 'windows-inspector-rating',
    category: 'Doors & Windows',
    subcategory: 'Windows',
    item: 'Inspector Overall Grading',
    required: false,
    type: 'rating',
    options: ['Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected']
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
  const [selectedFoundationSubcategory, setSelectedFoundationSubcategory] = useState<string>('all');
  const [selectedHeatingSubcategory, setSelectedHeatingSubcategory] = useState<string>('all');
  const [selectedDoorsWindowsSubcategory, setSelectedDoorsWindowsSubcategory] = useState<string>('all');

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
                // Color coding for Inspector Overall Grading/Rating
                let colorClasses = '';
                if (item.item.includes('Inspector Overall')) {
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
                    <DropdownMenuItem onClick={() => setSelectedRoofSubcategory('Eaves, Soffits & Fascia')}>
                      Eaves, Soffits & Fascia
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {category === 'Foundation & Structure' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      {selectedFoundationSubcategory === 'all' ? 'All Foundation & Structure Items' : selectedFoundationSubcategory}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border border-border">
                    <DropdownMenuItem onClick={() => setSelectedFoundationSubcategory('all')}>
                      All Foundation & Structure Items
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedFoundationSubcategory('Foundation')}>
                      Foundation
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedFoundationSubcategory('Basement & Crawlspace')}>
                      Basement & Crawlspace
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedFoundationSubcategory('Floor Structure')}>
                      Floor Structure
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedFoundationSubcategory('Wall Structure')}>
                      Wall Structure
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedFoundationSubcategory('Ceiling Structure')}>
                      Ceiling Structure
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {category === 'Heating & Cooling' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      {selectedHeatingSubcategory === 'all' ? 'All Heating & Cooling Items' : selectedHeatingSubcategory}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border border-border">
                    <DropdownMenuItem onClick={() => setSelectedHeatingSubcategory('all')}>
                      All Heating & Cooling Items
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedHeatingSubcategory('Heating Equipment')}>
                      Heating Equipment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedHeatingSubcategory('Cooling Equipment')}>
                      Cooling Equipment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedHeatingSubcategory('Operating Controls')}>
                      Operating Controls
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedHeatingSubcategory('Distribution Systems')}>
                      Distribution Systems
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedHeatingSubcategory('Vents & Flues')}>
                      Vents & Flues
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {category === 'Doors & Windows' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      {selectedDoorsWindowsSubcategory === 'all' ? 'All Doors & Windows Items' : selectedDoorsWindowsSubcategory}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border border-border">
                    <DropdownMenuItem onClick={() => setSelectedDoorsWindowsSubcategory('all')}>
                      All Doors & Windows Items
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedDoorsWindowsSubcategory('Windows')}>
                      Windows
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedDoorsWindowsSubcategory('Entry Doors')}>
                      Entry Doors
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedDoorsWindowsSubcategory('Interior Doors')}>
                      Interior Doors
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedDoorsWindowsSubcategory('Garage Doors')}>
                      Garage Doors
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
                      'Eaves, Soffits & Fascia': ['Eaves, Soffits & Fascia', 'Defects - Eaves, Soffits & Fascia']
                    };
                    
                    const allowedSubcategories = subcategoryMap[selectedRoofSubcategory] || [];
                    return allowedSubcategories.some(sub => 
                      item.subcategory?.includes(sub) || item.subcategory === sub
                    );
                  }
                  if (category === 'Foundation & Structure' && selectedFoundationSubcategory !== 'all') {
                    // Map the dropdown selections to actual subcategories
                    const foundationSubcategoryMap: Record<string, string[]> = {
                      'Foundation': ['Foundation', 'Defects - Foundation'],
                      'Basement & Crawlspace': ['Basement & Crawlspace', 'Defects - Basements & Crawlspaces'],
                      'Floor Structure': ['Floor Structure', 'Defects - Floor Structure'],
                      'Wall Structure': ['Wall Structure', 'Defects - Wall Structure'],
                      'Ceiling Structure': ['Ceiling Structure', 'Defects - Ceiling Structure']
                    };
                    
                    const allowedSubcategories = foundationSubcategoryMap[selectedFoundationSubcategory] || [];
                    return allowedSubcategories.some(sub => 
                      item.subcategory?.includes(sub) || item.subcategory === sub
                    );
                  }
                  if (category === 'Heating & Cooling' && selectedHeatingSubcategory !== 'all') {
                    // Map the dropdown selections to actual subcategories
                    const heatingSubcategoryMap: Record<string, string[]> = {
                      'Heating Equipment': ['Heating Equipment', 'Defects - Heating Equipment'],
                      'Cooling Equipment': ['Cooling Equipment', 'Defects - Cooling Equipment'],
                      'Operating Controls': ['Operating Controls', 'Defects - Operating Controls'],
                      'Distribution Systems': ['Distribution Systems', 'Defects - Distribution Systems'],
                      'Vents & Flues': ['Vents & Flues', 'Defects - Vents & Flues']
                    };
                    
                    const allowedSubcategories = heatingSubcategoryMap[selectedHeatingSubcategory] || [];
                    return allowedSubcategories.some(sub => 
                      item.subcategory?.includes(sub) || item.subcategory === sub
                    );
                  }
                  if (category === 'Doors & Windows' && selectedDoorsWindowsSubcategory !== 'all') {
                    // Map the dropdown selections to actual subcategories
                    const doorsWindowsSubcategoryMap: Record<string, string[]> = {
                      'Windows': ['Windows', 'Defects - Windows'],
                      'Entry Doors': ['Entry Doors', 'Defects - Entry Doors'],
                      'Interior Doors': ['Interior Doors', 'Defects - Interior Doors'],
                      'Garage Doors': ['Garage Doors', 'Defects - Garage Doors']
                    };
                    
                    const allowedSubcategories = doorsWindowsSubcategoryMap[selectedDoorsWindowsSubcategory] || [];
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