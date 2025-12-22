import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, MapPin, Loader2, AlertCircle } from "lucide-react";
import { useInspections } from "@/hooks/useInspections";
import { format } from "date-fns";

export function RecentInspections() {
  const { inspections, loading, error } = useInspections();

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in_progress':
      case 'draft':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return '';
    switch (grade) {
      case 'A': return 'text-emerald-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      case 'F': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  // Show only the 5 most recent inspections
  const recentInspections = inspections.slice(0, 5);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Recent Inspections
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-6 w-6 text-destructive mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : recentInspections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No inspections yet</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {recentInspections.map((inspection) => (
              <div
                key={inspection.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 sm:p-4 border border-border rounded-lg hover:shadow-card transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                    <p className="font-medium text-xs sm:text-sm truncate">
                      {inspection.properties?.address || 'Unknown Address'}
                      {inspection.properties?.city && `, ${inspection.properties.city}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Badge variant="outline" className={`${getStatusColor(inspection.status)} text-xs`}>
                      {inspection.status?.replace('_', ' ') || 'unknown'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {inspection.properties?.property_type || 'Unknown Type'}
                    </span>
                    {inspection.final_grade_numeric && (
                      <span className={`text-xs font-medium ${getGradeColor(inspection.final_grade_letter)}`}>
                        Score: {inspection.final_grade_numeric.toFixed(0)}%
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(inspection.inspection_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="self-end sm:self-auto">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}