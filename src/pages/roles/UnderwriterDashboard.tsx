import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, TrendingDown, Eye, FileText } from "lucide-react";

interface UnderwriterDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const mockApplications = [
  {
    id: "1",
    property: "123 Main Street",
    grade: "A",
    risk_score: 15,
    risk_level: "low",
    decision: "approved",
    amount: 450000,
  },
  {
    id: "2",
    property: "456 Oak Avenue",
    grade: "D",
    risk_score: 72,
    risk_level: "high",
    decision: null,
    amount: 320000,
  },
];

export default function UnderwriterDashboard({ activeTab }: UnderwriterDashboardProps) {
  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Underwriter Dashboard</h1>
        <p className="text-muted-foreground">Risk analysis and loan application review</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Pending Review" value="8" icon={Clock} variant="accent" />
        <StatsCard title="Approved" value="156" icon={CheckCircle} variant="success" />
        <StatsCard title="High Risk" value="12" icon={AlertTriangle} />
        <StatsCard title="Avg Risk Score" value="32" icon={TrendingDown} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Loan Applications</h2>
        {mockApplications.map((app) => (
          <Card key={app.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{app.property}</CardTitle>
                  <CardDescription>
                    Loan Amount: ${app.amount.toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="font-bold">
                    Grade {app.grade}
                  </Badge>
                  {app.decision && (
                    <Badge variant={app.decision === 'approved' ? 'default' : 'destructive'}>
                      {app.decision}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Risk Score</div>
                      <div className="text-2xl font-bold">{app.risk_score}</div>
                    </div>
                    <Badge 
                      variant={
                        app.risk_level === 'low' ? 'default' :
                        app.risk_level === 'medium' ? 'secondary' : 'destructive'
                      }
                    >
                      {app.risk_level} risk
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                  {!app.decision && (
                    <Button size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Decide
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
