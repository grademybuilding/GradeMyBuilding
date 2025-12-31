import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageIcon, Eye, Trash2 } from 'lucide-react';
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

interface InspectionPhotoCardProps {
  inspectionId: string;
  address: string;
  date: string;
  status: string;
  photoCount: number;
  thumbnailUrl?: string;
  onClick: () => void;
  onDeleteAll?: (inspectionId: string) => void;
}

export function InspectionPhotoCard({
  inspectionId,
  address,
  date,
  status,
  photoCount,
  thumbnailUrl,
  onClick,
  onDeleteAll
}: InspectionPhotoCardProps) {
  return (
    <Card 
      className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="aspect-video relative bg-muted">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={address}
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        {/* Photo count badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
          </Badge>
        </div>
        {/* Delete button on hover */}
        {onDeleteAll && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-destructive/90 hover:bg-destructive text-destructive-foreground backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Photos</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete all {photoCount} photo(s) from this inspection? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAll(inspectionId);
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="bg-primary text-primary-foreground rounded-full p-3">
            <Eye className="h-6 w-6" />
          </div>
        </div>
      </div>
      <CardContent className="p-3">
        <p className="font-medium text-sm line-clamp-1">{address}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">{date}</span>
          <Badge 
            variant={status === 'completed' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
