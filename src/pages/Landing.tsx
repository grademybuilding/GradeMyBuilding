import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/Layout/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Seo } from "@/components/SEO/Seo";
import logoWhite from "@/assets/logo-white.png";
import logoColor from "@/assets/logo-color.png";
import heroStreetHomes from "@/assets/hero-street-homes.jpg";
import personaInspector from "@/assets/persona-inspector.jpg";
import personaSeller from "@/assets/persona-seller.jpg";
import personaBuyer from "@/assets/persona-buyer.jpg";
import personaAppraiser from "@/assets/persona-appraiser.jpg";

const personas = [
  {
    image: personaInspector,
    title: "Building Inspector",
    description: "Increase inspection volume with faster, smarter inspections using our all-in-one mobile app.",
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

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="GradeMyBuilding — Inspect. Grade. Trust."
        description="Professional building inspections and A+ to F grading for inspectors, agents, appraisers, and owners. Streamline inspections and share trusted results."
        path="/"
      />
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
                Search Building Grades
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

      <main>
      {/* Hero Section with Background Image */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center">
        {/* Background Video */}
        <div className="absolute inset-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/Building_Grades_Pop_Up_Video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight whitespace-nowrap">
              Inspect. Grade. Trust.
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Professional building inspection and grading for informed decisions.
            </p>

            {/* CTA Button */}
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-xl px-10 py-6 h-auto"
            >
              Start Free Trial
              <ChevronRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="pt-6 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-8">
            Who We Serve
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {personas.map((persona, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50 bg-muted/30">
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={persona.image} 
                    alt={persona.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {persona.title}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {persona.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
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
      </main>

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
            <button 
              onClick={() => navigate("/contact")}
              className="text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
