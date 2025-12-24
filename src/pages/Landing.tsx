import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/Layout/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Search, Building2, ClipboardCheck, Award, Shield, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import logoWhite from "@/assets/logo-white.png";
import logoColor from "@/assets/logo-color.png";
import heroBuilding from "@/assets/hero-building.jpg";

const features = [
  {
    icon: ClipboardCheck,
    title: "Comprehensive Inspections",
    description: "Detailed building assessments covering structure, systems, and safety.",
    grade: "A+",
  },
  {
    icon: Building2,
    title: "All Property Types",
    description: "Residential, commercial, industrial - we grade them all.",
    grade: "A",
  },
  {
    icon: Award,
    title: "Certified Reports",
    description: "Official grading reports recognized by industry professionals.",
    grade: "A+",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "Identify potential issues before they become costly problems.",
    grade: "B+",
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/search");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left Nav Links */}
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => navigate("/search")}
                className="text-white hover:text-white/80 font-medium transition-colors"
              >
                Search Grades
              </button>
              <button 
                onClick={() => navigate("/pricing")}
                className="text-white hover:text-white/80 font-medium transition-colors"
              >
                Pricing
              </button>
            </nav>

            {/* Center Logo */}
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <img 
                src={logoWhite} 
                alt="GradeMyBuilding" 
                className="h-10 md:h-14 w-auto object-contain"
              />
            </div>

            {/* Right Nav Links */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                variant="outline"
                onClick={() => navigate("/auth")}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroBuilding} 
            alt="Modern building" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Inspect.<br />
              Grade.<br />
              Trust.
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Professional building inspection and grading for informed decisions.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-xl">
              <div className="flex items-center bg-white rounded-lg shadow-xl overflow-hidden">
                <input
                  type="text"
                  placeholder="Enter an address, city, or ZIP code"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-5 py-4 text-foreground bg-white placeholder:text-muted-foreground focus:outline-none text-base"
                />
                <button 
                  type="submit"
                  className="px-5 py-4 bg-white hover:bg-muted transition-colors"
                >
                  <Search className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Grade Your Building?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Make informed decisions with professional building assessments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-2xl font-bold text-primary">{feature.grade}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of property professionals who trust GradeMyBuilding
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8"
            >
              Start Free Trial
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate("/pricing")}
              className="text-lg px-8"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <img 
              src={resolvedTheme === 'dark' ? logoWhite : logoColor} 
              alt="GradeMyBuilding" 
              className="h-8 w-auto object-contain"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GradeMyBuilding. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </button>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </button>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
