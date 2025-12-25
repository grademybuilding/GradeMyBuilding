import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { AuthenticatedLayout } from "@/components/Layout/AuthenticatedLayout";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Search from "./pages/Search";
import Pricing from "./pages/Pricing";
import AppPricing from "./pages/AppPricing";
import Contact from "./pages/Contact";
import Inspections from "./pages/Inspections";
import Properties from "./pages/Properties";
import Photos from "./pages/Photos";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NewInspectionPage from "./pages/NewInspectionPage";
import NotFound from "./pages/NotFound";
import logoWhite from "@/assets/logo-white.png";
import logoColor from "@/assets/logo-color.png";

const queryClient = new QueryClient();

function AppAssetPreload() {
  // Preload critical images once to avoid any re-fetching/jank on route changes.
  useEffect(() => {
    const imgs = [logoColor, logoWhite].map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    return () => {
      // keep existing code (no cleanup needed)
      void imgs;
    };
  }, []);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppAssetPreload />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/search" element={<Search />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />

            {/* Authenticated area (layout mounts once, persists across route changes) */}
            <Route element={<AuthenticatedLayout />}>
              <Route path="/dashboard" element={<Index />} />
              <Route path="/inspections" element={<Inspections />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/photos" element={<Photos />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/new-inspection" element={<NewInspectionPage />} />
              {/* Pricing inside authenticated layout so header stays mounted */}
              <Route path="/app/pricing" element={<AppPricing />} />
              {/* Optional convenience: redirect /app -> /dashboard if you add /app later */}
              <Route path="/app" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
