import { useState } from "react";
import { NewInspection } from "@/pages/NewInspection";
import { Dashboard } from "@/pages/Dashboard";
import InspectionsList from "@/components/Inspector/InspectionsList";
import TemplatesManager from "@/components/Inspector/TemplatesManager";
import PhotoGallery from "@/components/Inspector/PhotoGallery";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { Building, CheckCircle, Clock, TrendingUp } from "lucide-react";

interface InspectorDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function InspectorDashboard({ activeTab, onTabChange }: InspectorDashboardProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={onTabChange} />;
      case 'new-inspection':
        return <NewInspection onBack={() => onTabChange('dashboard')} />;
      case 'inspections':
        return <InspectionsList />;
      case 'templates':
        return <TemplatesManager />;
      case 'photos':
        return <PhotoGallery />;
      case 'reports':
        return (
          <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold">Reports</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Total Reports" value="127" icon={Building} />
              <StatsCard title="This Month" value="18" icon={CheckCircle} variant="success" />
              <StatsCard title="Pending" value="5" icon={Clock} variant="accent" />
              <StatsCard title="Avg Grade" value="B+" icon={TrendingUp} />
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-4">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Inspector preferences and configuration</p>
          </div>
        );
      default:
        return <Dashboard onTabChange={onTabChange} />;
    }
  };

  return renderContent();
}
