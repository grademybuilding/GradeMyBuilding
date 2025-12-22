import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Calendar, MapPin, FileText, Eye, Loader2, AlertCircle, RefreshCw, PlayCircle } from "lucide-react";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { useInspections, useInspectionDetails } from "@/hooks/useInspections";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InspectionsListProps {
  onTabChange?: (tab: string) => void;
}

export default function InspectionsList({ onTabChange }: InspectionsListProps) {
  const { inspections, loading, error, refetch } = useInspections();
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { 
    inspection: selectedInspection, 
    checklistItems, 
    photos,
    loading: detailsLoading, 
    error: detailsError 
  } = useInspectionDetails(selectedInspectionId);

  const handleViewInspection = (inspectionId: string) => {
    setSelectedInspectionId(inspectionId);
    setDetailsOpen(true);
  };

  const handleResumeInspection = (inspectionId: string) => {
    // Navigate to new inspection with draft ID
    if (onTabChange) {
      // Store the inspection ID to resume
      sessionStorage.setItem('resume_inspection_id', inspectionId);
      onTabChange('new-inspection');
    }
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'bg-muted text-muted-foreground';
    switch (grade) {
      case 'A': return 'bg-emerald-500 text-white';
      case 'B': return 'bg-blue-500 text-white';
      case 'C': return 'bg-yellow-500 text-white';
      case 'D': return 'bg-orange-500 text-white';
      case 'F': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200">Completed</Badge>;
      case 'in_progress':
      case 'draft':
        return <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-200">Draft</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status || 'Unknown'}</Badge>;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 space-y-6 animate-fade-in max-w-7xl mx-auto">
        <QuickActions onTabChange={onTabChange || (() => {})} />
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading inspections...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 space-y-6 animate-fade-in max-w-7xl mx-auto">
        <QuickActions onTabChange={onTabChange || (() => {})} />
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load inspections</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (inspections.length === 0) {
    return (
      <div className="p-4 space-y-6 animate-fade-in max-w-7xl mx-auto">
        <QuickActions onTabChange={onTabChange || (() => {})} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">My Inspections</h1>
            <p className="text-sm text-muted-foreground">Manage and track your building inspections</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-lg">
          <Building className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No inspections yet</h3>
          <p className="text-muted-foreground mb-4">Start by creating your first inspection</p>
          <Button onClick={() => onTabChange?.('new-inspection')}>
            Start New Inspection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-fade-in max-w-7xl mx-auto">
      <QuickActions onTabChange={onTabChange || (() => {})} />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">My Inspections</h1>
          <p className="text-sm text-muted-foreground">
            {inspections.length} inspection{inspections.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {inspections.map((inspection) => {
          const isDraft = inspection.status === 'draft' || inspection.status === 'in_progress';
          
          // Use checklist_data for property info when properties has placeholder values
          const checklistData = inspection.checklist_data as Record<string, unknown> | null;
          const hasRealPropertyData = inspection.properties?.address && 
            inspection.properties.address !== 'Draft Property' &&
            inspection.properties.city !== 'Unknown';
          
          const displayAddress = hasRealPropertyData 
            ? inspection.properties?.address 
            : (checklistData?.address as string) || 'Unknown Address';
          const displayCity = hasRealPropertyData 
            ? inspection.properties?.city 
            : (checklistData?.city as string) || 'Unknown';
          const displayState = hasRealPropertyData 
            ? inspection.properties?.state 
            : (checklistData?.state as string) || '';
          const displayPropertyType = hasRealPropertyData
            ? inspection.properties?.property_type
            : (checklistData?.propertyType as string) || 'Unknown';
          
          return (
            <Card key={inspection.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Building className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span className="truncate">
                        {displayAddress}
                      </span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">
                        {displayCity}{displayState ? `, ${displayState}` : ''}
                      </span>
                    </CardDescription>
                  </div>
                  {inspection.final_grade_letter && (
                    <Badge 
                      className={`text-base sm:text-lg font-bold px-3 py-1 self-start sm:self-auto ${getGradeColor(inspection.final_grade_letter)}`}
                    >
                      Grade {inspection.final_grade_letter}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">
                        {format(new Date(inspection.inspection_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {displayPropertyType}
                    </Badge>
                    {getStatusBadge(inspection.status)}
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    {isDraft ? (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1 sm:flex-initial text-xs sm:text-sm"
                        onClick={() => handleResumeInspection(inspection.id)}
                      >
                        <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Resume
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 sm:flex-initial text-xs sm:text-sm"
                          onClick={() => handleViewInspection(inspection.id)}
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          View
                        </Button>
                        <Button variant="default" size="sm" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Report
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Inspection Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          {(() => {
            // Debug logging
            if (selectedInspection) {
              console.log('[INSPECTION DETAILS]', selectedInspection);
              console.log('[PROPERTY DETAILS]', selectedInspection.properties);
              console.log('[CHECKLIST DATA]', selectedInspection.checklist_data);
            }

            // Compute display values with fallback logic
            const checklistData = selectedInspection?.checklist_data as Record<string, unknown> | null;
            const props = selectedInspection?.properties;
            
            // Check if properties has real data (not draft placeholders)
            const hasRealPropertyData = props?.address && 
              props.address !== 'Draft Property' && 
              props.city !== 'Unknown';

            const displayAddress = hasRealPropertyData 
              ? props?.address 
              : (checklistData?.address as string) || '—';
            const displayCity = hasRealPropertyData 
              ? props?.city 
              : (checklistData?.city as string) || '—';
            const displayState = hasRealPropertyData 
              ? props?.state 
              : (checklistData?.state as string) || '—';
            const displayZipCode = hasRealPropertyData 
              ? props?.zip_code 
              : (checklistData?.zipCode as string) || '—';
            const displayPropertyType = hasRealPropertyData 
              ? props?.property_type 
              : (checklistData?.propertyType as string) || '—';
            const displayYearBuilt = hasRealPropertyData 
              ? props?.year_built 
              : (checklistData?.yearBuilt as string | number) || null;
            const displaySquareFootage = hasRealPropertyData 
              ? props?.square_footage 
              : (checklistData?.squareFootage as string | number) || null;

            return (
              <>
                <DialogHeader>
                  <DialogTitle>Inspection Details</DialogTitle>
                  <DialogDescription>
                    {detailsLoading ? 'Loading...' : displayAddress}
                  </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="max-h-[70vh]">
                  {detailsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : detailsError ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                      <p className="text-muted-foreground">{detailsError}</p>
                    </div>
                  ) : selectedInspection ? (
                    <div className="space-y-6 p-1">
                      {/* Property Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Property Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div><span className="text-muted-foreground">Address:</span> {displayAddress}</div>
                            <div><span className="text-muted-foreground">City:</span> {displayCity}{displayState !== '—' ? `, ${displayState}` : ''} {displayZipCode !== '—' ? displayZipCode : ''}</div>
                            <div><span className="text-muted-foreground">Type:</span> <span className="capitalize">{displayPropertyType}</span></div>
                            {displayYearBuilt && (
                              <div><span className="text-muted-foreground">Year Built:</span> {displayYearBuilt}</div>
                            )}
                            {displaySquareFootage && (
                              <div><span className="text-muted-foreground">Size:</span> {Number(displaySquareFootage).toLocaleString()} sq ft</div>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Inspection Summary</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div><span className="text-muted-foreground">Date:</span> {format(new Date(selectedInspection.inspection_date), 'MMMM d, yyyy')}</div>
                            <div><span className="text-muted-foreground">Status:</span> <span className="capitalize">{selectedInspection.status ?? '—'}</span></div>
                            {selectedInspection.final_grade_letter && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Grade:</span>
                                <Badge className={getGradeColor(selectedInspection.final_grade_letter)}>
                                  {selectedInspection.final_grade_letter} ({selectedInspection.final_grade_numeric?.toFixed(1)}%)
                                </Badge>
                              </div>
                            )}
                            {selectedInspection.total_items_rated ? (
                              <div><span className="text-muted-foreground">Items Rated:</span> {selectedInspection.total_items_rated}</div>
                            ) : null}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Rating Breakdown */}
                      {([selectedInspection.excellent_count, selectedInspection.very_good_count, selectedInspection.good_count, selectedInspection.poor_count, selectedInspection.replace_count].some((v) => (v ?? 0) > 0)) && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Rating Breakdown</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-5 gap-4 text-center">
                              <div>
                                <div className="text-2xl font-bold text-emerald-600">{selectedInspection.excellent_count || 0}</div>
                                <div className="text-xs text-muted-foreground">Excellent</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-blue-600">{selectedInspection.very_good_count || 0}</div>
                                <div className="text-xs text-muted-foreground">Very Good</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-yellow-600">{selectedInspection.good_count || 0}</div>
                                <div className="text-xs text-muted-foreground">Good</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-orange-600">{selectedInspection.poor_count || 0}</div>
                                <div className="text-xs text-muted-foreground">Poor</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-red-600">{selectedInspection.replace_count || 0}</div>
                                <div className="text-xs text-muted-foreground">Replace</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Checklist Items */}
                      {checklistItems.length > 0 && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Checklist Items ({checklistItems.length})</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {checklistItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                  <div>
                                    <div className="text-sm font-medium">{item.item_name}</div>
                                    <div className="text-xs text-muted-foreground">{item.category}{item.subcategory ? ` > ${item.subcategory}` : ''}</div>
                                  </div>
                                  {item.rating && (
                                    <Badge variant="outline" className="text-xs">{item.rating}</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Photos */}
                      {photos.length > 0 && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Photos ({photos.length})</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-3 gap-2">
                              {photos.slice(0, 6).map((photo) => (
                                <div key={photo.id} className="aspect-square bg-muted rounded-lg overflow-hidden">
                                  <img 
                                    src={photo.photo_url} 
                                    alt={photo.caption || 'Inspection photo'} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                            {photos.length > 6 && (
                              <p className="text-sm text-muted-foreground mt-2 text-center">
                                +{photos.length - 6} more photos
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Notes */}
                      {selectedInspection.notes && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Notes</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {selectedInspection.notes}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : null}
                </ScrollArea>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
