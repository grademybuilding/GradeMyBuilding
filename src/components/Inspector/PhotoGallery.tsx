import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Upload, Loader2, ImageIcon, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useInspectionPhotos, InspectionPhoto } from "@/hooks/useInspectionPhotos";
import { PhotoUploadModal } from "@/components/Inspection/PhotoUploadModal";
import { PhotoGalleryGrid } from "@/components/Inspection/PhotoGalleryGrid";
import { PhotoCarousel } from "@/components/Inspection/PhotoCarousel";
import { InspectionPhotoCard } from "@/components/Inspection/InspectionPhotoCard";
import { ThemeToggle } from "@/components/Layout/ThemeToggle";

interface Inspection {
  id: string;
  inspection_date: string;
  status: string;
  property: {
    address: string;
    city: string;
    state: string;
  } | null;
}

interface InspectionWithPhotos extends Inspection {
  photos: InspectionPhoto[];
}

const ALL_INSPECTIONS = "all";

export default function PhotoGallery() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [allPhotos, setAllPhotos] = useState<InspectionPhoto[]>([]);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string>(ALL_INSPECTIONS);
  const [loadingInspections, setLoadingInspections] = useState(true);
  const [loadingAllPhotos, setLoadingAllPhotos] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [carouselPhotos, setCarouselPhotos] = useState<InspectionPhoto[]>([]);

  // Use hook for viewing single inspection OR uploading to a chosen inspection
  const {
    photos: singleInspectionPhotos,
    isLoading,
    isUploading,
    uploadPhotos,
    deletePhoto,
    refetch: refetchSinglePhotos
  } = useInspectionPhotos(selectedInspectionId !== ALL_INSPECTIONS ? selectedInspectionId : null);

  // Fetch user's inspections
  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('inspections')
          .select(`
            id,
            inspection_date,
            status,
            checklist_data
          `)
          .eq('inspector_id', session.user.id)
          .order('inspection_date', { ascending: false });

        if (error) throw error;

        const transformedData = (data || []).map(item => {
          const checklistData = item.checklist_data as Record<string, any> | null;
          const address = checklistData?.address || 'Unknown Address';
          const city = checklistData?.city || '';
          const state = checklistData?.state || '';
          
          return {
            id: item.id,
            inspection_date: item.inspection_date,
            status: item.status || 'draft',
            property: {
              address,
              city,
              state
            }
          };
        });

        setInspections(transformedData);
      } catch (error) {
        console.error('Error fetching inspections:', error);
      } finally {
        setLoadingInspections(false);
      }
    };

    fetchInspections();
  }, []);

  // Fetch all photos when viewing "All Inspections"
  useEffect(() => {
    const fetchAllPhotos = async () => {
      if (selectedInspectionId !== ALL_INSPECTIONS) {
        setLoadingAllPhotos(false);
        return;
      }

      setLoadingAllPhotos(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Get all inspection IDs for this user
        const inspectionIds = inspections.map(i => i.id);
        if (inspectionIds.length === 0) {
          setAllPhotos([]);
          return;
        }

        const { data, error } = await supabase
          .from('inspection_photos')
          .select('*')
          .in('inspection_id', inspectionIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAllPhotos(data || []);
      } catch (error) {
        console.error('Error fetching all photos:', error);
      } finally {
        setLoadingAllPhotos(false);
      }
    };

    if (!loadingInspections) {
      fetchAllPhotos();
    }
  }, [selectedInspectionId, inspections, loadingInspections]);

  // Group photos by inspection
  const inspectionsWithPhotos = useMemo((): InspectionWithPhotos[] => {
    return inspections.map(inspection => ({
      ...inspection,
      photos: allPhotos.filter(p => p.inspection_id === inspection.id)
    })).filter(i => i.photos.length > 0);
  }, [inspections, allPhotos]);

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
    setCarouselOpen(true);
  };

  const handleInspectionCardClick = (inspection: InspectionWithPhotos) => {
    setCarouselPhotos(inspection.photos);
    setSelectedPhotoIndex(0);
    setCarouselOpen(true);
  };

  const handleDeletePhoto = async (photoId: string, photoUrl: string) => {
    await deletePhoto(photoId, photoUrl);
    // Refetch all photos if viewing all
    if (selectedInspectionId === ALL_INSPECTIONS) {
      const inspectionIds = inspections.map(i => i.id);
      const { data } = await supabase
        .from('inspection_photos')
        .select('*')
        .in('inspection_id', inspectionIds)
        .order('created_at', { ascending: false });
      setAllPhotos(data || []);
    }
  };

  const selectedInspection = inspections.find(i => i.id === selectedInspectionId);

  const formatInspectionLabel = (inspection: Inspection) => {
    const address = inspection.property?.address || 'Unknown Address';
    const date = new Date(inspection.inspection_date).toLocaleDateString();
    return `${address} - ${date}`;
  };

  const isViewingAll = selectedInspectionId === ALL_INSPECTIONS;
  const displayPhotos = isViewingAll ? carouselPhotos : singleInspectionPhotos;
  const totalPhotosCount = isViewingAll ? allPhotos.length : singleInspectionPhotos.length;

  return (
    <div className="p-4 space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Photo Gallery</h1>
          <p className="text-sm text-muted-foreground">
            Manage inspection photos with upload and organization
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ThemeToggle />
          <Button 
            onClick={() => {
              console.debug('[PhotoGallery] open upload modal', {
                selectedInspectionId,
                isViewingAll,
                inspectionsCount: inspections.length,
              });
              setIsUploadModalOpen(true);
            }}
            disabled={isViewingAll && inspections.length === 0}
            className="flex-1 sm:flex-initial text-xs sm:text-sm"
          >
            <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Upload Photos
          </Button>
        </div>
      </div>

      {/* Inspection Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderOpen className="h-5 w-5 text-primary" />
            Select Inspection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingInspections ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading inspections...
            </div>
          ) : inspections.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No inspections found.</p>
              <p className="text-sm">Create an inspection first to upload photos.</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Select
                value={selectedInspectionId}
                onValueChange={setSelectedInspectionId}
              >
                <SelectTrigger className="w-full sm:max-w-md">
                  <SelectValue placeholder="Select an inspection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_INSPECTIONS}>
                    <div className="flex items-center gap-2">
                      <span>All Inspections</span>
                      <Badge variant="outline" className="text-xs">
                        {allPhotos.length} photos
                      </Badge>
                    </div>
                  </SelectItem>
                  {inspections.map(inspection => (
                    <SelectItem key={inspection.id} value={inspection.id}>
                      <div className="flex items-center gap-2">
                        <span>{formatInspectionLabel(inspection)}</span>
                        <Badge 
                          variant={inspection.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {inspection.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {!isViewingAll && selectedInspection && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{singleInspectionPhotos.length}</span> photos
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Gallery - Grouped Cards View for All Inspections */}
      {isViewingAll && !loadingInspections && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Inspections with Photos
                {inspectionsWithPhotos.length > 0 && (
                  <Badge variant="secondary">{inspectionsWithPhotos.length}</Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAllPhotos ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : inspectionsWithPhotos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No photos uploaded yet.</p>
                <p className="text-sm mt-1">Select an inspection and upload photos to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {inspectionsWithPhotos.map(inspection => (
                  <InspectionPhotoCard
                    key={inspection.id}
                    inspectionId={inspection.id}
                    address={inspection.property?.address || 'Unknown Address'}
                    date={new Date(inspection.inspection_date).toLocaleDateString()}
                    status={inspection.status}
                    photoCount={inspection.photos.length}
                    thumbnailUrl={inspection.photos[0]?.photo_url}
                    onClick={() => handleInspectionCardClick(inspection)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Photo Gallery - Single Inspection View (Grouped Card) */}
      {!isViewingAll && selectedInspection && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Photos
                {singleInspectionPhotos.length > 0 && (
                  <Badge variant="secondary">{singleInspectionPhotos.length}</Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : singleInspectionPhotos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No photos uploaded yet.</p>
                <p className="text-sm mt-1">Click "Upload Photos" to add images to this inspection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <InspectionPhotoCard
                  inspectionId={selectedInspection.id}
                  address={selectedInspection.property?.address || 'Unknown Address'}
                  date={new Date(selectedInspection.inspection_date).toLocaleDateString()}
                  status={selectedInspection.status}
                  photoCount={singleInspectionPhotos.length}
                  thumbnailUrl={singleInspectionPhotos[0]?.photo_url}
                  onClick={() => {
                    setCarouselPhotos(singleInspectionPhotos);
                    setSelectedPhotoIndex(0);
                    setCarouselOpen(true);
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
      <PhotoUploadModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onUpload={async (files, inspectionId, caption) => {
          console.debug('[PhotoGallery] onUpload', {
            isViewingAll,
            selectedInspectionId,
            inspectionIdFromModal: inspectionId,
            filesCount: files.length,
          });

          await uploadPhotos(files, inspectionId, caption, 'General');

          // If we're in "all" view, refetch grouped data after upload
          if (isViewingAll) {
            const inspectionIds = inspections.map(i => i.id);
            const { data } = await supabase
              .from('inspection_photos')
              .select('*')
              .in('inspection_id', inspectionIds)
              .order('created_at', { ascending: false });
            setAllPhotos(data || []);
          }
        }}
        isUploading={isUploading}
        inspections={inspections}
        selectedInspectionId={isViewingAll ? null : selectedInspectionId}
      />

      {/* Photo Carousel */}
      <PhotoCarousel
        photos={displayPhotos}
        initialIndex={selectedPhotoIndex}
        open={carouselOpen}
        onOpenChange={setCarouselOpen}
      />
    </div>
  );
}
