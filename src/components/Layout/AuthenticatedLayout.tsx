import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Header } from "./Header";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  const getActiveTab = () => {
    const path = location.pathname.replace('/', '');
    return path === '' ? 'dashboard' : path;
  };

  const handleTabChange = (tab: string) => {
    navigate(`/${tab === 'dashboard' ? 'dashboard' : tab}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header activeTab={getActiveTab()} onTabChange={handleTabChange} />
        <main className="flex-1 overflow-y-auto bg-muted/30 pb-20 md:pb-0">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header activeTab={getActiveTab()} onTabChange={handleTabChange} />
      <main className="flex-1 overflow-y-auto bg-muted/30 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
