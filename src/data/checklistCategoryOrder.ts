/**
 * Centralized category/subcategory order configuration for inspection reports.
 * This ensures reports follow the exact checklist structure.
 */

export interface SubcategoryConfig {
  id: string;
  label: string;
  defectSubcategory?: string; // The subcategory name for defects (e.g., "Defects - Coverings")
}

export interface CategoryConfig {
  id: string;
  label: string;
  subcategories: SubcategoryConfig[];
}

/**
 * Complete ordered list of categories and subcategories matching the inspection checklist.
 */
export const CHECKLIST_CATEGORY_ORDER: CategoryConfig[] = [
  {
    id: 'roof',
    label: 'Roof',
    subcategories: [
      { id: 'inspection-details', label: 'Inspection Details' },
      { id: 'coverings', label: 'Coverings', defectSubcategory: 'Defects - Coverings' },
      { id: 'drainage', label: 'Roof Drainage Systems', defectSubcategory: 'Defects - Roof Drainage Systems' },
      { id: 'flashing', label: 'Flashing', defectSubcategory: 'Defects - Flashing' },
      { id: 'skylights-chimneys', label: 'Skylights & Chimneys', defectSubcategory: 'Defects - Skylights & Chimneys' },
      { id: 'eaves-soffits-fascia', label: 'Eaves, Soffits & Fascia', defectSubcategory: 'Defects - Eaves, Soffits & Fascia' },
    ],
  },
  {
    id: 'exterior',
    label: 'Exterior Cladding',
    subcategories: [
      { id: 'inspection-details', label: 'Inspection Details' },
      { id: 'siding', label: 'Siding, Flashing & Trim', defectSubcategory: 'Defects - Siding, Flashing & Trim' },
    ],
  },
  {
    id: 'walkways',
    label: 'Walkways, Patios & Driveways',
    subcategories: [
      { id: 'general', label: 'General', defectSubcategory: 'Defects' },
    ],
  },
  {
    id: 'decks',
    label: 'Wood Decks & Balconies',
    subcategories: [
      { id: 'deck-balconies', label: 'Deck and Balconies', defectSubcategory: 'Defects - Deck and Balconies' },
    ],
  },
  {
    id: 'foundation',
    label: 'Foundation & Structure',
    subcategories: [
      { id: 'inspection-details', label: 'Inspection Details' },
      { id: 'foundation', label: 'Foundation', defectSubcategory: 'Defects - Foundation' },
      { id: 'crawlspace', label: 'Crawlspace', defectSubcategory: 'Defects - Crawlspace' },
      { id: 'basement', label: 'Basement', defectSubcategory: 'Defects - Basement' },
      { id: 'slab', label: 'Slab', defectSubcategory: 'Defects - Slab' },
      { id: 'floor-structure', label: 'Floor Structure', defectSubcategory: 'Defects - Floor Structure' },
      { id: 'wall-structure', label: 'Wall Structure', defectSubcategory: 'Defects - Wall Structure' },
      { id: 'ceiling-structure', label: 'Ceiling Structure', defectSubcategory: 'Defects - Ceiling Structure' },
      { id: 'roof-structure', label: 'Roof Structure', defectSubcategory: 'Defects - Roof Structure' },
    ],
  },
  {
    id: 'plumbing',
    label: 'Plumbing',
    subcategories: [
      { id: 'inspection-details', label: 'Inspection Details' },
      { id: 'water-supply', label: 'Water Supply', defectSubcategory: 'Defects - Water Supply' },
      { id: 'drain-waste-vent', label: 'Drain, Waste & Vent', defectSubcategory: 'Defects - Drain, Waste & Vent' },
      { id: 'water-heater', label: 'Water Heater', defectSubcategory: 'Defects - Water Heater' },
      { id: 'fixtures', label: 'Fixtures', defectSubcategory: 'Defects - Fixtures' },
    ],
  },
  {
    id: 'electrical',
    label: 'Electrical',
    subcategories: [
      { id: 'inspection-details', label: 'Inspection Details' },
      { id: 'service-entrance', label: 'Service Entrance', defectSubcategory: 'Defects - Service Entrance' },
      { id: 'main-panel', label: 'Main Panel', defectSubcategory: 'Defects - Main Panel' },
      { id: 'sub-panel', label: 'Sub Panel', defectSubcategory: 'Defects - Sub Panel' },
      { id: 'branch-circuits', label: 'Branch Circuits & Wiring', defectSubcategory: 'Defects - Branch Circuits & Wiring' },
    ],
  },
  {
    id: 'hvac',
    label: 'Heating & Cooling',
    subcategories: [
      { id: 'inspection-details', label: 'Inspection Details' },
      { id: 'heating-system', label: 'Heating System', defectSubcategory: 'Defects - Heating System' },
      { id: 'cooling-system', label: 'Cooling System', defectSubcategory: 'Defects - Cooling System' },
      { id: 'ductwork', label: 'Ductwork', defectSubcategory: 'Defects - Ductwork' },
    ],
  },
  {
    id: 'doors-windows',
    label: 'Doors, Windows & Interior',
    subcategories: [
      { id: 'inspection-details', label: 'Inspection Details' },
      { id: 'doors', label: 'Doors', defectSubcategory: 'Defects - Doors' },
      { id: 'windows', label: 'Windows', defectSubcategory: 'Defects - Windows' },
      { id: 'interior', label: 'Interior', defectSubcategory: 'Defects - Interior' },
      { id: 'garage', label: 'Garage', defectSubcategory: 'Defects - Garage' },
    ],
  },
  {
    id: 'appliances',
    label: 'Built-in Appliances',
    subcategories: [
      { id: 'kitchen', label: 'Kitchen Appliances', defectSubcategory: 'Defects - Kitchen Appliances' },
      { id: 'laundry', label: 'Laundry', defectSubcategory: 'Defects - Laundry' },
    ],
  },
  {
    id: 'fireplaces',
    label: 'Fireplaces',
    subcategories: [
      { id: 'fireplace', label: 'Fireplace', defectSubcategory: 'Defects - Fireplace' },
    ],
  },
  {
    id: 'attic',
    label: 'Attic, Insulation & Ventilation',
    subcategories: [
      { id: 'attic', label: 'Attic, Insulation & Ventilation', defectSubcategory: 'Defects - Attic, Insulation & Ventilation' },
    ],
  },
  {
    id: 'green',
    label: 'Green Features',
    subcategories: [
      { id: 'green-features', label: 'Green Features', defectSubcategory: 'Defects - Green Features' },
    ],
  },
  {
    id: 'well',
    label: 'Well',
    subcategories: [
      { id: 'well', label: 'Well', defectSubcategory: 'Defects - Well' },
    ],
  },
  {
    id: 'water-testing',
    label: 'Water Testing',
    subcategories: [
      { id: 'water-testing', label: 'Water Testing' },
    ],
  },
  {
    id: 'radon',
    label: 'Radon',
    subcategories: [
      { id: 'radon', label: 'Radon', defectSubcategory: 'Defects - Radon' },
    ],
  },
  {
    id: 'pool-spa',
    label: 'Swimming Pools and Spas',
    subcategories: [
      { id: 'pool-spa', label: 'Pool & Spa', defectSubcategory: 'Defects - Pool & Spa' },
    ],
  },
  {
    id: 'sewer-lateral',
    label: 'Sewer Lateral',
    subcategories: [
      { id: 'sewer', label: 'Sewer Lateral', defectSubcategory: 'Defects - Sewer Lateral' },
    ],
  },
];

