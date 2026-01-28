import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building, Calendar, User, MapPin, Mail, Phone, Briefcase, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { InspectionDetails, ChecklistItem, InspectionPhoto } from "@/hooks/useInspections";
import { CHECKLIST_CATEGORY_ORDER, extractDefectsByCategory } from "@/data/checklistCategoryOrder";

interface InspectionReportProps {
  inspection: InspectionDetails;
  checklistItems: ChecklistItem[];
  photos: InspectionPhoto[];
}

export default function InspectionReport({ inspection, checklistItems, photos }: InspectionReportProps) {
  // Compute display values with fallback logic
  const checklistData = inspection.checklist_data as Record<string, unknown> | null;
  const checklistRatings = inspection.checklist_ratings as Record<string, string> | null;
  const selectedDefects = inspection.selected_defects as Record<string, boolean | string[] | unknown> | null;
  const checklistNotes = inspection.checklist_notes as Record<string, string> | null;
  const props = inspection.properties;
  
  const hasRealPropertyData = props?.address && 
    props.address !== 'Draft Property' && 
    props.city !== 'Unknown';

  const displayAddress = hasRealPropertyData 
    ? props?.address 
    : (checklistData?.address as string) || 'Unknown Address';
  const displayCity = hasRealPropertyData 
    ? props?.city 
    : (checklistData?.city as string) || '';
  const displayState = hasRealPropertyData 
    ? props?.state 
    : (checklistData?.state as string) || '';
  const displayZipCode = hasRealPropertyData 
    ? props?.zip_code 
    : (checklistData?.zipCode as string) || '';
  const displayPropertyType = hasRealPropertyData 
    ? props?.property_type 
    : (checklistData?.propertyType as string) || 'Unknown';
  const displayYearBuilt = hasRealPropertyData 
    ? props?.year_built 
    : (checklistData?.yearBuilt as number) || null;
  const displaySquareFootage = hasRealPropertyData 
    ? props?.square_footage 
    : (checklistData?.squareFootage as number) || null;

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'bg-muted text-muted-foreground';
    const baseGrade = grade.charAt(0);
    switch (baseGrade) {
      case 'A': return 'bg-emerald-500 text-white';
      case 'B': return 'bg-blue-500 text-white';
      case 'C': return 'bg-yellow-500 text-white';
      case 'D': return 'bg-orange-500 text-white';
      case 'F': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const categoryScores = inspection.category_scores as Record<string, { score?: number; grade?: string }> | null;

  // Extract defects organized by category using the centralized config
  const defectsByCategory = extractDefectsByCategory(selectedDefects, checklistNotes);

  // Get ratings by category from checklistRatings
  const getRatingForCategory = (categoryLabel: string): string | null => {
    if (!checklistRatings) return null;
    
    // Look for any rating key that matches this category
    const ratingKey = Object.keys(checklistRatings).find(key => {
      const lowerKey = key.toLowerCase();
      const catLabel = categoryLabel.toLowerCase().replace(/[^a-z0-9]/g, '');
      return lowerKey.includes('inspector') && lowerKey.includes('rating');
    });
    
    return ratingKey ? checklistRatings[ratingKey] : null;
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'text-emerald-600 dark:text-emerald-400';
      case 'Very Good': return 'text-blue-600 dark:text-blue-400';
      case 'Good': return 'text-yellow-600 dark:text-yellow-400';
      case 'Poor': return 'text-orange-600 dark:text-orange-400';
      case 'Replace': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Report Header */}
      <div className="text-center border-b pb-6 print:pb-4">
        <h1 className="text-2xl font-bold text-foreground print:text-black">Building Inspection Report</h1>
        <p className="text-muted-foreground print:text-gray-600 mt-1">
          Generated on {format(new Date(), 'MMMM d, yyyy')}
        </p>
      </div>

      {/* Property & Grade Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:gap-2">
        <Card className="md:col-span-2 print:border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building className="h-4 w-4" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{displayAddress}</p>
                <p className="text-muted-foreground">
                  {displayCity}{displayState ? `, ${displayState}` : ''} {displayZipCode}
                </p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Property Type:</span>
                <span className="ml-2 capitalize font-medium">{displayPropertyType}</span>
              </div>
              {displayYearBuilt && (
                <div>
                  <span className="text-muted-foreground">Year Built:</span>
                  <span className="ml-2 font-medium">{displayYearBuilt}</span>
                </div>
              )}
              {displaySquareFootage && (
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <span className="ml-2 font-medium">{Number(displaySquareFootage).toLocaleString()} sq ft</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overall Grade */}
        <Card className="print:border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-center">Overall Grade</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ${getGradeColor(inspection.final_grade_letter)}`}>
              {inspection.final_grade_letter || 'N/A'}
            </div>
            {inspection.final_grade_numeric !== null && (
              <p className="text-lg font-semibold mt-2">{inspection.final_grade_numeric.toFixed(1)}%</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inspection Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
        <Card className="print:border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Inspection Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Date:</span>
              <span className="ml-2 font-medium">{format(new Date(inspection.inspection_date), 'MMMM d, yyyy')}</span>
            </div>
            {inspection.inspection_time && (
              <div>
                <span className="text-muted-foreground">Time:</span>
                <span className="ml-2 font-medium">{inspection.inspection_time}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="outline" className="ml-2 capitalize">{inspection.status}</Badge>
            </div>
            {inspection.weather_conditions && inspection.weather_conditions.length > 0 && (
              <div>
                <span className="text-muted-foreground">Weather:</span>
                <span className="ml-2 font-medium">{inspection.weather_conditions.join(', ')}</span>
              </div>
            )}
            {inspection.temperature !== null && (
              <div>
                <span className="text-muted-foreground">Temperature:</span>
                <span className="ml-2 font-medium">{inspection.temperature}°F</span>
              </div>
            )}
          </CardContent>
        </Card>

        {inspection.profiles && (
          <Card className="print:border-gray-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Inspector Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{inspection.profiles.full_name}</span>
              </div>
              {inspection.profiles.company_name && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{inspection.profiles.company_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{inspection.profiles.email}</span>
              </div>
              {inspection.profiles.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{inspection.profiles.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rating Breakdown */}
      {inspection.total_items_rated && inspection.total_items_rated > 0 && (
        <Card className="print:border-gray-300 avoid-break">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Rating Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-600">{inspection.excellent_count || 0}</div>
                <div className="text-xs text-muted-foreground">Excellent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{inspection.very_good_count || 0}</div>
                <div className="text-xs text-muted-foreground">Very Good</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{inspection.good_count || 0}</div>
                <div className="text-xs text-muted-foreground">Good</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{inspection.poor_count || 0}</div>
                <div className="text-xs text-muted-foreground">Poor</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{inspection.replace_count || 0}</div>
                <div className="text-xs text-muted-foreground">Replace</div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Total Items Rated: {inspection.total_items_rated}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Grades */}
      {inspection.category_scores && Object.keys(inspection.category_scores as Record<string, unknown>).length > 0 && (
        <Card className="print:border-gray-300 avoid-break">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Category Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 print:grid-cols-2">
              {Object.entries(inspection.category_scores as Record<string, { score?: number; grade?: string }>)
                .sort(([, a], [, b]) => (b.score ?? 0) - (a.score ?? 0))
                .map(([category, data]) => {
                  const score = data.score ?? 0;
                  const derivedGrade = data.grade || (
                    score >= 95 ? 'A+' :
                    score >= 90 ? 'A' :
                    score >= 85 ? 'A-' :
                    score >= 80 ? 'B+' :
                    score >= 75 ? 'B' :
                    score >= 70 ? 'B-' :
                    score >= 65 ? 'C+' :
                    score >= 60 ? 'C' :
                    score >= 55 ? 'C-' :
                    score >= 45 ? 'D' : 'F'
                  );
                  return (
                    <div 
                      key={category} 
                      className="flex items-center justify-between p-3 border rounded-lg print:border-gray-300"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{category}</p>
                        <p className="text-xs text-muted-foreground">{score.toFixed(0)}%</p>
                      </div>
                      <Badge className={`${getGradeColor(derivedGrade.charAt(0))} ml-2`}>
                        {derivedGrade}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Findings by Category - Following Checklist Structure */}
      <Card className="print:border-gray-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Detailed Findings by Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {CHECKLIST_CATEGORY_ORDER.map((category) => {
            const categoryDefects = defectsByCategory[category.label] || [];
            const categoryScore = categoryScores?.[category.label];
            
            // Skip categories with no data
            if (!categoryScore && categoryDefects.length === 0) {
              return null;
            }

            const score = categoryScore?.score ?? 0;
            const derivedGrade = categoryScore?.grade || (
              score >= 95 ? 'A+' :
              score >= 90 ? 'A' :
              score >= 85 ? 'A-' :
              score >= 80 ? 'B+' :
              score >= 75 ? 'B' :
              score >= 70 ? 'B-' :
              score >= 65 ? 'C+' :
              score >= 60 ? 'C' :
              score >= 55 ? 'C-' :
              score >= 45 ? 'D' : 'F'
            );

            return (
              <div key={category.id} className="avoid-break">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                  <h4 className="font-semibold text-base text-primary">{category.label}</h4>
                  {categoryScore && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{score.toFixed(0)}%</span>
                      <Badge className={getGradeColor(derivedGrade.charAt(0))}>
                        {derivedGrade}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Subcategories with Defects */}
                <div className="space-y-3 pl-4">
                  {category.subcategories.map((subcategory) => {
                    // Filter defects for this subcategory based on defect naming patterns
                    const subcategoryDefects = categoryDefects.filter(defect => {
                      // Match defects to subcategories by checking the defect name patterns
                      const defectLower = defect.name.toLowerCase();
                      const subLabel = subcategory.label.toLowerCase();
                      
                      // General matching - if no specific defect subcategory, show all category defects
                      if (subcategory.label === 'General' || !subcategory.defectSubcategory) {
                        return true;
                      }
                      
                      // Try to match based on subcategory patterns in the defect name
                      return defectLower.includes(subLabel.split(' ')[0].toLowerCase());
                    });

                    // Only show subcategories that have defects or if we want to show "No defects found"
                    const hasDefects = subcategoryDefects.length > 0;
                    
                    // Skip inspection details subcategories in report
                    if (subcategory.label === 'Inspection Details') {
                      return null;
                    }

                    return (
                      <div key={subcategory.id} className="border-l-2 border-primary/20 pl-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-foreground">{subcategory.label}</span>
                          {hasDefects ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                        </div>
                        
                        {hasDefects ? (
                          <ul className="space-y-1 ml-2">
                            {subcategoryDefects.map((defect, idx) => (
                              <li key={idx} className="text-sm">
                                <span className="text-destructive">• {defect.name}</span>
                                {defect.notes && (
                                  <p className="text-xs text-muted-foreground ml-3 mt-0.5">
                                    {defect.notes}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground italic ml-2">No defects found</p>
                        )}
                      </div>
                    );
                  })}

                  {/* Show all defects if no subcategory matching */}
                  {categoryDefects.length > 0 && category.subcategories.every(sub => sub.label === 'Inspection Details') && (
                    <div className="border-l-2 border-primary/20 pl-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-foreground">Defects</span>
                        <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                      </div>
                      <ul className="space-y-1 ml-2">
                        {categoryDefects.map((defect, idx) => (
                          <li key={idx} className="text-sm">
                            <span className="text-destructive">• {defect.name}</span>
                            {defect.notes && (
                              <p className="text-xs text-muted-foreground ml-3 mt-0.5">
                                {defect.notes}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Show message if no findings */}
          {Object.keys(defectsByCategory).length === 0 && !categoryScores && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No detailed findings recorded for this inspection.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Photos */}
      {photos.length > 0 && (
        <Card className="print:border-gray-300 page-break-before">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Inspection Photos ({photos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 print:grid-cols-2">
              {photos.map((photo) => (
                <div key={photo.id} className="space-y-1">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden print:border print:border-gray-300">
                    <img 
                      src={photo.photo_url} 
                      alt={photo.caption || 'Inspection photo'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {(photo.caption || photo.category) && (
                    <p className="text-xs text-muted-foreground truncate">
                      {photo.caption || photo.category}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {inspection.notes && (
        <Card className="print:border-gray-300 avoid-break">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Inspector Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {inspection.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground print:text-gray-600 pt-4 border-t print:border-gray-300">
        <p>This report was generated by GradeMyBuilding</p>
        <p>© {new Date().getFullYear()} GradeMyBuilding. All rights reserved.</p>
      </div>
    </div>
  );
}
