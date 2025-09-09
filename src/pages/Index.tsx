import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { Dashboard } from "@/pages/Dashboard";
import { NewInspection } from "@/pages/NewInspection";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

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
    <div className="flex flex-col h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
