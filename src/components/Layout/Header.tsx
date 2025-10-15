import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Navigation } from "./Navigation";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { RoleBadge } from "@/components/Auth/RoleBadge";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const initials = user?.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <header className="flex items-center justify-between p-4 bg-card border-b border-border shadow-card">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <img src="/lovable-uploads/baf6cbbd-4a8c-4a90-8e3d-674c6327dab6.png" alt="GradeMyBuilding" className="h-20 w-auto" />
        </div>
        <Navigation activeTab={activeTab} onTabChange={onTabChange} />
      </div>
      
      <div className="flex items-center gap-4">
        {user && <RoleBadge role={user.role} verified={user.credentials_verified} />}
        <ThemeToggle />
        <Button variant="ghost" size="sm">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}