/**
 * Maps category labels to their config for easy lookup
 */
export const CATEGORY_LABEL_MAP: Record<string, CategoryConfig> = CHECKLIST_CATEGORY_ORDER.reduce(
  (acc, cat) => {
    acc[cat.label] = cat;
    return acc;
  },
  {} as Record<string, CategoryConfig>
);

/**
 * Structure for organized report data
 */
export interface ReportSubcategoryData {
  label: string;
  rating?: string;
  defects: { id: string; name: string; notes?: string }[];
  hasData: boolean;
}

export interface ReportCategoryData {
  label: string;
  subcategories: ReportSubcategoryData[];
  hasData: boolean;
}

/**
 * Organizes inspection data following the checklist structure.
 * Extracts ratings from checklist_ratings and defects from selected_defects.
 */
export function getOrderedReportData(
  checklistRatings: Record<string, string> | null,
  selectedDefects: Record<string, boolean> | null,
  checklistNotes: Record<string, string> | null,
  categoryScores: Record<string, { score?: number; grade?: string }> | null
): ReportCategoryData[] {
  const result: ReportCategoryData[] = [];

  for (const category of CHECKLIST_CATEGORY_ORDER) {
    const categoryData: ReportCategoryData = {
      label: category.label,
      subcategories: [],
      hasData: false,
    };

    // Check if this category has any scores
    const hasScore = categoryScores && categoryScores[category.label];

    for (const subcategory of category.subcategories) {
      const subcategoryData: ReportSubcategoryData = {
        label: subcategory.label,
        defects: [],
        hasData: false,
      };

      // Find rating for this subcategory (look for rating items)
      if (checklistRatings) {
        // Look for any rating key that matches this category/subcategory pattern
        const ratingKeys = Object.keys(checklistRatings).filter((key) => {
          const lowerKey = key.toLowerCase();
          const catId = category.id.toLowerCase();
          const subLabel = subcategory.label.toLowerCase().replace(/[^a-z0-9]/g, '');
          return lowerKey.includes(catId) && 
                 (lowerKey.includes('rating') || lowerKey.includes('inspector')) &&
                 (lowerKey.includes(subLabel) || subcategory.label === 'General');
        });

        if (ratingKeys.length > 0) {
          subcategoryData.rating = checklistRatings[ratingKeys[0]];
          subcategoryData.hasData = true;
        }
      }

      // Extract defects for this subcategory
      if (selectedDefects && subcategory.defectSubcategory) {
        const defectKeys = Object.keys(selectedDefects).filter((key) => {
          // Check if defect is selected (value is true)
          if (!selectedDefects[key]) return false;
          
          // Match defects by checking if the key contains the category id
          const lowerKey = key.toLowerCase();
          const catId = category.id.toLowerCase();
          
          return lowerKey.startsWith(catId + '-') || lowerKey.includes(catId);
        });

        for (const defectKey of defectKeys) {
          // Convert key to readable name (e.g., "roof-under-driven-nails" -> "Under-Driven Nails")
          const defectName = defectKey
            .replace(/^[a-z]+-/, '') // Remove category prefix
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          const notes = checklistNotes?.[defectKey];

          subcategoryData.defects.push({
            id: defectKey,
            name: defectName,
            notes,
          });
          subcategoryData.hasData = true;
        }
      }

      // Only add subcategory if it has data
      if (subcategoryData.hasData || subcategoryData.defects.length > 0 || subcategoryData.rating) {
        categoryData.subcategories.push(subcategoryData);
        categoryData.hasData = true;
      }
    }

    // Only add category if it has data or scores
    if (categoryData.hasData || hasScore) {
      result.push(categoryData);
    }
  }

  return result;
}

