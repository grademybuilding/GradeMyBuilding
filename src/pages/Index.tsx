import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { Navigation } from "@/components/Layout/Navigation";
import { Dashboard } from "@/pages/Dashboard";
import { NewInspection } from "@/pages/NewInspection";
import { cn } from "@/lib/utils";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={setActiveTab} />;
      case 'new-inspection':
        return <NewInspection onBack={() => setActiveTab('dashboard')} />;
      case 'inspections':
        return (
          <div className="p-4">
            <h1 className="text-2xl font-bold">Inspections</h1>
            <p className="text-muted-foreground">Manage your building inspections</p>
          </div>
        );
      case 'properties':
        return (
          <div className="p-4">
            <h1 className="text-2xl font-bold">Properties</h1>
            <p className="text-muted-foreground">Property database and records</p>
          </div>
        );
      case 'photos':
        return (
          <div className="p-4">
            <h1 className="text-2xl font-bold">Photos</h1>
            <p className="text-muted-foreground">Inspection photos and documentation</p>
          </div>
        );
      case 'reports':
        return (
          <div className="p-4">
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground">Generated inspection reports</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-4">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">App preferences and configuration</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto bg-muted/30">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
