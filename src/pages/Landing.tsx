import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/Layout/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import logoWhite from "@/assets/logo-white.png";
import logoColor from "@/assets/logo-color.png";
import heroStreetHomes from "@/assets/hero-street-homes.jpg";
import featureResidential from "@/assets/feature-residential.jpg";
import featureCommercial from "@/assets/feature-commercial.jpg";
import featureMultifamily from "@/assets/feature-multifamily.jpg";
import personaInspector from "@/assets/persona-inspector.jpg";
import personaSeller from "@/assets/persona-seller.jpg";
import personaBuyer from "@/assets/persona-buyer.jpg";
import personaAppraiser from "@/assets/persona-appraiser.jpg";

const features = [
  {
    image: featureResidential,
    title: "Residential Homes",
    description: "Single-family homes, townhouses, and condos graded for quality, safety, and condition.",
    grade: "A+",
  },
  {
    image: featureCommercial,
    title: "Commercial Buildings",
    description: "Office buildings, retail spaces, and industrial properties assessed professionally.",
    grade: "A",
  },
  {
    image: featureMultifamily,
    title: "Multi-Family Properties",
    description: "Apartment complexes and multi-unit buildings evaluated comprehensively.",
    grade: "A+",
  },
];

const personas = [
  {
    image: personaInspector,
    title: "Building Inspector",
    benefits: [
      "Increased Inspection Volume",
      "Faster, Smarter Inspections",
      "All-in-One Mobile App",
    ],
  },
  {
    image: personaSeller,
    title: "Seller & Seller Agent",
    description: "A better building health score/grade justifies a higher asking price and attracts serious buyers.",
  },
  {
    image: personaBuyer,
    title: "Buyer & Buyer Agent",
    description: "Access a clear, pre-certified, and graded building before making an offer—no surprises, no stress.",
  },
  {
    image: personaAppraiser,
    title: "Appraiser, Lender & Underwriter",
    description: "An integrated scoring & grading system increases confidence among buyers, underwriters, and lenders.",
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
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Left Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => navigate("/search")}
                className="text-white hover:text-white/80 font-medium text-lg transition-colors"
              >
                Search Grades
              </button>
              <button 
                onClick={() => navigate("/pricing")}
                className="text-white hover:text-white/80 font-medium text-lg transition-colors"
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
                className="h-14 md:h-20 w-auto object-contain"
              />
            </div>

            {/* Right Nav Links */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white text-lg px-6"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section className="relative h-[85vh] min-h-[700px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroStreetHomes} 
            alt="Homes on a street" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Inspect.<br />
              Grade.<br />
              Trust.
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10">
              Professional building inspection and grading for informed decisions.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <div className="flex items-center bg-white rounded-xl shadow-2xl overflow-hidden">
                <input
                  type="text"
                  placeholder="Enter an address, city, or ZIP code"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-6 py-5 text-foreground bg-white placeholder:text-muted-foreground focus:outline-none text-lg"
                />
                <button 
                  type="submit"
                  className="px-6 py-5 bg-primary hover:bg-primary/90 transition-colors"
                >
                  <Search className="h-6 w-6 text-primary-foreground" />
                </button>
              </div>
            </form>
          </div>
          {/* Second Row - Personas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {personas.map((persona, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-border hover:border-primary/50 cursor-pointer bg-muted/30">
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={persona.image} 
                    alt={persona.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {persona.title}
                  </h3>
                  {persona.benefits ? (
                    <ul className="space-y-1">
                      {persona.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-muted-foreground text-sm">
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {persona.description}
                    </p>
                  )}
                  <Button 
                    className="mt-4"
                    size="sm"
                    onClick={() => navigate("/auth")}
                  >
                    read more
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Images */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              We Grade All Property Types
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Professional building assessments for residential, commercial, and multi-family properties
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-border hover:border-primary/50 cursor-pointer">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-2xl shadow-lg">
                    {feature.grade}
                  </div>
                </div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground text-xl mb-10 max-w-3xl mx-auto">
            Join thousands of property professionals who trust GradeMyBuilding for accurate, reliable building assessments
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-xl px-10 py-6 h-auto"
            >
              Start Free Trial
              <ChevronRight className="ml-2 h-6 w-6" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate("/pricing")}
              className="text-xl px-10 py-6 h-auto"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <img 
              src={resolvedTheme === 'dark' ? logoWhite : logoColor} 
              alt="GradeMyBuilding" 
              className="h-12 w-auto object-contain"
            />
          </div>
          <p className="text-base text-muted-foreground">
            © {new Date().getFullYear()} GradeMyBuilding. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <button className="text-base text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </button>
            <button className="text-base text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </button>
            <button className="text-base text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
