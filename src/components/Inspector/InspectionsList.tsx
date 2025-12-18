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
    status: "in_progress",
    grade: null,
    type: "Commercial",
  },
  {
    id: "3",
    property: "789 Pine Road",
    city: "San Diego, CA",
    date: "2025-10-15",
    status: "draft",
    grade: null,
    type: "Residential",
  },
];

interface InspectionsListProps {
  onTabChange?: (tab: string) => void;
}

export default function InspectionsList({ onTabChange }: InspectionsListProps) {
  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <QuickActions onTabChange={onTabChange || (() => {})} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Inspections</h1>
          <p className="text-muted-foreground">Manage and track your building inspections</p>
        </div>
      </div>

      <div className="grid gap-4">
        {mockInspections.map((inspection) => (
          <Card key={inspection.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {inspection.property}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {inspection.city}
                  </CardDescription>
                </div>
                {inspection.grade && (
                  <Badge variant="default" className="text-lg font-bold px-4 py-2">
                    Grade {inspection.grade}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(inspection.date).toLocaleDateString()}
                  </div>
                  <Badge variant="outline">{inspection.type}</Badge>
                  <Badge 
                    variant={
                      inspection.status === 'completed' ? 'default' :
                      inspection.status === 'in_progress' ? 'secondary' : 'outline'
                    }
                  >
                    {inspection.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="default" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
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
