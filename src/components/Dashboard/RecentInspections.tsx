import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, MapPin } from "lucide-react";

interface Inspection {
  id: string;
  propertyAddress: string;
  date: string;
  status: 'completed' | 'in-progress' | 'scheduled';
  type: string;
  score?: number;
}

const mockInspections: Inspection[] = [
  {
    id: '1',
    propertyAddress: '123 Oak Street, Downtown',
    date: '2024-01-15',
    status: 'completed',
    type: 'Commercial',
    score: 87
  },
  {
    id: '2',
    propertyAddress: '456 Pine Avenue, Midtown',
    date: '2024-01-14',
    status: 'completed',
    type: 'Residential',
    score: 92
  },
  {
    id: '3',
    propertyAddress: '789 Maple Drive, Uptown',
    date: '2024-01-16',
    status: 'scheduled',
    type: 'Industrial'
  },
];

export function RecentInspections() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'scheduled':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Recent Inspections
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 sm:space-y-4">
          {mockInspections.map((inspection) => (
            <div
              key={inspection.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 sm:p-4 border border-border rounded-lg hover:shadow-card transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <p className="font-medium text-xs sm:text-sm truncate">
                    {inspection.propertyAddress}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Badge variant="outline" className={`${getStatusColor(inspection.status)} text-xs`}>
                    {inspection.status.replace('-', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {inspection.type}
                  </span>
                  {inspection.score && (
                    <span className="text-xs font-medium text-accent">
                      Score: {inspection.score}%
                    </span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="self-end sm:self-auto">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}