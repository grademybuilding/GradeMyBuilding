import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Navigation } from "./Navigation";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import logoWhite from "@/assets/logo-white.png";
import logoColor from "@/assets/logo-color.png";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { profile, signOut } = useAuth();
  const { resolvedTheme } = useTheme();

  return (
    <>
      {/* Top Header - Desktop/Tablet */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-card border-b border-border shadow-card">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2 relative">
            {/* Render both logos and use CSS to toggle visibility - prevents reload on route change */}
            <img 
              src={logoColor} 
              alt="GradeMyBuilding" 
              className={`h-12 md:h-16 lg:h-20 w-auto object-contain transition-opacity duration-200 ${resolvedTheme === 'dark' ? 'opacity-0 absolute' : 'opacity-100'}`}
            />
            <img 
              src={logoWhite} 
              alt="GradeMyBuilding" 
              className={`h-12 md:h-16 lg:h-20 w-auto object-contain transition-opacity duration-200 ${resolvedTheme === 'dark' ? 'opacity-100' : 'opacity-0 absolute'}`}
            />
          </div>
          {/* Navigation - Hidden on mobile, shown on md+ */}
          <div className="hidden md:block">
            <Navigation activeTab={activeTab} onTabChange={onTabChange} />
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="h-8 w-8 md:h-9 md:w-9">
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg safe-area-bottom">
        <Navigation activeTab={activeTab} onTabChange={onTabChange} isMobile />
      </nav>
    </>
  );
}