/**
 * Alternative: Extract defects directly from selected_defects by category prefix mapping
 * Handles both boolean values and other truthy values
 */
export function extractDefectsByCategory(
  selectedDefects: Record<string, unknown> | null,
  checklistNotes: Record<string, string> | null
): Record<string, { name: string; notes?: string }[]> {
  if (!selectedDefects) return {};

  const result: Record<string, { name: string; notes?: string }[]> = {};

  // Comprehensive category prefix mappings - ordered by specificity (longer prefixes first)
  const prefixMappings: { prefix: string; category: string }[] = [
    // Roof
    { prefix: 'roof-gutter', category: 'Roof' },
    { prefix: 'roof-gutters', category: 'Roof' },
    { prefix: 'roof-', category: 'Roof' },
    
    // Exterior Cladding
    { prefix: 'exterior-door', category: 'Doors, Windows & Interior' },
    { prefix: 'exterior-', category: 'Exterior Cladding' },
    { prefix: 'siding-', category: 'Exterior Cladding' },
    
    // Walkways/Patios/Driveways
    { prefix: 'walkways-', category: 'Walkways, Patios & Driveways' },
    { prefix: 'walkway-', category: 'Walkways, Patios & Driveways' },
    { prefix: 'patio-', category: 'Walkways, Patios & Driveways' },
    { prefix: 'driveway-', category: 'Walkways, Patios & Driveways' },
    
    // Wood Decks & Balconies
    { prefix: 'wood-decks-', category: 'Wood Decks & Balconies' },
    { prefix: 'wood-deck-', category: 'Wood Decks & Balconies' },
    { prefix: 'deck-', category: 'Wood Decks & Balconies' },
    { prefix: 'balcony-', category: 'Wood Decks & Balconies' },
    
    // Foundation & Structure
    { prefix: 'foundation-floor-structure', category: 'Foundation & Structure' },
    { prefix: 'foundation-', category: 'Foundation & Structure' },
    { prefix: 'basement-floor-structure', category: 'Foundation & Structure' },
    { prefix: 'basement-floor-joists', category: 'Foundation & Structure' },
    { prefix: 'basement-floor-slab', category: 'Foundation & Structure' },
    { prefix: 'basement-', category: 'Foundation & Structure' },
    { prefix: 'crawlspace-', category: 'Foundation & Structure' },
    { prefix: 'crawl-space-', category: 'Foundation & Structure' },
    { prefix: 'structure-', category: 'Foundation & Structure' },
    { prefix: 'wall-structure-', category: 'Foundation & Structure' },
    { prefix: 'ceiling-structure-', category: 'Foundation & Structure' },
    { prefix: 'roof-structure-', category: 'Foundation & Structure' },
    
    // Plumbing
    { prefix: 'plumbing-water-heater', category: 'Plumbing' },
    { prefix: 'plumbing-', category: 'Plumbing' },
    { prefix: 'water-heater-', category: 'Plumbing' },
    { prefix: 'drain-', category: 'Plumbing' },
    { prefix: 'fixture-', category: 'Plumbing' },
    
    // Electrical
    { prefix: 'electric-service', category: 'Electrical' },
    { prefix: 'electric-', category: 'Electrical' },
    { prefix: 'electrical-', category: 'Electrical' },
    { prefix: 'wiring-', category: 'Electrical' },
    { prefix: 'panel-', category: 'Electrical' },
    
    // Heating & Cooling
    { prefix: 'hvac-cooling', category: 'Heating & Cooling' },
    { prefix: 'hvac-heating', category: 'Heating & Cooling' },
    { prefix: 'hvac-', category: 'Heating & Cooling' },
    { prefix: 'heating-', category: 'Heating & Cooling' },
    { prefix: 'cooling-', category: 'Heating & Cooling' },
    { prefix: 'furnace-', category: 'Heating & Cooling' },
    { prefix: 'air-conditioning-', category: 'Heating & Cooling' },
    { prefix: 'ductwork-', category: 'Heating & Cooling' },
    
    // Doors, Windows & Interior
    { prefix: 'entry-door-', category: 'Doors, Windows & Interior' },
    { prefix: 'interior-door-', category: 'Doors, Windows & Interior' },
    { prefix: 'doors-', category: 'Doors, Windows & Interior' },
    { prefix: 'door-', category: 'Doors, Windows & Interior' },
    { prefix: 'windows-', category: 'Doors, Windows & Interior' },
    { prefix: 'window-', category: 'Doors, Windows & Interior' },
    { prefix: 'interior-floor', category: 'Doors, Windows & Interior' },
    { prefix: 'interior-wall', category: 'Doors, Windows & Interior' },
    { prefix: 'interior-ceiling', category: 'Doors, Windows & Interior' },
    { prefix: 'interior-', category: 'Doors, Windows & Interior' },
    { prefix: 'floors-', category: 'Doors, Windows & Interior' },
    { prefix: 'ceilings-', category: 'Doors, Windows & Interior' },
    { prefix: 'walls-', category: 'Doors, Windows & Interior' },
    { prefix: 'garage-door-', category: 'Doors, Windows & Interior' },
    { prefix: 'garage-', category: 'Doors, Windows & Interior' },
    
    // Built-in Appliances
    { prefix: 'range-oven-cooktop', category: 'Built-in Appliances' },
    { prefix: 'range-', category: 'Built-in Appliances' },
    { prefix: 'oven-', category: 'Built-in Appliances' },
    { prefix: 'cooktop-', category: 'Built-in Appliances' },
    { prefix: 'appliances-', category: 'Built-in Appliances' },
    { prefix: 'appliance-', category: 'Built-in Appliances' },
    { prefix: 'kitchen-', category: 'Built-in Appliances' },
    { prefix: 'dishwasher-', category: 'Built-in Appliances' },
    { prefix: 'disposal-', category: 'Built-in Appliances' },
    { prefix: 'refrigerator-', category: 'Built-in Appliances' },
    { prefix: 'microwave-', category: 'Built-in Appliances' },
    { prefix: 'laundry-', category: 'Built-in Appliances' },
    { prefix: 'washer-', category: 'Built-in Appliances' },
    { prefix: 'dryer-', category: 'Built-in Appliances' },
    { prefix: 'exhaust-', category: 'Built-in Appliances' },
    
    // Fireplaces
    { prefix: 'fireplace-', category: 'Fireplaces' },
    
    // Attic, Insulation & Ventilation
    { prefix: 'attic-', category: 'Attic, Insulation & Ventilation' },
    { prefix: 'insulation-', category: 'Attic, Insulation & Ventilation' },
    { prefix: 'ventilation-', category: 'Attic, Insulation & Ventilation' },
    
    // Green Features
    { prefix: 'green-', category: 'Green Features' },
    { prefix: 'solar-', category: 'Green Features' },
    { prefix: 'energy-', category: 'Green Features' },
    
    // Well
    { prefix: 'well-', category: 'Well' },
    
    // Water Testing
    { prefix: 'water-testing-', category: 'Water Testing' },
    
    // Radon
    { prefix: 'radon-', category: 'Radon' },
    
    // Swimming Pools and Spas
    { prefix: 'pool-', category: 'Swimming Pools and Spas' },
    { prefix: 'spa-', category: 'Swimming Pools and Spas' },
    { prefix: 'swimming-', category: 'Swimming Pools and Spas' },
    
    // Sewer Lateral
    { prefix: 'sewer-', category: 'Sewer Lateral' },
  ];

  for (const [defectId, isSelected] of Object.entries(selectedDefects)) {
    // Check if defect is selected (truthy value - could be boolean true or other truthy values)
    if (!isSelected) continue;

    // Find matching category using ordered prefix list (first match wins due to specificity order)
    let category = 'Other';
    const lowerDefectId = defectId.toLowerCase();
    
    for (const mapping of prefixMappings) {
      if (lowerDefectId.startsWith(mapping.prefix)) {
        category = mapping.category;
        break;
      }
    }

    if (!result[category]) {
      result[category] = [];
    }

    // Convert ID to readable name - remove the category prefix
    const defectName = formatDefectName(defectId);

    result[category].push({
      name: defectName,
      notes: checklistNotes?.[defectId],
    });
  }

  return result;
}

