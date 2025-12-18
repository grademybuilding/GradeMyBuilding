import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, MapPin, Calendar, FileText, Eye, Plus, Search, Home } from "lucide-react";
import { QuickActions } from "@/components/Dashboard/QuickActions";

const mockProperties = [
  {
    id: "1",
    address: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    propertyType: "Commercial",
    yearBuilt: 1985,
    squareFootage: 12500,
    inspectionCount: 3,
    lastInspection: "2024-01-15",
  },
  {
    id: "2",
    address: "456 Oak Avenue",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
    propertyType: "Residential",
    yearBuilt: 2010,
    squareFootage: 2800,
    inspectionCount: 1,
    lastInspection: "2024-01-10",
  },
  {
    id: "3",
    address: "789 Industrial Blvd",
    city: "Oakland",
    state: "CA",
    zipCode: "94601",
    propertyType: "Industrial",
    yearBuilt: 1972,
    squareFootage: 45000,
    inspectionCount: 5,
    lastInspection: "2024-01-08",
  },
  {
    id: "4",
    address: "321 Retail Plaza",
    city: "San Jose",
    state: "CA",
    zipCode: "95101",
    propertyType: "Commercial",
    yearBuilt: 2005,
    squareFootage: 8200,
    inspectionCount: 2,
    lastInspection: "2024-01-05",
  },
];

interface PropertiesListProps {
  onTabChange?: (tab: string) => void;
}

export default function PropertiesList({ onTabChange }: PropertiesListProps) {
  const getPropertyTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      Commercial: "default",
      Residential: "secondary",
      Industrial: "outline",
    };
    return variants[type] || "default";
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <QuickActions onTabChange={onTabChange || (() => {})} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Properties</h1>
          <p className="text-muted-foreground">Manage your property portfolio</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search properties..." className="pl-10" />
      </div>

      <div className="grid gap-4">
        {mockProperties.map((property) => (
          <Card key={property.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{property.address}</h3>
                      <Badge variant={getPropertyTypeBadge(property.propertyType)}>
                        {property.propertyType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{property.city}, {property.state} {property.zipCode}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Built {property.yearBuilt}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{property.squareFootage.toLocaleString()} sq ft</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{property.inspectionCount} inspections</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    className="gap-1"
                    onClick={() => onTabChange?.('new-inspection')}
                  >
                    <FileText className="h-4 w-4" />
                    New Inspection
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
