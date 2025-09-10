import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Camera, FileText } from "lucide-react";

interface QuickActionsProps {
  onTabChange: (tab: string) => void;
}

const quickActions = [
  {
    id: 'new-inspection',
    title: 'New Inspection',
    description: 'Start a new building inspection',
    icon: Plus,
    variant: 'default' as const
  },
  {
    id: 'search-property',
    title: 'Search Property',
    description: 'Find existing property records',
    icon: Search,
    variant: 'secondary' as const
  },
  {
    id: 'take-photo',
    title: 'Take Photo',
    description: 'Capture inspection photos',
    icon: Camera,
    variant: 'secondary' as const
  },
  {
    id: 'generate-report',
    title: 'Generate Report',
    description: 'Create inspection report',
    icon: FileText,
    variant: 'secondary' as const
  },
];

export function QuickActions({ onTabChange }: QuickActionsProps) {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const handleClick = action.id === 'new-inspection' 
              ? () => onTabChange('new-inspection')
              : () => console.log(`Clicked ${action.id}`);
              
            return (
              <Button
                key={action.id}
                variant={action.variant}
                className="h-auto p-4 flex flex-col items-center gap-2 text-center"
                onClick={handleClick}
              >
                <Icon className="h-6 w-6" />
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}