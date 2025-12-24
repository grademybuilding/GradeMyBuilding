import { Check, Zap, Star, Crown, Rocket } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/Layout/ThemeToggle";
import { useNavigate } from "react-router-dom";

const pricingPlans = [
  {
    name: "Starter",
    price: 7,
    credits: 1000,
    costPer1000: 7,
    icon: Zap,
    features: ["1,000 credits", "CSV or TXT export", "API access", "GDPR compliant"],
    popular: false,
  },
  {
    name: "Basic",
    price: 22,
    credits: 5000,
    costPer1000: 4.4,
    icon: Star,
    features: ["5,000 credits", "CSV or TXT export", "API access", "GDPR compliant"],
    popular: false,
  },
  {
    name: "Pro",
    price: 47,
    credits: 20000,
    costPer1000: 2.35,
    icon: Crown,
    features: ["20,000 credits", "CSV or TXT export", "API access", "GDPR compliant"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 97,
    credits: 50000,
    costPer1000: 1.94,
    icon: Rocket,
    features: ["50,000 credits", "CSV or TXT export", "API access", "GDPR compliant"],
    popular: false,
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate("/")}
            className="text-xl font-bold text-primary hover:opacity-80 transition-opacity"
          >
            BuildingGrade Pro
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
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
                        {plan.price}€
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">One time payment</p>
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
                    BUY NOW
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

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                      <span className="font-semibold text-foreground">{plan.costPer1000}€</span>
                      {" "}/ 1,000 credits
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            Need more credits?{" "}
            <button className="text-primary hover:underline font-medium">
              Contact us
            </button>{" "}
            for custom enterprise solutions.
          </p>
        </div>
      </main>
    </div>
  );
}
