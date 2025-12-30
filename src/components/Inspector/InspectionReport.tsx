import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building, Calendar, User, MapPin, Mail, Phone, Briefcase } from "lucide-react";
import type { InspectionDetails, ChecklistItem, InspectionPhoto } from "@/hooks/useInspections";

interface InspectionReportProps {
  inspection: InspectionDetails;
  checklistItems: ChecklistItem[];
  photos: InspectionPhoto[];
}

export default function InspectionReport({ inspection, checklistItems, photos }: InspectionReportProps) {
  // Compute display values with fallback logic
  const checklistData = inspection.checklist_data as Record<string, unknown> | null;
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

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'text-emerald-600';
      case 'Very Good': return 'text-blue-600';
      case 'Good': return 'text-yellow-600';
      case 'Poor': return 'text-orange-600';
      case 'Replace': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  // Group checklist items by category
  const groupedItems = checklistItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

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

      {/* Checklist Items by Category */}
      {Object.keys(groupedItems).length > 0 && (
        <Card className="print:border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Detailed Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="avoid-break">
                <h4 className="font-medium text-sm mb-2 text-primary">{category}</h4>
                <div className="space-y-1 pl-4 border-l-2 border-primary/20">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-1 text-sm">
                      <div className="flex-1 min-w-0">
                        <span className="truncate">{item.item_name}</span>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>
                        )}
                      </div>
                      {item.rating && (
                        <span className={`text-xs font-medium ml-2 ${getRatingColor(item.rating)}`}>
                          {item.rating}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
