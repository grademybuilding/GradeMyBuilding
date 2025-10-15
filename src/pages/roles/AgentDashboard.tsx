import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Share2, Users, Eye, Link } from "lucide-react";

interface AgentDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const mockPortfolio = [
  {
    id: "1",
    property: "123 Main Street",
    grade: "A",
    client: "John Doe",
    shared: true,
    shareCount: 5,
  },
  {
    id: "2",
    property: "456 Oak Avenue",
    grade: "B+",
    client: "Jane Smith",
    shared: false,
    shareCount: 0,
  },
];

export default function AgentDashboard({ activeTab }: AgentDashboardProps) {
  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Real Estate Agent Dashboard</h1>
        <p className="text-muted-foreground">Client properties and shareable reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Client Properties" value="24" icon={Building} />
        <StatsCard title="Active Shares" value="12" icon={Share2} variant="success" />
        <StatsCard title="Clients" value="18" icon={Users} variant="accent" />
        <StatsCard title="Avg Grade" value="B+" icon={Eye} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Client Portfolio</h2>
          <Button>
            <Share2 className="h-4 w-4 mr-2" />
            Create Share Link
          </Button>
        </div>
        {mockPortfolio.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {property.property}
                  </CardTitle>
                  <CardDescription>Client: {property.client}</CardDescription>
                </div>
                <Badge variant="default" className="text-lg font-bold px-4 py-2">
                  Grade {property.grade}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {property.shared && (
                    <Badge variant="secondary">
                      <Share2 className="h-3 w-3 mr-1" />
                      {property.shareCount} shares
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm">
                    <Link className="h-4 w-4 mr-2" />
                    Generate Link
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
