import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Calendar, MapPin, FileText, Eye } from "lucide-react";
import { QuickActions } from "@/components/Dashboard/QuickActions";

const mockInspections = [
  {
    id: "1",
    property: "123 Main Street",
    city: "San Francisco, CA",
    date: "2025-10-20",
    status: "completed",
    grade: "A",
    type: "Residential",
  },
  {
    id: "2",
    property: "456 Oak Avenue",
    city: "Los Angeles, CA",
    date: "2025-10-18",
    status: "completed",
    grade: "B",
    type: "Commercial",
  },
  {
    id: "3",
    property: "789 Pine Road",
    city: "San Diego, CA",
    date: "2025-10-15",
    status: "completed",
    grade: "C",
    type: "Residential",
  },
  {
    id: "4",
    property: "321 Industrial Blvd",
    city: "Oakland, CA",
    date: "2025-10-12",
    status: "completed",
    grade: "A",
    type: "Industrial",
  },
  {
    id: "5",
    property: "555 Retail Plaza",
    city: "San Jose, CA",
    date: "2025-10-10",
    status: "completed",
    grade: "D",
    type: "Commercial",
  },
  {
    id: "6",
    property: "888 Maple Drive",
    city: "Sacramento, CA",
    date: "2025-10-08",
    status: "in_progress",
    grade: null,
    type: "Residential",
  },
];

interface InspectionsListProps {
  onTabChange?: (tab: string) => void;
}

export default function InspectionsList({ onTabChange }: InspectionsListProps) {
  return (
    <div className="p-4 space-y-6 animate-fade-in max-w-7xl mx-auto">
      <QuickActions onTabChange={onTabChange || (() => {})} />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">My Inspections</h1>
          <p className="text-sm text-muted-foreground">Manage and track your building inspections</p>
        </div>
      </div>

      <div className="grid gap-4">
        {mockInspections.map((inspection) => (
          <Card key={inspection.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Building className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="truncate">{inspection.property}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{inspection.city}</span>
                  </CardDescription>
                </div>
                {inspection.grade && (
                  <Badge variant="default" className="text-base sm:text-lg font-bold px-3 py-1 self-start sm:self-auto">
                    Grade {inspection.grade}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{new Date(inspection.date).toLocaleDateString()}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{inspection.type}</Badge>
                  <Badge 
                    variant={
                      inspection.status === 'completed' ? 'default' :
                      inspection.status === 'in_progress' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {inspection.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    View
                  </Button>
                  <Button variant="default" size="sm" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Report
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
