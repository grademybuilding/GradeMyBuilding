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
    <nav className="bg-card border-r border-border h-full">
      <div className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-card"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}