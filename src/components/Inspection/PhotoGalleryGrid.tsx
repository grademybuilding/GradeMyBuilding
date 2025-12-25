import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Eye, Loader2 } from 'lucide-react';
import { InspectionPhoto } from '@/hooks/useInspectionPhotos';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PhotoGalleryGridProps {
  photos: InspectionPhoto[];
  isLoading: boolean;
  onPhotoClick: (index: number) => void;
  onDelete: (photoId: string, photoUrl: string) => void;
}

export function PhotoGalleryGrid({
  photos,
  isLoading,
  onPhotoClick,
  onDelete
}: PhotoGalleryGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No photos uploaded yet.</p>
        <p className="text-sm mt-1">Click "Upload Photos" to add inspection photos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {photos.map((photo, index) => (
        <Card key={photo.id} className="overflow-hidden group hover:shadow-md transition-shadow">
          <div className="aspect-square relative">
            <img
              src={photo.signedUrl || photo.photo_url}
              alt={photo.caption || `Photo ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => onPhotoClick(index)}
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={() => onPhotoClick(index)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this photo? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(photo.id, photo.photo_url)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <CardContent className="p-2">
            {photo.category && (
              <Badge variant="secondary" className="text-xs truncate max-w-full">
                {photo.category}
              </Badge>
            )}
            {photo.caption && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {photo.caption}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
