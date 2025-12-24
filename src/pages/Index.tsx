import { AuthenticatedLayout } from "@/components/Layout/AuthenticatedLayout";
import { useAuth } from "@/hooks/useAuth";
import InspectorDashboard from "@/pages/roles/InspectorDashboard";
import AppraiserDashboard from "@/pages/roles/AppraiserDashboard";
import AgentDashboard from "@/pages/roles/AgentDashboard";
import AssessorDashboard from "@/pages/roles/AssessorDashboard";
import UnderwriterDashboard from "@/pages/roles/UnderwriterDashboard";
import AdminDashboard from "@/pages/roles/AdminDashboard";

const Index = () => {
  const { profile } = useAuth();

  const handleTabChange = (tab: string) => {
    // Navigation is now handled by the Navigation component directly
  };

  const renderContent = () => {
    switch (profile?.role) {
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
    <AuthenticatedLayout>
      {renderContent()}
    </AuthenticatedLayout>
  );
};

export default Index;
