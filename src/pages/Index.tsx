import { useEffect } from "react";
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
  const { profile, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  const handleTabChange = (tab: string) => {
    // Navigation is now handled by the Navigation component directly
  };

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
        return <InspectorDashboard activeTab="dashboard" onTabChange={handleTabChange} />;
      case 'appraiser':
        return <AppraiserDashboard activeTab="dashboard" onTabChange={handleTabChange} />;
      case 'real_estate_agent':
        return <AgentDashboard activeTab="dashboard" onTabChange={handleTabChange} />;
      case 'assessor':
        return <AssessorDashboard activeTab="dashboard" onTabChange={handleTabChange} />;
      case 'underwriter':
        return <UnderwriterDashboard activeTab="dashboard" onTabChange={handleTabChange} />;
      case 'admin':
        return <AdminDashboard activeTab="dashboard" onTabChange={handleTabChange} />;
      default:
        return <InspectorDashboard activeTab="dashboard" onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header activeTab="dashboard" onTabChange={handleTabChange} />
      <main className="flex-1 overflow-y-auto bg-muted/30 pb-20 md:pb-0">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
