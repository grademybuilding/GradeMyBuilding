import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Download, BarChart3, FileSpreadsheet, Filter } from "lucide-react";

interface AssessorDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AssessorDashboard({ activeTab }: AssessorDashboardProps) {
  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Assessor Dashboard</h1>
        <p className="text-muted-foreground">Property assessments and analytics by jurisdiction</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Properties" value="1,247" icon={Building} />
        <StatsCard title="Avg Grade" value="B" icon={BarChart3} variant="success" />
        <StatsCard title="Districts" value="12" icon={Filter} variant="accent" />
        <StatsCard title="Exports" value="34" icon={FileSpreadsheet} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { grade: 'A', count: 187, percentage: 15 },
              { grade: 'B', count: 374, percentage: 30 },
              { grade: 'C', count: 498, percentage: 40 },
              { grade: 'D', count: 125, percentage: 10 },
              { grade: 'F', count: 63, percentage: 5 },
            ].map((item) => (
              <div key={item.grade} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Grade {item.grade}</span>
                  <span className="text-muted-foreground">{item.count} properties</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Export assessment data filtered by jurisdiction, grade, or property type
            </p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="h-4 w-4 mr-2" />
                Custom Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Exports</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">District 5 - Q4 2025</div>
                <div className="text-sm text-muted-foreground">Grade C and above • 234 properties</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Completed</Badge>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
