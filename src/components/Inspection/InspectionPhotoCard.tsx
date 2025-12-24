import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageIcon } from 'lucide-react';

interface InspectionPhotoCardProps {
  inspectionId: string;
  address: string;
  date: string;
  status: string;
  photoCount: number;
  thumbnailUrl?: string;
  onClick: () => void;
}

export function InspectionPhotoCard({
  address,
  date,
  status,
  photoCount,
  thumbnailUrl,
  onClick
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
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Badge className="bg-primary text-primary-foreground">
            View Photos
          </Badge>
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
