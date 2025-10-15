import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Download, Trash2 } from "lucide-react";

const mockPhotos = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    inspection: "123 Main Street",
    category: "Roof",
    date: "2025-10-20",
    tags: ["damage", "shingles"],
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800",
    inspection: "456 Oak Avenue",
    category: "Foundation",
    date: "2025-10-18",
    tags: ["cracks", "structural"],
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    inspection: "789 Pine Road",
    category: "HVAC",
    date: "2025-10-15",
    tags: ["system", "mechanical"],
  },
];

export default function PhotoGallery() {
  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Photo Gallery</h1>
          <p className="text-muted-foreground">Inspection photos with auto-tagging</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Photos
          </Button>
          <Button>
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockPhotos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative">
              <img 
                src={photo.url} 
                alt={photo.category}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold">{photo.inspection}</h3>
                <p className="text-sm text-muted-foreground">{photo.category}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {photo.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{new Date(photo.date).toLocaleDateString()}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
