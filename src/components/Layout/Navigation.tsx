import { Home, ClipboardCheck, Building, Camera, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'inspections', label: 'Inspections', icon: ClipboardCheck },
  { id: 'properties', label: 'Properties', icon: Building },
  { id: 'photos', label: 'Photos', icon: Camera },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:block">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}