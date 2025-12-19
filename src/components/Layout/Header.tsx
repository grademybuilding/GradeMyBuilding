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

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { profile, signOut } = useAuth();

  return (
    <>
      {/* Top Header - Desktop/Tablet */}
      <header className="flex items-center justify-between p-4 bg-card border-b border-border shadow-card">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/baf6cbbd-4a8c-4a90-8e3d-674c6327dab6.png" 
              alt="GradeMyBuilding" 
              className="h-12 md:h-16 lg:h-20 w-auto" 
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
