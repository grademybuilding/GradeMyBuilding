// Missing defect items from XLSX file - organized by category and subcategory
// These items have commentText from the original data
// IMPORTANT: Category and subcategory names MUST match exactly with ChecklistCategoryContent.tsx

export interface MissingDefectItem {
  id: string;
  category: string;
  subcategory: string;
  item: string;
  required: boolean;
  type: 'checkbox' | 'info' | 'multiselect' | 'number';
  options?: string[];
  commentText?: string;
}

const CATEGORY_ALIASES: Record<string, string> = {
  // Ensure category names match exactly with the canonical checklist data
  "Basement, Foundation and Crawlspace": "Foundation & Structure",
  "Heating and Cooling": "Heating & Cooling",
  "Electrical": "Electric",
  "Doors, Windows & Interior": "Doors & Windows",
  "Cooking Area": "Built-in Appliances",
  "Exterior": "Exterior Cladding",
};

const normalizeMissingDefectItem = (item: MissingDefectItem): MissingDefectItem => ({
  ...item,
  category: CATEGORY_ALIASES[item.category] ?? item.category,
});

export const missingChecklistDefectsRaw: MissingDefectItem[] = [
  // ============== ROOF ==============
  // Roof - Defects - Flashing
  { id: 'roof-flashings-corroded-severe', category: 'Roof', subcategory: 'Defects - Flashing', item: 'Corroded - Severe', required: false, type: 'checkbox', commentText: 'Roof flashing showed signs of severe corrosion, which can lead to moisture intrusion and/or mold. Recommend a qualified roofing contractor evaluate and repair.' },
  { id: 'roof-flashings-corroded-minor', category: 'Roof', subcategory: 'Defects - Flashing', item: 'Corroded - Minor', required: false, type: 'checkbox', commentText: 'Roof flashing showed signs of corrosion, but are still in working condition. Flashing should be monitored to prevent severe corrosion leading to moisture intrusion.' },

  // Roof - Defects - Roof Structure & Attic (FROM XLSX)
  { id: 'roof-structure-thin-soft-sheathing', category: 'Roof', subcategory: 'Defects - Roof Structure & Attic', item: 'Thin/Soft Sheathing', required: false, type: 'checkbox', commentText: 'Roof sheathing appears to be soft/thin in certain areas. This can be from decay in the underlying wood panels & structure. Recommend further examination by a qualified roofer.' },
  { id: 'roof-structure-sagging', category: 'Roof', subcategory: 'Defects - Roof Structure & Attic', item: 'Sagging', required: false, type: 'checkbox', commentText: 'Areas of the roof sagged, indicating sheathing or rafter deficiencies. Recommend a qualified roofer evaluate and repair.' },

  // ============== EXTERIOR ==============
  // Exterior - Defects - Exterior Doors
  { id: 'exterior-door-sliding-failed-seal', category: 'Exterior Cladding', subcategory: 'Defects - Exterior Doors', item: 'Sliding Glass Door - Failed Seal', required: false, type: 'checkbox', commentText: 'The sliding glass door had double-pane glazing in which condensation was visible. This indicates a loss of thermal integrity. The door should be repaired or replaced as necessary by a qualified contractor. Replacement is more typical.' },
  { id: 'exterior-door-paint-refinish-needed', category: 'Exterior Cladding', subcategory: 'Defects - Exterior Doors', item: 'Paint/Refinish Needed', required: false, type: 'checkbox', commentText: 'Door finish is worn. Recommend refinish and/or paint to maximize service life.' },
  { id: 'exterior-door-loose-hinge', category: 'Exterior Cladding', subcategory: 'Defects - Exterior Doors', item: 'Loose Hinge', required: false, type: 'checkbox', commentText: 'Loose hinges were observed on exterior door. Recommend hinges be tightened.' },
  { id: 'exterior-door-weatherstripping-missing', category: 'Exterior Cladding', subcategory: 'Defects - Exterior Doors', item: 'Weatherstripping Not Present', required: false, type: 'checkbox', commentText: 'Door is missing standard weatherstripping. This can result in significant energy loss and moisture intrusion. Recommend installation of standard weatherstripping.' },
  { id: 'exterior-door-hardware-damaged', category: 'Exterior Cladding', subcategory: 'Defects - Exterior Doors', item: 'Hardware Damaged', required: false, type: 'checkbox', commentText: 'One or more pieces of door hardware are damaged. Recommend repair or replace.' },
  { id: 'exterior-door-sill-trim', category: 'Exterior Cladding', subcategory: 'Defects - Exterior Doors', item: 'Door Sill/Trim', required: false, type: 'checkbox', commentText: 'Door sill and/or trim is loose, deteriorated or worn and repair or replacement should be considered.' },
  { id: 'exterior-door-not-close-latch', category: 'Exterior Cladding', subcategory: 'Defects - Exterior Doors', item: 'Door Does Not Close or Latch', required: false, type: 'checkbox', commentText: 'Door does not close or latch properly. Recommend qualified handyman adjust strike plate and/or lock.' },
  { id: 'exterior-door-hardware-missing', category: 'Exterior Cladding', subcategory: 'Defects - Exterior Doors', item: 'Hardware Missing', required: false, type: 'checkbox', commentText: 'Door is missing one or more pieces of hardware. Recommend replacing or upgrading.' },

  // Exterior - Defects - Vegetation, Grading, Drainage & Retaining Walls
  { id: 'exterior-tree-overhang', category: 'Exterior Cladding', subcategory: 'Defects - Vegetation & Grading', item: 'Tree Overhang', required: false, type: 'checkbox', commentText: 'Trees observed overhanging the roof. This can cause damage to the roof and prevent proper drainage. Recommend a qualified tree service trim to allow for proper drainage.' },
  { id: 'exterior-tree-debris-on-roof', category: 'Exterior Cladding', subcategory: 'Defects - Vegetation & Grading', item: 'Tree Debris on Roof', required: false, type: 'checkbox', commentText: 'Tree debris observed on roof. This can cause improper drainage to gutters and downspouts. Recommend clearing debris.' },
  { id: 'exterior-standing-water', category: 'Exterior Cladding', subcategory: 'Defects - Vegetation & Grading', item: 'Standing Water', required: false, type: 'checkbox', commentText: 'Standing water observed, which could indicate poor drainage and/or grading. Recommend monitor and/or have landscaper correct.' },
  { id: 'exterior-retaining-wall-cracks', category: 'Exterior Cladding', subcategory: 'Defects - Vegetation & Grading', item: 'Retaining Wall Cracks', required: false, type: 'checkbox', commentText: 'Retaining wall is showing signs of failing. Recommend qualified contractor evaluate and repair.' },
  { id: 'exterior-negative-grading', category: 'Exterior Cladding', subcategory: 'Defects - Vegetation & Grading', item: 'Negative Grading', required: false, type: 'checkbox', commentText: 'Grading is sloping towards the home in some areas. This could lead to water intrusion and foundation issues. Recommend qualified landscaper or foundation contractor regrade so water flows away from home.' },

  // ============== FOUNDATION & STRUCTURE ==============
  // Basements & Crawlspaces - Defects (FROM XLSX)
  { id: 'basement-high-moisture-levels', category: 'Foundation & Structure', subcategory: 'Defects - Basements & Crawlspaces', item: 'High Moisture Levels', required: false, type: 'checkbox', commentText: 'High levels of moisture were noted in areas of the basement. Recommend monitoring and finding source of moisture intrusion to prevent damage to structure.' },
  { id: 'basement-efflorescence', category: 'Foundation & Structure', subcategory: 'Defects - Basements & Crawlspaces', item: 'Efflorescence', required: false, type: 'checkbox', commentText: 'Efflorescence noted on the crawlspace surface. This a white, powdery deposit that is consistent with moisture intrusion. This can compromise the soil\'s ability to support the home structure and/or lead to mold growth. Recommend a qualified contractor identify source or moisture and correct.' },

  // Floor Structure - Defects (FROM XLSX)
  { id: 'basement-floor-evidence-structural-damage', category: 'Foundation & Structure', subcategory: 'Defects - Floor Structure', item: 'Evidence of Structural Damage', required: false, type: 'checkbox', commentText: 'Structural damage was observed in the underlying floor structure. Recommend a structural engineer evaluate.' },
  { id: 'basement-floor-mold', category: 'Foundation & Structure', subcategory: 'Defects - Floor Structure', item: 'Mold', required: false, type: 'checkbox', commentText: 'Observed signs of mold in one or more areas in the flooring structure. Recommend identifying source or moisture intrusion and sending samples to a lab for testing.' },
  { id: 'basement-floor-slab-shifting-cracking', category: 'Foundation & Structure', subcategory: 'Defects - Floor Structure', item: 'Concrete Slab Shifting/Cracking', required: false, type: 'checkbox', commentText: 'Concrete slab was found to be shifting/cracking at the floor structure. This can be caused by moisture intrusion and/or soil movement. Recommend a structural engineer evaluate and repair to preserve structural integrity of the home.' },
  { id: 'basement-floor-joists-need-repair', category: 'Foundation & Structure', subcategory: 'Defects - Floor Structure', item: 'Joists Need Repair', required: false, type: 'checkbox', commentText: 'One or more floor joists were damaged or improperly installed. This can cause damage to the structural integrity of the home. Recommend a qualified structural engineer evaluate and advise on how to correct.' },
  { id: 'basement-floor-evidence-water-intrusion', category: 'Foundation & Structure', subcategory: 'Defects - Floor Structure', item: 'Evidence of Water Intrusion', required: false, type: 'checkbox', commentText: 'There were signs of water intrusion in the underlying floor structure. Recommend identifying source of moisture and repairing.' },

  // Wall Structure - Defects (FROM XLSX)
  { id: 'basement-wall-mold', category: 'Foundation & Structure', subcategory: 'Defects - Wall Structure', item: 'Mold', required: false, type: 'checkbox', commentText: 'Observed signs of mold in one or more areas in the wall structure. Recommend identifying source or moisture intrusion and sending samples to a lab for testing.' },
  { id: 'basement-wall-evidence-water-intrusion', category: 'Foundation & Structure', subcategory: 'Defects - Wall Structure', item: 'Evidence of Water Intrusion', required: false, type: 'checkbox', commentText: 'Wall structure showed signs of water intrusion, which could lead to more serious structural damage. Recommend a qualified contractor identify source or moisture and remedy.' },
  { id: 'basement-wall-evidence-structural-damage', category: 'Foundation & Structure', subcategory: 'Defects - Wall Structure', item: 'Evidence of Structural Damage', required: false, type: 'checkbox', commentText: 'Evidence of structural damage was found in the wall structure. Recommend a structural engineer evaluate and advise on how to repair.' },
  { id: 'basement-wall-cracks-minor', category: 'Foundation & Structure', subcategory: 'Defects - Wall Structure', item: 'Cracks - Minor', required: false, type: 'checkbox', commentText: 'Minor cracking was observed in wall structure. This is common in homes this age. Recommend monitoring.' },
  { id: 'basement-wall-cracks-major', category: 'Foundation & Structure', subcategory: 'Defects - Wall Structure', item: 'Cracks - Major', required: false, type: 'checkbox', commentText: 'Major cracking observed in wall structure. This could be from moisture intrusion at the structure and/or soil movement. Recommend a qualified structural engineer evaluate and advise on course of action.' },

  // Ceiling Structure - Defects (FROM XLSX)
  { id: 'basement-ceiling-mold', category: 'Foundation & Structure', subcategory: 'Defects - Ceiling Structure', item: 'Mold', required: false, type: 'checkbox', commentText: 'Observed signs of mold in one or more areas in the ceiling structure. Recommend identifying source or moisture intrusion and sending samples to a lab for testing.' },
  { id: 'basement-ceiling-evidence-water-intrusion', category: 'Foundation & Structure', subcategory: 'Defects - Ceiling Structure', item: 'Evidence of Water Intrusion', required: false, type: 'checkbox', commentText: 'Ceiling structure showed signs of water intrusion, which could lead to more serious structural damage. Recommend a qualified contractor identify source or moisture and remedy.' },
  { id: 'basement-ceiling-evidence-structural-damage', category: 'Foundation & Structure', subcategory: 'Defects - Ceiling Structure', item: 'Evidence of Structural Damage', required: false, type: 'checkbox', commentText: 'Evidence of structural damage was found in the ceiling structure. Recommend a structural engineer evaluate and advise on how to repair.' },

  // ============== HEATING & COOLING ==============
  // Heating Equipment - Defects (FROM XLSX)
  { id: 'heating-equipment-blower-excessive-noise', category: 'Heating & Cooling', subcategory: 'Defects - Heating Equipment', item: 'Blower - Excessive Noise', required: false, type: 'checkbox', commentText: 'Furnace blower was excessively noisy during operation. Recommend a qualified HVAC technician evaluate and repair.' },
  { id: 'heating-equipment-corrosion', category: 'Heating & Cooling', subcategory: 'Defects - Heating Equipment', item: 'Corrosion', required: false, type: 'checkbox', commentText: 'Furnace was corroded in one or more areas. This could be the result of improper venting, which the source would need to be identified. Recommend a HVAC contractor evaluate and repair.' },
  { id: 'heating-equipment-inoperable', category: 'Heating & Cooling', subcategory: 'Defects - Heating Equipment', item: 'Inoperable', required: false, type: 'checkbox', commentText: 'Heating element was inoperable at time of inspection. Recommend qualified HVAC professional evaluate & ensure functionality.' },
  { id: 'heating-equipment-manifold-dirty', category: 'Heating & Cooling', subcategory: 'Defects - Heating Equipment', item: 'Manifold Dirty', required: false, type: 'checkbox', commentText: 'Manifold was dirty. Cleaning manifolds will result in better air quality.' },
  { id: 'heating-equipment-needs-servicing', category: 'Heating & Cooling', subcategory: 'Defects - Heating Equipment', item: 'Needs Servicing/Cleaning', required: false, type: 'checkbox', commentText: 'Furnace should be cleaned and serviced annually. Recommend a qualified HVAC contractor clean, service and certify furnace.' },

  // Distribution Systems - Defects (FROM XLSX)
  { id: 'hvac-return-air-missing', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Return Air System Missing/Insufficient', required: false, type: 'checkbox', commentText: 'Return air registers were missing or insufficient. This can result in poor heating efficiency. Recommend a qualified HVAC contractor evaluate and remedy.' },
  { id: 'hvac-radiator-damaged', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Radiator Damaged', required: false, type: 'checkbox', commentText: 'The radiator is damaged and will not function properly. Recommend that a licensed plumber replace or repair the radiator.' },
  { id: 'hvac-ducts-not-sealed', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Ducts Not Sealed', required: false, type: 'checkbox', commentText: 'Air supply ducts were not properly sealed. Recommend a qualified HVAC contractor seal supply and return ducts for maximum efficiency.' },
  { id: 'hvac-duct-damaged', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Duct Damaged', required: false, type: 'checkbox', commentText: 'Air supply duct was damaged. Recommend a qualified HVAC contractor repair.' },
  { id: 'hvac-joint-disconnected', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Joint Disconnected', required: false, type: 'checkbox', commentText: 'There are disconnected joints in the ductwork, resulting in significant energy loss. Recommend licensed HVAC contractor repair or replace.' },
  { id: 'hvac-ducts-uninsulated', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Ducts Uninsulated', required: false, type: 'checkbox', commentText: 'Ducts are not insulated, resulting in energy loss. Recommend licensed HVAC contractor insulate ducts.' },
  { id: 'hvac-ducts-partially-uninsulated', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Ducts Partially Uninsulated', required: false, type: 'checkbox', commentText: 'Parts of the ductwork are uninsulated, resulting in energy loss. Recommend licensed HVAC contractor insulate.' },
  { id: 'hvac-loose-connection', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Loose Connection', required: false, type: 'checkbox', commentText: 'There are loose connections on ducts, resulting in energy loss. Recommend licensed HVAC contractor resecure.' },
  { id: 'hvac-ducts-deteriorated', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Ducts Deteriorated', required: false, type: 'checkbox', commentText: 'Deteriorated ducts were observed. Recommend licensed HVAC contractor repair or replace.' },
  { id: 'hvac-ducts-dented', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Ducts Dented', required: false, type: 'checkbox', commentText: 'There is denting in one or more areas of ductwork. This does not appear to affect air flow. Recommend licensed HVAC contractor repair.' },
  { id: 'hvac-cold-air-return-leaking', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Cold Air Return Leaking', required: false, type: 'checkbox', commentText: 'The cold air return is leaking at the unit. Recommend licensed HVAC contractor seal or patch ductwork.' },
  { id: 'hvac-ducts-heavily-dented', category: 'Heating & Cooling', subcategory: 'Defects - Distribution Systems', item: 'Ducts Heavily Dented', required: false, type: 'checkbox', commentText: 'There is major denting in one or more areas of ductwork restricting air flow. Recommend licensed HVAC contractor repair or replace.' },

  // Vents & Flues - Defects (FROM XLSX)
  { id: 'hvac-flue-vents-to-chimney', category: 'Heating & Cooling', subcategory: 'Defects - Vents & Flues', item: 'Flue Vents to Chimney', required: false, type: 'checkbox', commentText: 'Exhaust flue from furnace vents into chimney that had insufficient flue liner. Recommend a qualified HVAC contractor correct this to prevent chimney from deteriorating.' },
  { id: 'hvac-flue-improperly-installed', category: 'Heating & Cooling', subcategory: 'Defects - Vents & Flues', item: 'Flue Improperly Installed', required: false, type: 'checkbox', commentText: 'Exhaust flue was improperly installed. Recommend a qualified HVAC contractor evaluate and repair.' },
  { id: 'hvac-chimney-structure-unstable', category: 'Heating & Cooling', subcategory: 'Defects - Vents & Flues', item: 'Chimney Structure Unstable', required: false, type: 'checkbox', commentText: 'Chimney appears to have structural damage. Recommend a structural engineer evaluate & repair.' },
  { id: 'hvac-chimney-liner-dirty', category: 'Heating & Cooling', subcategory: 'Defects - Vents & Flues', item: 'Chimney Liner Dirty', required: false, type: 'checkbox', commentText: 'Chimney liner had layer of creosote dust, so underlying structure couldn\'t be inspected for cracks. Recommend qualified chimney sweep company inspect and/or clean.' },

  // Cooling Equipment - Info/Limit items (FROM XLSX)
  { id: 'hvac-cooling-location', category: 'Heating & Cooling', subcategory: 'Cooling Equipment', item: 'Location', required: false, type: 'multiselect', options: ['Exterior East', 'Exterior North', 'Exterior South', 'Exterior West', 'Patio Area', 'Roof'] },
  { id: 'hvac-cooling-seer-rating', category: 'Heating & Cooling', subcategory: 'Cooling Equipment', item: 'SEER Rating', required: false, type: 'number', commentText: 'Modern standards call for at least 13 SEER rating for new install.' },

  // Cooling Equipment - Defects (FROM XLSX)
  { id: 'hvac-cooling-swamp-cooler-draining', category: 'Heating & Cooling', subcategory: 'Defects - Cooling Equipment', item: 'Swamp Cooler Needs Draining', required: false, type: 'checkbox', commentText: 'Swamp cooler needs draining to prevent freeze damage and unhealthy indoor air quality. Recommend a qualified HVAC contractor drain and service before winter.' },
  { id: 'hvac-cooling-power-shut-off', category: 'Heating & Cooling', subcategory: 'Defects - Cooling Equipment', item: 'Power Shut Off', required: false, type: 'checkbox', commentText: 'Condensing unit can be damaged when operated immediately after power is restored. Recommend power be restored for at least 4 hours and unit evaluated by licensed HVAC contractor.' },
  { id: 'hvac-cooling-low-temperature', category: 'Heating & Cooling', subcategory: 'Defects - Cooling Equipment', item: 'Low Temperature', required: false, type: 'info', commentText: 'The A/C unit was not tested due to low outdoor temperature. This may cause damage the unit.' },
  { id: 'hvac-cooling-vegetation-too-close', category: 'Heating & Cooling', subcategory: 'Defects - Cooling Equipment', item: 'Vegetation Too Close', required: false, type: 'checkbox', commentText: 'Vegetation was too close to the compressor, which can limit heat dissipation and limit effectiveness. Recommend cutting back vegetation to avoid overheating compressor.' },
  { id: 'hvac-cooling-failed-produce-cold-air', category: 'Heating & Cooling', subcategory: 'Defects - Cooling Equipment', item: 'Failed to Produce Cold Air', required: false, type: 'checkbox', commentText: 'The air conditioner was functional but did not produce cold air. Recommend licensed HVAC contractor evaluate.' },
  { id: 'hvac-cooling-condensate-tube-damaged', category: 'Heating & Cooling', subcategory: 'Defects - Cooling Equipment', item: 'Condensate Tube Damaged', required: false, type: 'checkbox', commentText: 'Condensate tube was damaged, which limits safe discharge of condensation produced by evaporator coils. Recommend a qualified HVAC technician repair.' },
  { id: 'hvac-cooling-air-flow-restricted', category: 'Heating & Cooling', subcategory: 'Defects - Cooling Equipment', item: 'Air Flow Restricted', required: false, type: 'checkbox', commentText: 'Air flow to the air conditioner condenser was restricted. This may result in inefficient operation. Recommend cleaning dirt and/or debris from unit.' },
  { id: 'hvac-cooling-insulation-missing-damaged', category: 'Heating & Cooling', subcategory: 'Defects - Cooling Equipment', item: 'Insulation Missing or Damaged', required: false, type: 'checkbox', commentText: 'Missing or damaged insulation on refrigerant line can cause energy loss and condensation.' },
  { id: 'hvac-cooling-unusually-noisy', category: 'Heating & Cooling', subcategory: 'Defects - Cooling Equipment', item: 'Unusually Noisy', required: false, type: 'checkbox', commentText: 'Compressor started and operated but unit was unusually noisy. Recommend licensed HVAC contractor evaluate.' },
  { id: 'hvac-cooling-unit-not-level', category: 'Heating & Cooling', subcategory: 'Defects - Cooling Equipment', item: 'Unit Not Level', required: false, type: 'checkbox', commentText: 'Concrete pad supporting the outdoor condensing unit is not level. This can cause accelerated deterioration of components. Recommend licensed HVAC contractor level the unit.' },

  // Operating Controls - Defects (FROM XLSX)
  { id: 'hvac-thermostat-loose', category: 'Heating & Cooling', subcategory: 'Defects - Operating Controls', item: 'Loose Thermostat', required: false, type: 'checkbox', commentText: 'Thermostat was loose. Recommend repair or replacement.' },

  // ============== PLUMBING ==============
  // Water Supply - Defects (Main Water Shut-off Device) (FROM XLSX)
  { id: 'plumbing-main-shutoff-corrosion', category: 'Plumbing', subcategory: 'Defects', item: 'Main Shut-off Corrosion', required: false, type: 'checkbox', commentText: 'Water main shut-off shows signs of corrosion. Recommend a qualified plumber evaluate.' },

  // Drain Waste Vent - Defects (FROM XLSX)
  { id: 'plumbing-sink-poor-drainage', category: 'Plumbing', subcategory: 'Defects', item: 'Sink - Poor Drainage', required: false, type: 'checkbox', commentText: 'Sink had slow/poor drainage. Recommend a qualified plumber repair.' },
  { id: 'plumbing-shower-poor-drainage', category: 'Plumbing', subcategory: 'Defects', item: 'Shower - Poor Drainage', required: false, type: 'checkbox', commentText: 'Shower had slow/poor drainage. Recommend a qualified plumber repair.' },
  { id: 'plumbing-leaking-pipe', category: 'Plumbing', subcategory: 'Defects', item: 'Leaking Pipe', required: false, type: 'checkbox', commentText: 'A drain, waste and/or vent pipe showed signs of a leak. Recommend a qualified plumber evaluate and repair.' },
  { id: 'plumbing-improper-connection', category: 'Plumbing', subcategory: 'Defects', item: 'Improper Connection', required: false, type: 'checkbox', commentText: 'An improper connection was observed at a drain, waste or vent pipe. Recommend a qualified plumber evaluate and repair.' },

  // Water Supply & Distribution - Defects (FROM XLSX)
  { id: 'plumbing-toilet-leaking', category: 'Plumbing', subcategory: 'Defects', item: 'Toilet Leaking', required: false, type: 'checkbox', commentText: 'Toilet is loose and/or leaking at the base. Recommend a qualified plumber evaluate and repair to prevent further water damage.' },
  { id: 'plumbing-distribution-pipe-leaking', category: 'Plumbing', subcategory: 'Defects', item: 'Distribution Pipe Leaking', required: false, type: 'checkbox', commentText: 'Distribution pipe was leaking. Recommend a qualified plumber evaluate and repair.' },
  { id: 'plumbing-improper-installation', category: 'Plumbing', subcategory: 'Defects', item: 'Improper Installation', required: false, type: 'checkbox', commentText: 'Distribution pipes were installed in a sub-standard way. Recommend a qualified plumber evaluate and properly fit and install pipes.' },
  { id: 'plumbing-main-supply-pipe-corroded', category: 'Plumbing', subcategory: 'Defects', item: 'Main Water Supply Pipe Corroded', required: false, type: 'checkbox', commentText: 'Main water supply pipe was heavily corroded. This can lead to shortened lifespan of the pipe. Recommend a qualified plumber repair.' },
  { id: 'plumbing-main-supply-valve-leaking', category: 'Plumbing', subcategory: 'Defects', item: 'Main Water Supply Valve Leaking', required: false, type: 'checkbox', commentText: 'Main water supply shut-off valve was leaking. Recommend a qualified plumber evaluate and repair.' },
  { id: 'plumbing-no-protective-sleeve', category: 'Plumbing', subcategory: 'Defects', item: 'No Protective Sleeve', required: false, type: 'checkbox', commentText: 'Main water supply pipe was missing protective sleeve, which prevents corrosion and extends lifespan. Recommend a qualified plumber install protective sleeve.' },
  { id: 'plumbing-polybutylene-pipes', category: 'Plumbing', subcategory: 'Defects', item: 'Polybutylene Supply Pipes', required: false, type: 'checkbox', commentText: 'Water supply pipes were made from polybutylene material. This material can be prone to fail without warning, causing damage to the home structure. Recommend a qualified plumber replace pipes and fittings with an approved material like PEX.' },

  // Water Heater - Defects (FROM XLSX)
  { id: 'plumbing-water-heater-near-end-life', category: 'Plumbing', subcategory: 'Defects', item: 'Water Heater Near End of Life', required: false, type: 'checkbox', commentText: 'Water heater showed normal signs of wear and tear. Recommend monitoring it\'s effectiveness and replacing in the near future.' },
  { id: 'plumbing-water-heater-irregular-flame', category: 'Plumbing', subcategory: 'Defects', item: 'Water Heater Irregular Flame', required: false, type: 'checkbox', commentText: 'Water heater flame is irregular. Recommend qualified plumber evaluate & repair.' },
  { id: 'plumbing-water-heater-insufficient-capacity', category: 'Plumbing', subcategory: 'Defects', item: 'Water Heater Insufficient Capacity', required: false, type: 'checkbox', commentText: 'Water heater may not have the capacity necessary to supply sufficient water to the home. Recommend evaluating options to replace water heater with a larger capacity tank.' },
  { id: 'plumbing-water-heater-water-stains-leakage', category: 'Plumbing', subcategory: 'Defects', item: 'Water Heater Water Stains/Leakage', required: false, type: 'checkbox', commentText: 'Water stains were observed beneath water heater, indicating a past or present leak. Recommend further evaluation and repair by a qualified plumber.' },
  { id: 'plumbing-water-heater-corrosion', category: 'Plumbing', subcategory: 'Defects', item: 'Water Heater Corrosion', required: false, type: 'checkbox', commentText: 'Corrosion was noted at the burn chamber or pipe fittings. Recommend a qualified plumber evaluate for repair/replacement.' },
  { id: 'plumbing-water-heater-improper-installation', category: 'Plumbing', subcategory: 'Defects', item: 'Water Heater Improper Installation', required: false, type: 'checkbox', commentText: 'Water heater is improperly installed or in a dangerous location. Recommend qualified plumber evaluate & repair/relocate.' },
  { id: 'plumbing-water-heater-no-expansion-tank', category: 'Plumbing', subcategory: 'Defects', item: 'Water Heater No Expansion Tank', required: false, type: 'checkbox', commentText: 'No expansion tank was present. Expansion tanks allow for the thermal expansion of water in the pipes. These are required in certain areas for new installs. Recommend a qualified plumber evaluate and install.' },
  { id: 'plumbing-water-heater-no-drip-pan', category: 'Plumbing', subcategory: 'Defects', item: 'Water Heater No Drip Pan', required: false, type: 'checkbox', commentText: 'No drip pan was present. Recommend installation by a qualified plumber.' },
  { id: 'plumbing-water-heater-no-burner-ignition', category: 'Plumbing', subcategory: 'Defects', item: 'Water Heater No Burner Ignition', required: false, type: 'checkbox', commentText: 'The burner was unresponsive and did not ignite, despite gas flowing properly. Recommend a qualified plumber evaluate and repair.' },

  // Fuel Storage & Distribution - Defects (FROM XLSX)
  { id: 'plumbing-fuel-improper-installation', category: 'Plumbing', subcategory: 'Defects', item: 'Fuel System Improper Installation', required: false, type: 'checkbox', commentText: 'Gas supply or distribution pipes were improperly installed. Recommend a qualified contractor or local utility company evaluate and properly install pipes up to standards.' },
  { id: 'plumbing-fuel-gas-odor-severe', category: 'Plumbing', subcategory: 'Defects', item: 'Gas Odor (Severe)', required: false, type: 'checkbox', commentText: 'Excessive gas odor was present around meter. Recommend consulting with your local utility company or qualified gas company to evaluate for potential leaks.' },
  { id: 'plumbing-fuel-corrosion', category: 'Plumbing', subcategory: 'Defects', item: 'Gas Pipe Corrosion', required: false, type: 'checkbox', commentText: 'Gas pipes were corroded. This can lead to gas leaks. Recommend contacting local utility company for evaluation and repair.' },

  // Sump Pump - Defects (FROM XLSX)
  { id: 'plumbing-sump-pump-no-shutoff-valve', category: 'Plumbing', subcategory: 'Defects', item: 'Sump Pump No Shut-off Valve', required: false, type: 'checkbox', commentText: 'No shut-off valve was observed at time of inspection. Recommend a qualified plumber install.' },
  { id: 'plumbing-sump-pump-needs-cleaning', category: 'Plumbing', subcategory: 'Defects', item: 'Sump Pump Needs Cleaning', required: false, type: 'checkbox', commentText: 'Sump pump was excessively dirty and in need of cleaning/servicing.' },
  { id: 'plumbing-sump-pump-improper-installation', category: 'Plumbing', subcategory: 'Defects', item: 'Sump Pump Improper Installation', required: false, type: 'checkbox', commentText: 'Sump pump had sub-standard installation. Recommend a qualified plumber evaluate and properly install.' },

  // ============== ELECTRIC ==============
  // Service Entrance Conductors - Defects (FROM XLSX)
  { id: 'electric-service-water-intrusion', category: 'Electric', subcategory: 'Defects', item: 'Service Water Intrusion', required: false, type: 'checkbox', commentText: 'There is possible water intrusion and the meter / service entrance. Moisture can deteriorate the electrical equipment. Recommend that a licensed electrician repair / replace as needed.' },
  { id: 'electric-service-not-enough-clearance', category: 'Electric', subcategory: 'Defects', item: 'Service Not Enough Clearance', required: false, type: 'checkbox', commentText: 'Service drop overhead wires are too low, not giving enough clearance above roof. Recommend contacting your local electric utility company or qualified electrician to see if they can correct.' },
  { id: 'electric-service-mast-improperly-installed', category: 'Electric', subcategory: 'Defects', item: 'Mast Improperly Installed', required: false, type: 'checkbox', commentText: 'Mast is not properly installed.' },
  { id: 'electric-service-frayed-sheathing', category: 'Electric', subcategory: 'Defects', item: 'Frayed Sheathing', required: false, type: 'checkbox', commentText: 'Wires on service entrance are damaged or frayed. Recommend contacting your electric utility company or a qualified electrician to evaluate and repair.' },

  // Main & Subpanels - Defects (FROM XLSX)
  { id: 'electric-panel-damaged', category: 'Electric', subcategory: 'Defects', item: 'Panel Damaged', required: false, type: 'checkbox', commentText: 'Electrical panel is damaged. Recommend a licensed electrician evaluate and repair.' },
  { id: 'electric-panel-no-ground-wire', category: 'Electric', subcategory: 'Defects', item: 'No Ground Wire', required: false, type: 'checkbox', commentText: 'Missing ground wire. Recommend qualified electrician evaluate and install.' },
  { id: 'electric-panel-missing-labels', category: 'Electric', subcategory: 'Defects', item: 'Missing Labels on Panel', required: false, type: 'checkbox', commentText: 'At the time of inspection, panel was missing labeling. Recommend a qualified electrician or person identify and map out locations.' },
  { id: 'electric-panel-meter-base-not-secure', category: 'Electric', subcategory: 'Defects', item: 'Meter Base Not Secure', required: false, type: 'checkbox', commentText: 'Meter base was loose at time of inspection. Recommend re-securing by a qualified contractor.' },
  { id: 'electric-panel-knockouts-missing', category: 'Electric', subcategory: 'Defects', item: 'Knockouts Missing', required: false, type: 'checkbox', commentText: '"Knockouts" are missing on the electric panel. This poses a safety hazard and it is recommended that the opening in the panel caused by the missing knockout(s) be properly sealed by a licensed electrician.' },
  { id: 'electric-panel-incompatible-meter-base', category: 'Electric', subcategory: 'Defects', item: 'Incompatible Meter Base', required: false, type: 'checkbox', commentText: 'I recommend meter base to be upgraded to be in line with upgraded service wires. Recommend qualified electrician evaluate.' },
  { id: 'electric-panel-inadequate-ground', category: 'Electric', subcategory: 'Defects', item: 'Inadequate Ground', required: false, type: 'checkbox', commentText: 'The ground at service entrance appears inadequate and should be checked by a licensed electrician.' },
  { id: 'electric-panel-breaker-incorrectly-wired', category: 'Electric', subcategory: 'Defects', item: 'Breaker Incorrectly Wired', required: false, type: 'checkbox', commentText: 'Circuit breaker was incorrectly wired / installed. This indicates that work was probably not performed by a licensed electrician and poses a safety hazard. Recommend that a licensed electrician check the entire panel and repair and replace as need.' },

  // Branch Circuits - Defects (FROM XLSX)
  { id: 'electric-branch-insufficient-load', category: 'Electric', subcategory: 'Defects', item: 'Insufficient Load', required: false, type: 'checkbox', commentText: 'Branch circuits have insufficient load capacity. Recommend a licensed electrician evaluate and upgrade.' },
  { id: 'electric-branch-improper-wiring', category: 'Electric', subcategory: 'Defects', item: 'Improper Wiring', required: false, type: 'checkbox', commentText: 'Improper wiring was observed in branch circuits. Recommend a licensed electrician evaluate and repair.' },
  { id: 'electric-branch-aluminum-circuits', category: 'Electric', subcategory: 'Defects', item: 'Aluminum Branch Circuits', required: false, type: 'checkbox', commentText: 'Aluminum wire appears to be installed on branch electrical circuits in the subject premises. These single strand, branch circuit aluminum wires were used widely in houses during the mid 1960s and 1970s. According to the U.S. Consumer Product Safety Commission, problems due to expansion can cause overheating at connections between the wire and devices (switches and outlets) or at splices, which has resulted in fires. It is recommended that the electrical system be evaluated by a licensed electrician.' },

  // Lighting Fixtures & Receptacles - Defects (FROM XLSX)
  { id: 'electric-lighting-burnt-out-bulbs', category: 'Electric', subcategory: 'Defects', item: 'Burnt Out Bulbs', required: false, type: 'checkbox', commentText: 'Light bulbs that did not work at the time of the inspection should be replaced prior to closing by the current owner.' },
  { id: 'electric-lighting-loose-fixture', category: 'Electric', subcategory: 'Defects', item: 'Loose Fixture', required: false, type: 'checkbox', commentText: 'Light fixture was loose. Recommend a licensed electrician evaluate and secure.' },
  { id: 'electric-lighting-improper-installation', category: 'Electric', subcategory: 'Defects', item: 'Light Improper Installation', required: false, type: 'checkbox', commentText: 'Light fixtures were improperly installed. Recommend a licensed electrician evaluate and repair.' },
  { id: 'electric-lighting-damaged-fixture', category: 'Electric', subcategory: 'Defects', item: 'Damaged Fixture', required: false, type: 'checkbox', commentText: 'Light fixture was damaged. Recommend a licensed electrician evaluate and repair/replace.' },
  { id: 'electric-receptacle-no-power', category: 'Electric', subcategory: 'Defects', item: 'Receptacle No Power', required: false, type: 'checkbox', commentText: 'Receptacle had no power at time of inspection. Recommend a licensed electrician evaluate and repair.' },
  { id: 'electric-receptacle-reversed-polarity', category: 'Electric', subcategory: 'Defects', item: 'Reversed Polarity', required: false, type: 'checkbox', commentText: 'Receptacle had reversed polarity. This is a safety hazard. Recommend a licensed electrician evaluate and repair.' },
  { id: 'electric-receptacle-no-ground', category: 'Electric', subcategory: 'Defects', item: 'Receptacle No Ground', required: false, type: 'checkbox', commentText: 'Receptacle had no ground. This is a safety hazard. Recommend a licensed electrician evaluate and repair.' },
  { id: 'electric-switch-inoperable', category: 'Electric', subcategory: 'Defects', item: 'Switch Inoperable', required: false, type: 'checkbox', commentText: 'Light switch was inoperable at time of inspection. Recommend a licensed electrician evaluate and repair.' },

  // GFCI & AFCI - Defects (FROM XLSX)
  { id: 'electric-gfci-not-present', category: 'Electric', subcategory: 'Defects', item: 'GFCI Not Present', required: false, type: 'checkbox', commentText: 'GFCI protection was not present in wet areas such as kitchen, bathroom, garage, exterior, or near water sources. Modern standards require GFCI protection in these areas. Recommend a licensed electrician install GFCI outlets.' },
  { id: 'electric-gfci-not-functioning', category: 'Electric', subcategory: 'Defects', item: 'GFCI Not Functioning', required: false, type: 'checkbox', commentText: 'GFCI outlet was not functioning properly when tested. Recommend a licensed electrician evaluate and repair/replace.' },
  { id: 'electric-afci-not-present', category: 'Electric', subcategory: 'Defects', item: 'AFCI Not Present', required: false, type: 'checkbox', commentText: 'AFCI protection was not present in bedrooms. Modern standards require AFCI protection in bedrooms. Recommend a licensed electrician install AFCI breakers.' },
  { id: 'electric-afci-not-functioning', category: 'Electric', subcategory: 'Defects', item: 'AFCI Not Functioning', required: false, type: 'checkbox', commentText: 'AFCI breaker was not functioning properly when tested. Recommend a licensed electrician evaluate and repair/replace.' },

  // Smoke Detectors - Defects (FROM XLSX)
  { id: 'electric-smoke-detector-missing', category: 'Electric', subcategory: 'Defects', item: 'Smoke Detector Missing', required: false, type: 'checkbox', commentText: 'Smoke detector was missing in one or more required locations. Recommend installing smoke detectors in all bedrooms and common areas.' },
  { id: 'electric-smoke-detector-inoperable', category: 'Electric', subcategory: 'Defects', item: 'Smoke Detector Inoperable', required: false, type: 'checkbox', commentText: 'Smoke detector was not functioning at time of inspection. Recommend replacing batteries or the entire unit.' },
  { id: 'electric-smoke-detector-expired', category: 'Electric', subcategory: 'Defects', item: 'Smoke Detector Expired', required: false, type: 'checkbox', commentText: 'Smoke detector has exceeded its useful life (typically 10 years). Recommend replacing with a new unit.' },

  // Carbon Monoxide Detectors - Defects (FROM XLSX)
  { id: 'electric-co-detector-missing', category: 'Electric', subcategory: 'Defects', item: 'CO Detector Missing', required: false, type: 'checkbox', commentText: 'Carbon monoxide detector was missing in one or more required locations. Recommend installing CO detectors near sleeping areas and on each level of the home.' },
  { id: 'electric-co-detector-inoperable', category: 'Electric', subcategory: 'Defects', item: 'CO Detector Inoperable', required: false, type: 'checkbox', commentText: 'Carbon monoxide detector was not functioning at time of inspection. Recommend replacing batteries or the entire unit.' },
  { id: 'electric-co-detector-expired', category: 'Electric', subcategory: 'Defects', item: 'CO Detector Expired', required: false, type: 'checkbox', commentText: 'Carbon monoxide detector has exceeded its useful life (typically 5-7 years). Recommend replacing with a new unit.' },

  // ============== FIREPLACES ==============
  // Solid Fuel Heating Device - Defects (FROM XLSX)
  { id: 'fireplace-hearth-insufficient-length', category: 'Fireplaces', subcategory: 'Defects - Solid Fuel Heating Device', item: 'Hearth Insufficient Length', required: false, type: 'checkbox', commentText: 'Fireplace hearth should extend a minimum of 20 inches from the front and 12 inches to both sides of fireplace. Recommend a qualified fireplace contractor evaluate and remedy.' },
  { id: 'fireplace-firewall-cracked', category: 'Fireplaces', subcategory: 'Defects - Solid Fuel Heating Device', item: 'Firewall Cracked', required: false, type: 'checkbox', commentText: 'The brick lining of the fireplace was cracked in one or more places, which could lead to chimney damage or toxic fumes entering the home. Recommend a qualified fireplace contractor evaluate and repair.' },
  { id: 'fireplace-damper-inoperable-solid', category: 'Fireplaces', subcategory: 'Defects - Solid Fuel Heating Device', item: 'Damper Inoperable', required: false, type: 'checkbox', commentText: 'Damper was inoperable, which could allow toxic fumes into the home. Recommend a qualified fireplace contractor evaluate and repair.' },

  // Gas/LP Fireplaces - Defects (FROM XLSX)
  { id: 'fireplace-no-screen', category: 'Fireplaces', subcategory: 'Defects - Gas/LP Fireplaces', item: 'No Fireplace Screen', required: false, type: 'checkbox', commentText: 'Fireplace screen was missing in front of fireplace. Fire logs can split, so this is recommended as a safety precaution.' },
  { id: 'fireplace-inadequate-clearance', category: 'Fireplaces', subcategory: 'Defects - Gas/LP Fireplaces', item: 'Inadequate Clearance', required: false, type: 'checkbox', commentText: 'Fireplace was too close to combustible items. Fireplace and surrounding space should be clear of personal items.' },
  { id: 'fireplace-damper-inoperable-gas', category: 'Fireplaces', subcategory: 'Defects - Gas/LP Fireplaces', item: 'Damper Inoperable', required: false, type: 'checkbox', commentText: 'Damper was inoperable. Recommend a qualified fireplace contractor repair.' },
  { id: 'fireplace-creosote-buildup', category: 'Fireplaces', subcategory: 'Defects - Gas/LP Fireplaces', item: 'Creosote Buildup', required: false, type: 'checkbox', commentText: 'There was a notable amount of creosote buildup in the flue. Recommend a qualified fireplace or chimney contractor inspected and sweep on annual basis.' },

  // ============== ATTIC, INSULATION & VENTILATION ==============
  // Insulation - Defects (FROM XLSX)
  { id: 'attic-insulation-damaged', category: 'Attic, Insulation & Ventilation', subcategory: 'Defects - Insulation', item: 'Damaged', required: false, type: 'checkbox', commentText: 'Insulation appears to have been pulled out and/or damaged by pests. Recommend a qualified insulation contractor evaluate and repair.' },
  { id: 'attic-insulation-improper-installation', category: 'Attic, Insulation & Ventilation', subcategory: 'Defects - Insulation', item: 'Improper Installation', required: false, type: 'checkbox', commentText: 'Attic insulation was improperly installed. Recommend a qualified insulation contractor evaluate and correct.' },
  { id: 'attic-insulation-insufficient', category: 'Attic, Insulation & Ventilation', subcategory: 'Defects - Insulation', item: 'Insufficient Insulation', required: false, type: 'checkbox', commentText: 'Insulation depth was inadequate. Recommend a qualified attic insulation contractor install additional insulation.' },

  // Ventilation - Defects (FROM XLSX)
  { id: 'attic-whole-house-fan-inoperable', category: 'Attic, Insulation & Ventilation', subcategory: 'Defects - Ventilation', item: 'Whole House Fan Inoperable', required: false, type: 'checkbox', commentText: 'Whole house fan was inoperable at time of inspection. Recommend a qualified whole house fan contractor evaluate and repair.' },
  { id: 'attic-gable-vent-damaged', category: 'Attic, Insulation & Ventilation', subcategory: 'Defects - Ventilation', item: 'Gable Vent Damaged', required: false, type: 'checkbox', commentText: 'Gable vent was damaged, which could allow pests to enter. Recommend a qualified attic or ventilation contractor repair.' },
  { id: 'attic-discoloration-possible-mold', category: 'Attic, Insulation & Ventilation', subcategory: 'Defects - Ventilation', item: 'Discoloration - Possible Mold', required: false, type: 'checkbox', commentText: 'Attic showed areas of discoloration and possible mold growth. Recommend a mold lab analysis to prevent spread of potential mold and damage to home or health risk. I also recommend finding source of moisture or lack of ventilation in attic space.' },
  { id: 'attic-ventilation-insufficient', category: 'Attic, Insulation & Ventilation', subcategory: 'Defects - Ventilation', item: 'Attic Ventilation Insufficient', required: false, type: 'checkbox', commentText: 'Attic venting was insufficient at time of inspection. Modern standards recommend 1.5 square feet of venting area for every 300 square feet of attic floor space. Recommend an attic contractor evaluate and remedy.' },
  { id: 'attic-fan-inoperable', category: 'Attic, Insulation & Ventilation', subcategory: 'Defects - Ventilation', item: 'Attic Fan Inoperable', required: false, type: 'checkbox', commentText: 'Attic fan was inoperable at time of inspection. Recommend an attic fan specialist evaluate and repair.' },

  // Exhaust Systems - Defects (FROM XLSX)
  { id: 'attic-exhaust-ducts-loose', category: 'Attic, Insulation & Ventilation', subcategory: 'Defects - Exhaust Systems', item: 'Ducts Loose', required: false, type: 'checkbox', commentText: 'Ductwork in the attic is loose or disconnected. Recommend repair.' },
  { id: 'attic-exhaust-bathroom-vents-into-attic', category: 'Attic, Insulation & Ventilation', subcategory: 'Defects - Exhaust Systems', item: 'Bathroom Vents Into Attic', required: false, type: 'checkbox', commentText: 'Bathroom fan vents into the attic, which can cause moisture and mold. Recommend a qualified attic contractor properly install exhaust fan to terminate to the exterior.' },

  // Vapor Retarders - Defects (FROM XLSX)
  { id: 'attic-vapor-barrier-damaged', category: 'Attic, Insulation & Ventilation', subcategory: 'Defects - Vapor Retarders', item: 'Vapor Barrier Damaged', required: false, type: 'checkbox', commentText: 'Vapor barrier is damaged in one or more areas. Recommend insulation contractor repair or replace.' },
  { id: 'attic-no-vapor-barrier', category: 'Attic, Insulation & Ventilation', subcategory: 'Defects - Vapor Retarders', item: 'No Vapor Barrier', required: false, type: 'checkbox', commentText: 'There is no vapor barrier beneath the flooring. This can result in unwanted moisture.' },
  { id: 'attic-vapor-barrier-improper-installation', category: 'Attic, Insulation & Ventilation', subcategory: 'Defects - Vapor Retarders', item: 'Improper Installation', required: false, type: 'checkbox', commentText: 'Vapor barrier is improperly installed. This can result in unwanted moisture. Recommend insulation contractor evaluate.' },

  // ============== DOORS & WINDOWS ==============
  // Floors - Defects (FROM XLSX)
  { id: 'interior-floor-tiles-loose', category: 'Doors & Windows', subcategory: 'Defects - Floors', item: 'Tiles Loose', required: false, type: 'checkbox', commentText: 'Loose tiles are present at time of inspection. Recommend a qualified contractor re-attach and seal.' },
  { id: 'interior-floor-severe-wear', category: 'Doors & Windows', subcategory: 'Defects - Floors', item: 'Severe Wear', required: false, type: 'checkbox', commentText: 'Floors have severe surface wear in many areas. Recommend a qualified flooring contractor evaluate & remedy.' },
  { id: 'interior-floor-moisture-damage', category: 'Doors & Windows', subcategory: 'Defects - Floors', item: 'Moisture Damage', required: false, type: 'checkbox', commentText: 'Floors had areas of visible moisture damage. Recommend a qualified flooring contractor evaluate & repair areas of moisture.' },
  { id: 'interior-floor-tiles-missing', category: 'Doors & Windows', subcategory: 'Defects - Floors', item: 'Tiles Missing', required: false, type: 'checkbox', commentText: 'One or more floor tiles were missing. Recommend installing/replacing missing tiles.' },
  { id: 'interior-floor-damaged-general', category: 'Doors & Windows', subcategory: 'Defects - Floors', item: 'Damaged (General)', required: false, type: 'checkbox', commentText: 'The home had general moderate damage visible at the time of the inspection. Recommend service by a qualified contractor.' },
  { id: 'interior-floor-carpet-stains', category: 'Doors & Windows', subcategory: 'Defects - Floors', item: 'Carpet Stains', required: false, type: 'checkbox', commentText: 'Carpet had areas of staining or discoloration. Recommend a thorough steam clean by a qualified carpet cleaning company.' },
  { id: 'interior-floor-moderate-wear', category: 'Doors & Windows', subcategory: 'Defects - Floors', item: 'Moderate Wear', required: false, type: 'checkbox', commentText: 'Floors in the home exhibited moderate surface wear along major paths of travel. Recommend a qualified flooring contractor evaluate for possible re-finish.' },

  // Walls - Defects (FROM XLSX)
  { id: 'interior-wall-doorknob-hole', category: 'Doors & Windows', subcategory: 'Defects - Walls', item: 'Doorknob Hole', required: false, type: 'checkbox', commentText: 'Wall had damage from doorknob. Recommend a qualified handyman or drywall contractor repair.' },
  { id: 'interior-wall-major-corner-cracks', category: 'Doors & Windows', subcategory: 'Defects - Walls', item: 'Major Corner Cracks', required: false, type: 'checkbox', commentText: 'Cracking visible at the corners of doors and windows. Indicate soil movement, which is a structural concern and should be evaluated by a structural engineer.' },
  { id: 'interior-wall-minor-corner-cracks', category: 'Doors & Windows', subcategory: 'Defects - Walls', item: 'Minor Corner Cracks', required: false, type: 'checkbox', commentText: 'Minor cracks at the corners of doors and windows in walls. Appeared to be the result of long-term settling. Some settling is not unusual in a home of this age and these cracks are not a structural concern.' },
  { id: 'interior-wall-moisture-damage', category: 'Doors & Windows', subcategory: 'Defects - Walls', item: 'Moisture Damage', required: false, type: 'checkbox', commentText: 'Stains on the walls visible at the time of the inspection appeared to be the result of moisture intrusion. The source of moisture may have been corrected. Recommend further examination by a qualified contractor to provide confirmation.' },
  { id: 'interior-wall-nail-pops', category: 'Doors & Windows', subcategory: 'Defects - Walls', item: 'Nail Pops', required: false, type: 'checkbox', commentText: 'Protruding nail heads visible at the time of the inspection appeared to be the result of contact with moisture. After the source of moisture is located and corrected, protruding nails should be removed, drywall re-fastened and the drywall finished to match the existing wall surfaces. All work should be performed by a qualified drywall or painting contractor.' },
  { id: 'interior-wall-paint-cracking', category: 'Doors & Windows', subcategory: 'Defects - Walls', item: 'Paint Cracking', required: false, type: 'checkbox', commentText: 'Wall paint was cracking in one or more areas. Recommend a qualified painter evaluate and apply a new coat.' },
  { id: 'interior-wall-poor-patching', category: 'Doors & Windows', subcategory: 'Defects - Walls', item: 'Poor Patching', required: false, type: 'checkbox', commentText: 'Sub-standard drywall patching observed at time of inspection. Recommend re-patching.' },

  // Ceilings - Defects (FROM XLSX)
  { id: 'interior-ceiling-severe-damage', category: 'Doors & Windows', subcategory: 'Defects - Ceilings', item: 'Severe Damage', required: false, type: 'checkbox', commentText: 'Severe ceiling damage observed. Recommend a qualified drywall or structural engineer evaluate and advise.' },
  { id: 'interior-ceiling-sagging-drywall', category: 'Doors & Windows', subcategory: 'Defects - Ceilings', item: 'Sagging Drywall', required: false, type: 'checkbox', commentText: 'Ceiling drywall sagged visibly at the time of the inspection. This appears to be due to leakage from above. The source of moisture intrusion should be identified and corrected, and the damaged section of drywall replaced.' },
  { id: 'interior-ceiling-stains', category: 'Doors & Windows', subcategory: 'Defects - Ceilings', item: 'Stain(s) on Ceiling', required: false, type: 'checkbox', commentText: 'There is a stain on ceiling/wall that requires repair and paint. Source of staining should be determined.' },
  { id: 'interior-ceiling-possible-mold', category: 'Doors & Windows', subcategory: 'Defects - Ceilings', item: 'Possible Mold', required: false, type: 'checkbox', commentText: 'There are possible signs of fungi growth on ceiling. It is unknown if this is a safety hazard. Recommend a qualified mold inspector evaluate.' },
  { id: 'interior-ceiling-minor-damage', category: 'Doors & Windows', subcategory: 'Defects - Ceilings', item: 'Minor Damage', required: false, type: 'checkbox', commentText: 'Minor damage or deterioration to the ceiling was visible at the time of the inspection.' },
  { id: 'interior-ceiling-roof-leak-damage', category: 'Doors & Windows', subcategory: 'Defects - Ceilings', item: 'Recent Roof Leak Damage', required: false, type: 'checkbox', commentText: 'Stains on the ceiling appear to be the result of roof leaks. The source of leakage should be identified and corrected, and the ceiling re-painted.' },

  // Steps & Stairways - Defects (FROM XLSX)
  { id: 'interior-stairs-no-handrail', category: 'Doors & Windows', subcategory: 'Defects - Steps & Stairways', item: 'No Handrail', required: false, type: 'checkbox', commentText: 'Staircase had no handrails. This is a safety hazard. Recommend a qualified handyman install a handrail.' },
  { id: 'interior-stairs-loose-balusters', category: 'Doors & Windows', subcategory: 'Defects - Steps & Stairways', item: 'Loose Balusters', required: false, type: 'checkbox', commentText: 'Handrail balusters were loose. This could pose a safety hazard. Recommend a qualified handyman evaluate and fasten.' },
  { id: 'interior-stairs-baluster-spaces-wide', category: 'Doors & Windows', subcategory: 'Defects - Steps & Stairways', item: 'Baluster Spaces Too Wide', required: false, type: 'checkbox', commentText: 'The baluster space is not up to modern safety standards. The space between balusters should not allow passage of a 4 3/8-inch sphere for child safety. Recommend a qualified handyman or original installer repair and bring up to code.' },

  // Garage Door - Defects (FROM XLSX)
  { id: 'garage-door-sticking', category: 'Doors & Windows', subcategory: 'Defects - Garage Doors', item: 'Sticking', required: false, type: 'checkbox', commentText: 'Garage door sticks for a period of time before opening/closing. This can be due to old opener batteries, old sensors or switches, or obstructions in the wheel track. Recommend a qualified garage contractor evaluate to ensure cables, springs & motors are in working condition and properly lubricated.' },
  { id: 'garage-door-severe-damage', category: 'Doors & Windows', subcategory: 'Defects - Garage Doors', item: 'Severe Damage', required: false, type: 'checkbox', commentText: 'Garage door showed severe damage. I recommend a qualified garage door contractor evaluate and repair/replace.' },
  { id: 'garage-door-panel-damage', category: 'Doors & Windows', subcategory: 'Defects - Garage Doors', item: 'Panel Damage', required: false, type: 'checkbox', commentText: 'Garage door panel is damaged and may need repair/replacement. Recommend a qualified garage door contractor evaluate.' },

  // Garage Door Opener - Defects (FROM XLSX)
  { id: 'garage-opener-inoperable-wall-switch', category: 'Doors & Windows', subcategory: 'Defects - Garage Door Opener', item: 'Inoperable Wall Switch', required: false, type: 'checkbox', commentText: 'Garage wall switch was inoperable at time of inspection. Recommend testing the wall switch and possible replacement.' },
  { id: 'garage-opener-inoperable-remote', category: 'Doors & Windows', subcategory: 'Defects - Garage Door Opener', item: 'Inoperable Remote', required: false, type: 'checkbox', commentText: 'Garage remote was inoperable at the time of inspection. When wall switch works but remote doesn\'t, this can be due to old batteries or needing a new receiver/remote.' },
  { id: 'garage-opener-delayed-wall-switch', category: 'Doors & Windows', subcategory: 'Defects - Garage Door Opener', item: 'Delayed Wall Switch', required: false, type: 'checkbox', commentText: 'Wall switch needed to be depressed until door was open/closed. Recommend a garage door contractor evaluate & repair.' },

  // Occupant Door - Defects (FROM XLSX)
  { id: 'garage-occupant-door-not-self-closing', category: 'Doors & Windows', subcategory: 'Defects - Occupant Door', item: 'Not Self-closing', required: false, type: 'checkbox', commentText: 'Door from garage to home should have self-closing hinges to help prevent spread of a fire to living space. Recommend a qualified contractor install self-closing hinges.' },
  { id: 'garage-occupant-door-not-meet-separation', category: 'Doors & Windows', subcategory: 'Defects - Occupant Door', item: 'Does Not Meet Separation Requirements', required: false, type: 'checkbox', commentText: 'Door separating garage and home does not meet safety standards. Doors in firewalls must be at least 1 3/8-inch thick, metal/steel, or a 20-minute fire-rated door.' },

  // ============== BUILT-IN APPLIANCES ==============
  // Range/Oven/Cooktop - Defects (FROM XLSX)
  { id: 'cooking-exhaust-duct-dips', category: 'Built-in Appliances', subcategory: 'Defects - Range/Oven/Cooktop', item: 'Exhaust Duct Dips', required: false, type: 'checkbox', commentText: 'Exhaust duct has dips or traps that might collect residue.' },
  { id: 'cooking-grease-buildup', category: 'Built-in Appliances', subcategory: 'Defects - Range/Oven/Cooktop', item: 'Grease Buildup', required: false, type: 'checkbox', commentText: 'Grease buildup was observed in cooking equipment. Recommend cleaning to prevent fire hazard.' },
  { id: 'cooking-fire-extinguisher-not-close', category: 'Built-in Appliances', subcategory: 'Defects - Range/Oven/Cooktop', item: 'Fire Extinguisher Not Close Enough', required: false, type: 'checkbox', commentText: 'Fire extinguishers should be stored within a 30-foot travel distance of commercial-type cooking equipment that uses cooking oil or animal fat.' },
  { id: 'cooking-exhaust-duct-improper', category: 'Built-in Appliances', subcategory: 'Defects - Range/Oven/Cooktop', item: 'Exhaust Duct Improper Installation', required: false, type: 'checkbox', commentText: 'Exhaust duct is improperly installed.' },

  // Dishwasher - Defects (FROM XLSX)
  { id: 'appliances-dishwasher-leaking', category: 'Built-in Appliances', subcategory: 'Defects - Dishwasher', item: 'Leaking', required: false, type: 'checkbox', commentText: 'Dishwasher leaks when cycle was ran. Recommend qualified professional evaluate.' },
  { id: 'appliances-dishwasher-inoperable', category: 'Built-in Appliances', subcategory: 'Defects - Dishwasher', item: 'Inoperable', required: false, type: 'checkbox', commentText: 'Dishwasher was inoperable using standard controls. Recommend a qualified plumber or contractor evaluate.' },
  { id: 'appliances-dishwasher-improper-drain-pipe', category: 'Built-in Appliances', subcategory: 'Defects - Dishwasher', item: 'Improperly Installed Drain Pipe', required: false, type: 'checkbox', commentText: 'Dishwasher drain pipe was installed improperly. Recommend a qualified plumber evaluate and repair.' },
  { id: 'appliances-dishwasher-improper-installation', category: 'Built-in Appliances', subcategory: 'Defects - Dishwasher', item: 'Improper Installation', required: false, type: 'checkbox', commentText: 'Dishwasher was improperly installed. Recommend a qualified contractor evaluate and repair.' },

  // Refrigerator - Defects (FROM XLSX)
  { id: 'appliances-refrigerator-inoperable', category: 'Built-in Appliances', subcategory: 'Defects - Refrigerator', item: 'Inoperable', required: false, type: 'checkbox', commentText: 'Refrigerator was inoperable at time of inspection. Recommend confirming with seller that it\'s operational before closing.' },
];

// Export a normalized list so category names always align with the canonical checklist data
export const missingChecklistDefects: MissingDefectItem[] = missingChecklistDefectsRaw.map(
  normalizeMissingDefectItem
);

