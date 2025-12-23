import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, ImageIcon } from 'lucide-react';
import { useInspectionPhotos } from '@/hooks/useInspectionPhotos';
import { PhotoUploadModal } from './PhotoUploadModal';
import { PhotoGalleryGrid } from './PhotoGalleryGrid';
import { PhotoCarousel } from './PhotoCarousel';

interface InspectionPhotosSectionProps {
  inspectionId: string | null;
}

export function InspectionPhotosSection({ inspectionId }: InspectionPhotosSectionProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const {
    photos,
    isLoading,
    isUploading,
    uploadPhotos,
    deletePhoto
  } = useInspectionPhotos(inspectionId);

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
    setCarouselOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Camera className="h-5 w-5 text-primary" />
          Inspection Photos
          {photos.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({photos.length})
            </span>
          )}
        </CardTitle>
        <Button 
          onClick={() => setIsUploadModalOpen(true)}
          disabled={!inspectionId}
          size="sm"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Photos
        </Button>
      </CardHeader>
      <CardContent>
        {!inspectionId ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Save the inspection first to upload photos.</p>
          </div>
        ) : (
          <PhotoGalleryGrid
            photos={photos}
            isLoading={isLoading}
            onPhotoClick={handlePhotoClick}
            onDelete={deletePhoto}
          />
        )}
      </CardContent>

      {/* Upload Modal */}
      <PhotoUploadModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onUpload={uploadPhotos}
        isUploading={isUploading}
      />

      {/* Photo Carousel */}
      <PhotoCarousel
        photos={photos}
        initialIndex={selectedPhotoIndex}
        open={carouselOpen}
        onOpenChange={setCarouselOpen}
      />
    </Card>
  );
}
