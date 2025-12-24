import { Header } from "@/components/Layout/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import PhotoGallery from "@/components/Inspector/PhotoGallery";

export default function Photos() {
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  const handleTabChange = (tab: string) => {
    navigate(`/${tab === 'dashboard' ? 'dashboard' : tab}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header activeTab="photos" onTabChange={handleTabChange} />
      <main className="flex-1 overflow-y-auto bg-muted/30 pb-20 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8">
          <PhotoGallery />
        </div>
      </main>
    </div>
  );
}
