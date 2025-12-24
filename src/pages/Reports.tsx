import { Header } from "@/components/Layout/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Reports() {
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  const handleTabChange = (tab: string) => {
    navigate(`/${tab === 'dashboard' ? 'dashboard' : tab}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const reportTypes = [
    {
      title: "Monthly Summary",
      description: "Overview of all inspections completed this month",
      icon: Calendar,
      action: "Generate"
    },
    {
      title: "Grade Distribution",
      description: "Analysis of property grades across all inspections",
      icon: BarChart3,
      action: "Generate"
    },
    {
      title: "Inspection Details",
      description: "Detailed report for individual inspections",
      icon: FileText,
      action: "Select & Generate"
    },
    {
      title: "Export All Data",
      description: "Download all inspection data in CSV format",
      icon: Download,
      action: "Export"
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header activeTab="reports" onTabChange={handleTabChange} />
      <main className="flex-1 overflow-y-auto bg-muted/30 pb-20 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Generate and download inspection reports</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((report, index) => {
              const IconComponent = report.icon;
              return (
                <Card key={index} className="hover:shadow-elevated transition-shadow">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">{report.action}</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
