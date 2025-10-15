import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Navigation } from "./Navigation";
import { ThemeToggle } from "./ThemeToggle";
import logo from "@/assets/logo.png";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-card border-b border-border shadow-card">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <img src="/lovable-uploads/baf6cbbd-4a8c-4a90-8e3d-674c6327dab6.png" alt="GradeMyBuilding" className="h-20 w-auto" />
        </div>
        <Navigation activeTab={activeTab} onTabChange={onTabChange} />
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="sm">
          <Bell className="h-5 w-5" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}