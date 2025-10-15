import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, DollarSign, TrendingUp, FileText, Eye } from "lucide-react";

interface AppraiserDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const mockValuations = [
  {
    id: "1",
    property: "123 Main Street",
    inspection_grade: "A",
    estimated_value: 450000,
    market_value: 475000,
    status: "completed",
  },
  {
    id: "2",
    property: "456 Oak Avenue",
    inspection_grade: "B",
    estimated_value: 320000,
    market_value: null,
    status: "in_progress",
  },
];

export default function AppraiserDashboard({ activeTab }: AppraiserDashboardProps) {
  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Appraiser Dashboard</h1>
        <p className="text-muted-foreground">Property valuations with grade-based adjustments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Valuations" value="43" icon={Building} />
        <StatsCard title="This Month" value="8" icon={FileText} variant="success" />
        <StatsCard title="Avg Value" value="$385K" icon={DollarSign} variant="accent" />
        <StatsCard title="Grade Impact" value="+12%" icon={TrendingUp} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Valuations</h2>
        {mockValuations.map((valuation) => (
          <Card key={valuation.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {valuation.property}
                  </CardTitle>
                  <CardDescription>Grade: {valuation.inspection_grade}</CardDescription>
                </div>
                <Badge variant={valuation.status === 'completed' ? 'default' : 'secondary'}>
                  {valuation.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Estimated Value</div>
                  <div className="text-2xl font-bold">
                    ${valuation.estimated_value.toLocaleString()}
                  </div>
                  {valuation.market_value && (
                    <div className="text-sm text-muted-foreground">
                      Market: ${valuation.market_value.toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm">
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
