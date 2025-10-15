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
    <div className="p-4 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inspection Templates</h1>
          <p className="text-muted-foreground">Quick-start templates for faster inspections</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {template.name}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                {template.isPublic && <Badge variant="secondary">Public</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {template.buildingType}
                </div>
                <div>{template.itemsCount} items</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
