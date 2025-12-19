import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, FileText, Plus, Copy } from "lucide-react";

const mockTemplates = [
  {
    id: "1",
    name: "Residential Single-Family",
    description: "Standard inspection template for single-family homes",
    buildingType: "Residential",
    itemsCount: 45,
    isPublic: true,
  },
  {
    id: "2",
    name: "Commercial Office Building",
    description: "Comprehensive template for office building inspections",
    buildingType: "Commercial",
    itemsCount: 67,
    isPublic: false,
  },
  {
    id: "3",
    name: "Multi-Unit Residential",
    description: "Template for apartments and condominiums",
    buildingType: "Multi-Family",
    itemsCount: 52,
    isPublic: true,
  },
];

export default function TemplatesManager() {
  return (
    <div className="p-4 space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Inspection Templates</h1>
          <p className="text-sm text-muted-foreground">Quick-start templates for faster inspections</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {mockTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="truncate">{template.name}</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{template.description}</CardDescription>
                </div>
                {template.isPublic && <Badge variant="secondary" className="text-xs flex-shrink-0">Public</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 pt-0">
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                  {template.buildingType}
                </div>
                <div>{template.itemsCount} items</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm">
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Use Template
                </Button>
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Edit</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
