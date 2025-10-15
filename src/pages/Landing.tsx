import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/Layout/ThemeToggle";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center space-y-8 px-4 animate-fade-in">
        {/* Logo */}
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-border/50">
          <img 
            src="/lovable-uploads/baf6cbbd-4a8c-4a90-8e3d-674c6327dab6.png" 
            alt="GradeMyBuilding" 
            className="h-32 w-auto md:h-40"
          />
        </div>

        {/* Tagline */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Inspect. Grade. Trust.
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl whitespace-nowrap">
            Building inspection management made simple
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            size="lg"
            onClick={() => navigate("/auth?tab=signup")}
            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Get Started
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => navigate("/auth")}
            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
    </div>
  );
};

export default Landing;
