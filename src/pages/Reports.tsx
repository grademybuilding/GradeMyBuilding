import { AuthenticatedLayout } from "@/components/Layout/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Reports() {
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
    <AuthenticatedLayout>
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
    </AuthenticatedLayout>
  );
}
