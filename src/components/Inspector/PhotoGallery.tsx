import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Download, Trash2 } from "lucide-react";

const mockPhotos = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    inspection: "123 Main Street",
    category: "Roof",
    date: "2025-10-20",
    tags: ["shingles", "wear"],
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    inspection: "456 Oak Avenue",
    category: "Foundation",
    date: "2025-10-18",
    tags: ["cracks", "structural"],
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1585128792020-803d29415281?w=800",
    inspection: "789 Pine Road",
    category: "HVAC",
    date: "2025-10-15",
    tags: ["system", "mechanical"],
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    inspection: "321 Elm Street",
    category: "Exterior",
    date: "2025-10-12",
    tags: ["siding", "paint"],
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
    inspection: "555 Cedar Lane",
    category: "Windows",
    date: "2025-10-10",
    tags: ["seals", "glass"],
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
    inspection: "888 Maple Drive",
    category: "Interior",
    date: "2025-10-08",
    tags: ["walls", "ceiling"],
  },
  {
    id: "7",
    url: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800",
    inspection: "222 Birch Court",
    category: "Plumbing",
    date: "2025-10-05",
    tags: ["pipes", "fixtures"],
  },
  {
    id: "8",
    url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
    inspection: "444 Willow Way",
    category: "Electrical",
    date: "2025-10-03",
    tags: ["panel", "wiring"],
  },
  {
    id: "9",
    url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800",
    inspection: "666 Spruce Ave",
    category: "Garage",
    date: "2025-10-01",
    tags: ["door", "concrete"],
  },
  {
    id: "10",
    url: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800",
    inspection: "777 Ash Boulevard",
    category: "Attic",
    date: "2025-09-28",
    tags: ["insulation", "ventilation"],
  },
  {
    id: "11",
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    inspection: "999 Poplar Street",
    category: "Basement",
    date: "2025-09-25",
    tags: ["moisture", "walls"],
  },
  {
    id: "12",
    url: "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800",
    inspection: "111 Hickory Lane",
    category: "Deck",
    date: "2025-09-22",
    tags: ["wood", "railings"],
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
