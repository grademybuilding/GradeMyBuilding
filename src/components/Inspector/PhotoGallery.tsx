import { useState, useEffect } from "react";
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
import { useInspectionPhotos } from "@/hooks/useInspectionPhotos";
import { PhotoUploadModal } from "@/components/Inspection/PhotoUploadModal";
import { PhotoGalleryGrid } from "@/components/Inspection/PhotoGalleryGrid";
import { PhotoCarousel } from "@/components/Inspection/PhotoCarousel";
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

export default function PhotoGallery() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [loadingInspections, setLoadingInspections] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const {
    photos,
    isLoading,
    isUploading,
    uploadPhotos,
    deletePhoto
  } = useInspectionPhotos(selectedInspectionId);

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
            property:properties(address, city, state)
          `)
          .eq('inspector_id', session.user.id)
          .order('inspection_date', { ascending: false });

        if (error) throw error;

        // Transform the data to match our interface
        const transformedData = (data || []).map(item => ({
          id: item.id,
          inspection_date: item.inspection_date,
          status: item.status || 'draft',
          property: item.property ? {
            address: (item.property as any).address,
            city: (item.property as any).city,
            state: (item.property as any).state
          } : null
        }));

        setInspections(transformedData);
        
        // Auto-select the first inspection if available
        if (transformedData.length > 0 && !selectedInspectionId) {
          setSelectedInspectionId(transformedData[0].id);
        }
      } catch (error) {
        console.error('Error fetching inspections:', error);
      } finally {
        setLoadingInspections(false);
      }
    };

    fetchInspections();
  }, []);

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
    setCarouselOpen(true);
  };

  const selectedInspection = inspections.find(i => i.id === selectedInspectionId);

  const formatInspectionLabel = (inspection: Inspection) => {
    const address = inspection.property?.address || 'Unknown Address';
    const date = new Date(inspection.inspection_date).toLocaleDateString();
    return `${address} - ${date}`;
  };

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
            onClick={() => setIsUploadModalOpen(true)}
            disabled={!selectedInspectionId}
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
                value={selectedInspectionId || ''}
                onValueChange={setSelectedInspectionId}
              >
                <SelectTrigger className="w-full sm:max-w-md">
                  <SelectValue placeholder="Select an inspection" />
                </SelectTrigger>
                <SelectContent>
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
              
              {selectedInspection && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{photos.length}</span> photos
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Gallery Grid */}
      {selectedInspectionId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Photos
                {photos.length > 0 && (
                  <Badge variant="secondary">{photos.length}</Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoGalleryGrid
              photos={photos}
              isLoading={isLoading}
              onPhotoClick={handlePhotoClick}
              onDelete={deletePhoto}
            />
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
      <PhotoUploadModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onUpload={async (files, inspectionId, caption) => {
          await uploadPhotos(files, 'General', caption);
        }}
        isUploading={isUploading}
        inspections={inspections}
        selectedInspectionId={selectedInspectionId}
      />

      {/* Photo Carousel */}
      <PhotoCarousel
        photos={photos}
        initialIndex={selectedPhotoIndex}
        open={carouselOpen}
        onOpenChange={setCarouselOpen}
      />
    </div>
  );
}
