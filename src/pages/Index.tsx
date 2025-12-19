import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Layout/Header";
import { useAuth } from "@/hooks/useAuth";
import InspectorDashboard from "@/pages/roles/InspectorDashboard";
import AppraiserDashboard from "@/pages/roles/AppraiserDashboard";
import AgentDashboard from "@/pages/roles/AgentDashboard";
import AssessorDashboard from "@/pages/roles/AssessorDashboard";
import UnderwriterDashboard from "@/pages/roles/UnderwriterDashboard";
import AdminDashboard from "@/pages/roles/AdminDashboard";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, profile, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return null;
  }

  const renderContent = () => {
    switch (profile.role) {
      case 'inspector':
        return <InspectorDashboard activeTab={activeTab} onTabChange={setActiveTab} />;
      case 'appraiser':
        return <AppraiserDashboard activeTab={activeTab} onTabChange={setActiveTab} />;
      case 'real_estate_agent':
        return <AgentDashboard activeTab={activeTab} onTabChange={setActiveTab} />;
      case 'assessor':
        return <AssessorDashboard activeTab={activeTab} onTabChange={setActiveTab} />;
      case 'underwriter':
        return <UnderwriterDashboard activeTab={activeTab} onTabChange={setActiveTab} />;
      case 'admin':
        return <AdminDashboard activeTab={activeTab} onTabChange={setActiveTab} />;
      default:
        return <InspectorDashboard activeTab={activeTab} onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto bg-muted/30 pb-20 md:pb-0">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
