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

  // Category prefix mappings
  const prefixMap: Record<string, string> = {
    'roof-': 'Roof',
    'exterior-': 'Exterior Cladding',
    'walkways-': 'Walkways, Patios & Driveways',
    'wood-decks-': 'Wood Decks & Balconies',
    'foundation-': 'Foundation & Structure',
    'basement-': 'Foundation & Structure',
    'crawlspace-': 'Foundation & Structure',
    'plumbing-': 'Plumbing',
    'electric-': 'Electrical',
    'electrical-': 'Electrical',
    'hvac-': 'Heating & Cooling',
    'heating-': 'Heating & Cooling',
    'cooling-': 'Heating & Cooling',
    'doors-': 'Doors, Windows & Interior',
    'windows-': 'Doors, Windows & Interior',
    'interior-': 'Doors, Windows & Interior',
    'garage-': 'Doors, Windows & Interior',
    'appliances-': 'Built-in Appliances',
    'kitchen-': 'Built-in Appliances',
    'laundry-': 'Built-in Appliances',
    'fireplace-': 'Fireplaces',
    'attic-': 'Attic, Insulation & Ventilation',
    'green-': 'Green Features',
    'well-': 'Well',
    'water-': 'Water Testing',
    'radon-': 'Radon',
    'pool-': 'Swimming Pools and Spas',
    'spa-': 'Swimming Pools and Spas',
    'sewer-': 'Sewer Lateral',
  };

  for (const [defectId, isSelected] of Object.entries(selectedDefects)) {
    // Check if defect is selected (truthy value - could be boolean true or other truthy values)
    if (!isSelected) continue;

    // Find matching category
    let category = 'Other';
    for (const [prefix, catName] of Object.entries(prefixMap)) {
      if (defectId.toLowerCase().startsWith(prefix)) {
        category = catName;
        break;
      }
    }

    if (!result[category]) {
      result[category] = [];
    }

    // Convert ID to readable name
    const defectName = defectId
      .replace(/^[a-z]+-[a-z]*-?/, '') // Remove category prefix more aggressively
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    result[category].push({
      name: defectName || defectId,
      notes: checklistNotes?.[defectId],
    });
  }

  return result;
}
