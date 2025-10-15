import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Shield, Activity, Settings, CheckCircle, Clock } from "lucide-react";

interface AdminDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const mockUsers = [
  {
    id: "1",
    name: "John Inspector",
    email: "john@example.com",
    role: "inspector",
    verified: true,
    license: "INS-12345",
  },
  {
    id: "2",
    name: "Jane Appraiser",
    email: "jane@example.com",
    role: "appraiser",
    verified: false,
    license: "APP-67890",
  },
];

export default function AdminDashboard({ activeTab }: AdminDashboardProps) {
  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System management and oversight</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value="247" icon={Users} />
        <StatsCard title="Verified" value="189" icon={CheckCircle} variant="success" />
        <StatsCard title="Pending" value="58" icon={Clock} variant="accent" />
        <StatsCard title="System Health" value="98%" icon={Activity} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{user.license}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.verified ? (
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Inspections Today</span>
                <span className="font-medium">43</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reports Generated</span>
                <span className="font-medium">28</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">API Calls</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Storage Used</span>
                <span className="font-medium">12.4 GB</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
