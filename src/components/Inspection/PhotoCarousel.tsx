import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { InspectionPhoto } from '@/hooks/useInspectionPhotos';
import { cn } from '@/lib/utils';

interface PhotoCarouselProps {
  photos: InspectionPhoto[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PhotoCarousel({
  photos,
  initialIndex,
  open,
  onOpenChange
}: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
  }, [initialIndex, open]);

  const currentPhoto = photos[currentIndex];

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
    setIsZoomed(false);
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          onOpenChange(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, goToPrevious, goToNext, onOpenChange]);

  const handleDownload = async () => {
    if (!currentPhoto) return;

    try {
      const imageUrl = currentPhoto.signedUrl || currentPhoto.photo_url;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inspection-photo-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (!currentPhoto) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
        <VisuallyHidden>
          <DialogTitle>Photo Viewer</DialogTitle>
        </VisuallyHidden>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-3">
            <span className="text-white/90 text-sm font-medium">
              {currentIndex + 1} / {photos.length}
            </span>
            {currentPhoto.category && (
              <Badge variant="secondary" className="bg-white/20 text-white border-none">
                {currentPhoto.category}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              {isZoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleDownload}
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Image Container */}
        <div className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden">
          <img
            src={currentPhoto.signedUrl || currentPhoto.photo_url}
            alt={currentPhoto.caption || `Photo ${currentIndex + 1}`}
            className={cn(
              'max-w-full max-h-full object-contain transition-transform duration-300',
              isZoomed && 'scale-150 cursor-zoom-out'
            )}
            onClick={() => isZoomed && setIsZoomed(false)}
          />

          {/* Navigation Buttons */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/40 text-white hover:bg-black/60"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/40 text-white hover:bg-black/60"
                onClick={goToNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}
        </div>

        {/* Footer with Caption */}
        {currentPhoto.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white/90 text-sm text-center">{currentPhoto.caption}</p>
          </div>
        )}

        {/* Thumbnail Strip */}
        {photos.length > 1 && (
          <div className="absolute bottom-16 left-0 right-0 px-4 overflow-x-auto">
            <div className="flex gap-2 justify-center">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsZoomed(false);
                  }}
                  className={cn(
                    'flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all',
                    index === currentIndex
                      ? 'border-primary opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <img
                    src={photo.signedUrl || photo.photo_url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
