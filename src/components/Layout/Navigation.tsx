import { Home, ClipboardCheck, Building, Camera, FileText, Settings, Receipt, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobile?: boolean;
}

const navItems = [
  { id: 'dashboard', label: 'Home', icon: Home, path: '/dashboard' },
  { id: 'inspections', label: 'Inspections', icon: ClipboardCheck, path: '/inspections' },
  { id: 'properties', label: 'Properties', icon: Building, path: '/properties' },
  { id: 'photos', label: 'Photos', icon: Camera, path: '/photos' },
  { id: 'invoices', label: 'Invoices', icon: Receipt, path: '/invoices' },
  { id: 'pricing', label: 'Pricing', icon: CreditCard, path: '/pricing' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export function Navigation({ activeTab, onTabChange, isMobile = false }: NavigationProps) {
  const navigate = useNavigate();

  const handleNavClick = (item: typeof navItems[0]) => {
    navigate(item.path);
    onTabChange(item.id);
  };

  if (isMobile) {
    return (
      <div className="flex items-center justify-around px-2 py-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[48px] transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-full transition-all duration-200",
                isActive && "bg-primary/10"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  isActive && "scale-110"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium truncate max-w-[56px]",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Desktop/Tablet Navigation
  return (
    <nav className="flex items-center gap-1 max-w-4xl mx-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden lg:block">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
