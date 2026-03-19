import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useMemo, useCallback } from "react";
import { Header } from "./Header";
import { AIChat } from "@/components/AIChat/AIChat";
import { PublicHeader } from "./PublicHeader";

export function AuthenticatedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, isAuthenticated } = useAuth();

  const isPricingRoute = location.pathname === "/pricing";

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPricingRoute) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, isPricingRoute, navigate]);

  const activeTab = useMemo(() => {
    const path = location.pathname.replace("/", "");
    return path === "" ? "dashboard" : path;
  }, [location.pathname]);

  const handleTabChange = useCallback(
    (tab: string) => {
      navigate(`/${tab === "dashboard" ? "dashboard" : tab}`);
    },
    [navigate]
  );

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        {isAuthenticated ? (
          <Header activeTab={activeTab} onTabChange={handleTabChange} />
        ) : isPricingRoute ? (
          <PublicHeader />
        ) : null}
        <main className="flex-1 overflow-y-auto bg-muted/30 pb-20 md:pb-0">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated && !isPricingRoute) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {isAuthenticated ? (
        <Header activeTab={activeTab} onTabChange={handleTabChange} />
      ) : (
        <PublicHeader />
      )}
      <main className="flex-1 overflow-y-auto bg-muted/30 pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
