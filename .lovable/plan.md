
# Plan: Fix Inspection Report Generation

## Problem Summary

The current inspection report does not follow the checklist structure. Items are grouped only by category (not subcategory), ordered alphabetically instead of following the checklist sequence, and defects are not properly extracted and displayed.

## Requirements

The report must:
1. Follow the exact category/subcategory sequence from the inspection checklist
2. Group items under their respective Categories and Sub-Categories
3. Under each Sub-Category, list only the defects selected by the inspector
4. Display "No defects found" if no defects are selected for a Sub-Category
5. Maintain consistent formatting and professional appearance

---

## Solution Overview

Create a shared category configuration and update both report components to use the proper structure.

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/data/checklistCategoryOrder.ts` | **Create** | Centralized category/subcategory order configuration |
| `src/components/Inspector/InspectionReport.tsx` | **Modify** | Update to use proper category/subcategory structure |
| `src/components/Inspector/InspectionReportPDF.tsx` | **Modify** | Update to use proper category/subcategory structure |

---

## Implementation Details

### Step 1: Create Centralized Category Configuration

Create `src/data/checklistCategoryOrder.ts` with:
- Export `CHECKLIST_CATEGORY_ORDER` - array defining the exact sequence of categories with their subcategories
- Export helper function `getOrderedCategoriesWithDefects()` to organize inspection data

```text
Structure:
[
  {
    id: 'roof',
    label: 'Roof',
    subcategories: [
      { id: 'coverings', label: 'Coverings', defectPrefix: 'Defects - Coverings' },
      { id: 'drainage', label: 'Roof Drainage Systems', defectPrefix: 'Defects - Roof Drainage Systems' },
      ...
    ]
  },
  {
    id: 'exterior',
    label: 'Exterior Cladding',
    subcategories: [...]
  },
  ...
]
```

### Step 2: Update InspectionReport.tsx (Web Preview)

Modify the "Detailed Checklist" section to:

1. Import the category order configuration
2. Group checklist items by category AND subcategory
3. Extract defects from `selected_defects` field (checkbox items that are checked)
4. Display in hierarchical structure:

```text
Category Name
  Sub-Category Name
    - Defect 1
    - Defect 2
    - Defect 3
  Sub-Category Name 2
    - No defects found

Category Name 2
  ...
```

5. Only show categories/subcategories that have data
6. Use `checklist_notes` to show any defect descriptions

### Step 3: Update InspectionReportPDF.tsx (PDF Download)

Apply the same structural changes to the PDF report:

1. Import the category order configuration
2. Update the "Detailed Checklist" page section
3. Use proper page breaks between major categories
4. Maintain consistent styling with the web preview

---

## Technical Details

### Data Sources for Defects

The inspection data contains:
- `selected_defects`: Record of checkbox items that were selected (defect_id -> true)
- `checklist_notes`: Record of notes for each item (item_id -> note text)
- `checklist_items`: Database table with all checklist entries

### Category Matching Logic

Map checklist items to their proper category/subcategory using:
- Item ID prefix (e.g., `roof-` maps to Roof category)
- Subcategory field from the item
- Defect subcategories start with "Defects - "

### Display Logic

For each subcategory:
1. Filter items where `type: 'checkbox'` and item is in `selected_defects`
2. If defects found, display them as a list
3. If no defects found, optionally show "No defects found" or omit the subcategory

---

## UI Changes

### Web Report (InspectionReport.tsx)

**Before:**
```text
Detailed Checklist
  Roof
    - Roof Material: Asphalt
    - Inspector Rating: Good
    - Under-Driven Nails (no indication if selected)
```

**After:**
```text
Detailed Findings by Category

Roof
  Coverings
    Rating: Good
    Defects:
      - Under-Driven Nails
      - Shingles Missing
  
  Roof Drainage Systems
    Rating: Very Good
    Defects:
      - No defects found

Exterior Cladding
  Siding, Flashing & Trim
    Rating: Good
    Defects:
      - Cracking - Minor
```

### PDF Report (InspectionReportPDF.tsx)

Same hierarchical structure with:
- Category headers with page break control
- Subcategory sections
- Defect lists with proper spacing
- Professional formatting

---

## Estimated Changes

- **checklistCategoryOrder.ts**: ~150 lines (new file with all categories/subcategories)
- **InspectionReport.tsx**: ~80 lines modified (checklist section restructure)
- **InspectionReportPDF.tsx**: ~100 lines modified (PDF checklist section restructure)
