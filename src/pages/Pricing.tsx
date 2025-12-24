import { Check, Zap, Star, Crown, Rocket } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/Layout/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import logoWhite from "@/assets/logo-white.png";
import logoColor from "@/assets/logo-color.png";

const pricingPlans = [
  {
    name: "Free/Starter",
    price: "$0",
    priceLabel: "/month",
    icon: Zap,
    features: ["5 inspections/month", "Basic grading", "Limited storage"],
    popular: false,
  },
  {
    name: "Professional",
    price: "$29-49",
    priceLabel: "/month",
    icon: Star,
    features: ["Unlimited inspections", "Full grading algorithm", "Report generating", "Invoicing", "10GB storage"],
    popular: true,
  },
  {
    name: "Business",
    price: "$79-99",
    priceLabel: "/month",
    icon: Crown,
    features: ["Multi-user access", "Advanced reports", "API access", "50GB storage"],
    popular: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    priceLabel: "",
    icon: Rocket,
    features: ["Unlimited users", "Custom integrations", "SaaS Platform"],
    popular: false,
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-card border-b border-border">
        <div 
          className="flex items-center gap-2 relative cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <img 
            src={logoColor} 
            alt="GradeMyBuilding" 
            className={`h-12 md:h-16 w-auto object-contain transition-opacity duration-200 ${resolvedTheme === 'dark' ? 'opacity-0 absolute' : 'opacity-100'}`}
          />
          <img 
            src={logoWhite} 
            alt="GradeMyBuilding" 
            className={`h-12 md:h-16 w-auto object-contain transition-opacity duration-200 ${resolvedTheme === 'dark' ? 'opacity-100' : 'opacity-0 absolute'}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </header>

      <div className="p-4 md:p-6 lg:p-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include one-time payment with no recurring fees.
          </p>
        </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {pricingPlans.map((plan) => {
          const IconComponent = plan.icon;
          return (
            <Card
              key={plan.name}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-elevated ${
                plan.popular
                  ? "border-primary border-t-4 shadow-lg scale-105"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {plan.name}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    {plan.priceLabel && (
                      <span className="text-muted-foreground">{plan.priceLabel}</span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-primary/90 hover:bg-primary"
                  }`}
                >
                  {plan.name === "Enterprise" ? "CONTACT US" : "GET STARTED"}
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Notes */}
      <div className="max-w-2xl mx-auto mt-16 space-y-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">1.</span> 14-day free trial on the Professional tier
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">2.</span> Usage-based add-ons for storage and team members
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">3.</span>{" "}
          <span className="font-semibold text-foreground">Annual discount</span> (20% off for yearly commitment)
        </p>
      </div>
      </div>
    </div>
  );
}