/**
 * Formats a defect ID into a human-readable name
 * e.g., "roof-under-driven-nails" -> "Under Driven Nails"
 * e.g., "range-oven-cooktop-missing-control-knobs" -> "Missing Control Knobs"
 */
function formatDefectName(defectId: string): string {
  // Common category prefixes to remove (ordered by length/specificity)
  const prefixesToRemove = [
    'range-oven-cooktop-',
    'foundation-floor-structure-',
    'basement-floor-structure-',
    'hvac-cooling-',
    'hvac-heating-',
    'electric-service-',
    'entry-door-',
    'interior-door-',
    'exterior-door-',
    'garage-door-',
    'water-heater-',
    'walkways-walkway-',
    'basement-floor-',
    'interior-floor-',
    'roof-gutter-',
    'roof-gutters-',
    'wood-deck-',
    'basement-',
    'crawlspace-',
    'foundation-',
    'plumbing-',
    'electric-',
    'electrical-',
    'heating-',
    'cooling-',
    'exterior-',
    'interior-',
    'walkways-',
    'fireplace-',
    'floors-',
    'ceilings-',
    'walls-',
    'attic-',
    'doors-',
    'windows-',
    'garage-',
    'hvac-',
    'roof-',
    'pool-',
    'spa-',
    'well-',
    'radon-',
    'sewer-',
    'green-',
  ];

  let cleanId = defectId.toLowerCase();
  
  // Remove the longest matching prefix
  for (const prefix of prefixesToRemove) {
    if (cleanId.startsWith(prefix)) {
      cleanId = cleanId.substring(prefix.length);
      break;
    }
  }

  // Convert remaining kebab-case to Title Case
  return cleanId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
