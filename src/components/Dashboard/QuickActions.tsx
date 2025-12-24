import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Camera, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const quickActions = [
  {
    id: 'new-inspection',
    title: 'New Inspection',
    description: 'Start a new building inspection',
    icon: Plus,
    variant: 'default' as const,
    path: '/new-inspection'
  },
  {
    id: 'search-property',
    title: 'Search Property',
    description: 'Find existing property records',
    icon: Search,
    variant: 'secondary' as const,
    path: '/properties'
  },
  {
    id: 'generate-report',
    title: 'Generate Report',
    description: 'Create inspection report',
    icon: FileText,
    variant: 'secondary' as const,
    path: '/reports'
  },
  {
    id: 'take-photo',
    title: 'Take Photo',
    description: 'Capture inspection photos',
    icon: Camera,
    variant: 'secondary' as const,
    path: '/photos'
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant={action.variant}
                size="sm"
                className="h-8 px-3 gap-1.5 text-xs font-medium"
                onClick={() => navigate(action.path)}
              >
                <Icon className="h-3.5 w-3.5" />
                {action.title}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}