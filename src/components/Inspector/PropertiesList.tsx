import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, MapPin, Calendar, FileText, Eye, Plus, Search, Home } from "lucide-react";

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
    lastGrade: "A",
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
    lastGrade: "B",
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
    lastGrade: "C",
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
    lastGrade: "A",
  },
  {
    id: "5",
    address: "555 Cedar Lane",
    city: "Fresno",
    state: "CA",
    zipCode: "93701",
    propertyType: "Residential",
    yearBuilt: 1998,
    squareFootage: 3200,
    inspectionCount: 4,
    lastInspection: "2024-01-02",
    lastGrade: "D",
  },
  {
    id: "6",
    address: "777 Tech Park",
    city: "Palo Alto",
    state: "CA",
    zipCode: "94301",
    propertyType: "Commercial",
    yearBuilt: 2018,
    squareFootage: 25000,
    inspectionCount: 2,
    lastInspection: "2023-12-28",
    lastGrade: "A",
  },
];

interface PropertiesListProps {
  onTabChange?: (tab: string) => void;
}

export default function PropertiesList({ onTabChange }: PropertiesListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProperties = mockProperties.filter((property) => {
    const query = searchQuery.toLowerCase();
    return (
      property.address.toLowerCase().includes(query) ||
      property.city.toLowerCase().includes(query) ||
      property.state.toLowerCase().includes(query) ||
      property.zipCode.includes(query) ||
      property.propertyType.toLowerCase().includes(query) ||
      property.lastGrade.toLowerCase().includes(query)
    );
  });

  const getPropertyTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      Commercial: "default",
      Residential: "secondary",
      Industrial: "outline",
    };
    return variants[type] || "default";
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Properties Grade & History</h1>
          <p className="text-sm text-muted-foreground">Available for public search</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>

      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by address, city, grade..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-lg">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No properties found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms</p>
          </div>
        ) : null}
        {filteredProperties.map((property) => (
          <Card key={property.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-primary/10 flex-shrink-0">
                    <Home className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{property.address}</h3>
                      <Badge variant={getPropertyTypeBadge(property.propertyType)} className="text-xs">
                        {property.propertyType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{property.city}, {property.state} {property.zipCode}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground pt-1 sm:pt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Built {property.yearBuilt}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{property.squareFootage.toLocaleString()} sq ft</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{property.inspectionCount} inspections</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <Badge 
                    variant="default" 
                    className="text-base sm:text-lg font-bold px-3 py-1 text-center"
                  >
                    Grade {property.lastGrade}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-initial gap-1 text-xs sm:text-sm">
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 sm:flex-initial gap-1 text-xs sm:text-sm"
                      onClick={() => onTabChange?.('new-inspection')}
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                      New Inspection
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
