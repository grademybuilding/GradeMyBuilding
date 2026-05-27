import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Building2, FileCheck, Home, Briefcase, Calculator, Shield, ArrowLeft, ArrowRight, CheckCircle2, Check, X } from "lucide-react";
import { UserRole } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/Layout/ThemeToggle";
import { Seo } from "@/components/SEO/Seo";

const US_STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

const roleConfig = {
  inspector: {
    icon: Building2,
    label: "Inspector",
    description: "Conduct property inspections and generate reports",
    requiresLicense: true,
    requiresCompany: true,
  },
  appraiser: {
    icon: Calculator,
    label: "Appraiser",
    description: "Perform property valuations and appraisals",
    requiresLicense: true,
    requiresCompany: true,
  },
  real_estate_agent: {
    icon: Home,
    label: "Real Estate Agent",
    description: "Access inspections for client properties",
    requiresLicense: true,
    requiresCompany: true,
  },
  assessor: {
    icon: FileCheck,
    label: "Assessor",
    description: "Review properties for tax assessment purposes",
    requiresLicense: false,
    requiresCompany: true,
  },
  underwriter: {
    icon: Shield,
    label: "Underwriter",
    description: "Analyze risk for loan applications",
    requiresLicense: false,
    requiresCompany: true,
  },
  admin: {
    icon: Briefcase,
    label: "Administrator",
    description: "Manage system and verify credentials",
    requiresLicense: false,
    requiresCompany: false,
  },
};

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
  .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
  .regex(/[0-9]/, "Password must contain at least 1 number");

const signUpSchema = z.object({
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  password: passwordSchema,
  full_name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .regex(/^[a-zA-Z\s\-']+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  phone: z.string().optional(),
  role: z.enum(["inspector", "appraiser", "real_estate_agent", "assessor", "underwriter", "admin"]),
  company_name: z.string().min(2).max(100).optional(),
  company_email: z.string().email().optional().or(z.literal("")),
  license_number: z.string().min(3).optional().or(z.literal("")),
  license_state: z.string().length(2).optional().or(z.literal("")),
}).refine((data) => {
  const config = roleConfig[data.role as UserRole];
  if (config?.requiresCompany && !data.company_name) {
    return false;
  }
  if (config?.requiresLicense && (!data.license_number || !data.license_state)) {
    return false;
  }
  return true;
}, {
  message: "Please provide all required credentials for your role",
});

export default function Auth() {
  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  
  // Sign Up State
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseState, setLicenseState] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session) {
        setTimeout(() => navigate("/dashboard"), 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[a-z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = {
        email,
        password,
        full_name: fullName,
        phone: phone || undefined,
        role,
        company_name: companyName || undefined,
        company_email: companyEmail || undefined,
        license_number: licenseNumber || undefined,
        license_state: licenseState || undefined,
      };

      signUpSchema.parse(formData);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            phone: phone || null,
            role,
            company_name: companyName || null,
            company_email: companyEmail || null,
            license_number: licenseNumber || null,
            license_state: licenseState || null,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account. Your credentials will be reviewed within 1-2 business days.",
        duration: 6000,
      });
      
      // Reset form
      setStep(1);
      setEmail("");
      setPassword("");
      setFullName("");
      setPhone("");
      setRole("");
      setCompanyName("");
      setCompanyEmail("");
      setLicenseNumber("");
      setLicenseState("");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError(err.message || "An error occurred during sign up");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }).parse({ email: signInEmail, password: signInPassword });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (error) throw error;
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError(err.message || "An error occurred during sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  // Validation checks for Step 1
  const nameOk = fullName.trim().length >= 2;
  const emailOk = z.string().email().safeParse(email.trim()).success;
  const passwordOk = passwordStrength === 100;
  const canProceedToStep2 = nameOk && emailOk && passwordOk;
  const canProceedToStep3 = role;
  const config = role ? roleConfig[role as UserRole] : null;

  // Handler for input events (helps with autofill)
  const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
  };

  const handleInputEvent = (setter: (value: string) => void) => (e: React.FormEvent<HTMLInputElement>) => {
    setter((e.target as HTMLInputElement).value);
  };

  if (user) {
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4 relative">
      <Seo
        title="Sign In or Sign Up — GradeMyBuilding"
        description="Sign in to GradeMyBuilding or create a free account as an Inspector, Appraiser, or Real Estate Agent to start grading buildings."
        path="/auth"
      />
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Building Inspection System</CardTitle>
          <CardDescription className="text-center">
            Professional property assessment platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <div className="space-y-6">
                {/* Progress Indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Step {step} of 3</span>
                    <span>{step === 1 ? "Account Info" : step === 2 ? "Select Role" : "Credentials"}</span>
                  </div>
                  <Progress value={(step / 3) * 100} className="h-2" />
                </div>

                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignUp}>
                  {/* Step 1: Basic Account Information */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name *</Label>
                        <Input
                          id="signup-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          placeholder="John Doe"
                          value={fullName}
                          onChange={handleInputChange(setFullName)}
                          onInput={handleInputEvent(setFullName)}
                          onBlur={(e) => setFullName(e.target.value.trim())}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email *</Label>
                        <Input
                          id="signup-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={handleInputChange(setEmail)}
                          onInput={handleInputEvent(setEmail)}
                          onBlur={(e) => setEmail(e.target.value.trim())}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password *</Label>
                        <Input
                          id="signup-password"
                          name="password"
                          type="password"
                          autoComplete="new-password"
                          placeholder="Minimum 8 characters"
                          value={password}
                          onChange={handleInputChange(setPassword)}
                          onInput={handleInputEvent(setPassword)}
                          required
                        />
                        {password && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all ${
                                    passwordStrength < 50 ? 'bg-destructive' : 
                                    passwordStrength < 75 ? 'bg-yellow-500' : 
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${passwordStrength}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {passwordStrength < 50 ? 'Weak' : passwordStrength < 100 ? 'Good' : 'Strong'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Must include: uppercase, lowercase, number (min 8 chars)
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-phone">Phone (Optional)</Label>
                        <Input
                          id="signup-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="+1 (555) 123-4567"
                          value={phone}
                          onChange={handleInputChange(setPhone)}
                          onInput={handleInputEvent(setPhone)}
                        />
                      </div>

                      {/* Validation Feedback */}
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Requirements:</p>
                        <div className="grid grid-cols-1 gap-1.5">
                          <div className="flex items-center gap-2 text-sm">
                            {nameOk ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={nameOk ? "text-foreground" : "text-muted-foreground"}>
                              Name entered (min 2 characters)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            {emailOk ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={emailOk ? "text-foreground" : "text-muted-foreground"}>
                              Valid email address
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            {passwordOk ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={passwordOk ? "text-foreground" : "text-muted-foreground"}>
                              Strong password (8+ chars, upper, lower, number)
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button 
                        type="button" 
                        className="w-full" 
                        onClick={() => setStep(2)}
                        disabled={!canProceedToStep2}
                      >
                        Next: Select Role <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Step 2: Role Selection */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <h3 className="font-semibold text-lg mb-1">Select Your Role</h3>
                        <p className="text-sm text-muted-foreground">Choose the role that best describes your profession</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {(Object.keys(roleConfig) as UserRole[]).map((roleKey) => {
                          const { icon: Icon, label, description } = roleConfig[roleKey];
                          return (
                            <button
                              key={roleKey}
                              type="button"
                              onClick={() => setRole(roleKey)}
                              className={`relative p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50 ${
                                role === roleKey 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-border bg-card'
                              }`}
                            >
                              <Icon className={`h-8 w-8 mb-2 ${role === roleKey ? 'text-primary' : 'text-muted-foreground'}`} />
                              <div className="font-semibold text-sm mb-1">{label}</div>
                              <div className="text-xs text-muted-foreground line-clamp-2">{description}</div>
                              {role === roleKey && (
                                <CheckCircle2 className="h-5 w-5 text-primary absolute top-2 right-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setStep(1)}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button 
                          type="button" 
                          className="flex-1"
                          onClick={() => setStep(3)}
                          disabled={!canProceedToStep3}
                        >
                          Next: Credentials <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Professional Credentials */}
                  {step === 3 && config && (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-sm">
                            {config.label}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-1">Professional Credentials</h3>
                        <p className="text-sm text-muted-foreground">
                          {config.requiresLicense ? "License verification required" : "Company information required"}
                        </p>
                      </div>

                      {config.requiresCompany && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="company-name">Company Name *</Label>
                            <Input
                              id="company-name"
                              type="text"
                              placeholder="ACME Inspections LLC"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              required={config.requiresCompany}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="company-email">Company Email (Optional)</Label>
                            <Input
                              id="company-email"
                              type="email"
                              placeholder="contact@acmeinspections.com"
                              value={companyEmail}
                              onChange={(e) => setCompanyEmail(e.target.value)}
                            />
                          </div>
                        </>
                      )}

                      {config.requiresLicense && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="license-number">License Number *</Label>
                            <Input
                              id="license-number"
                              type="text"
                              placeholder="ABC-12345"
                              value={licenseNumber}
                              onChange={(e) => setLicenseNumber(e.target.value)}
                              required={config.requiresLicense}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="license-state">License State *</Label>
                            <Select value={licenseState} onValueChange={setLicenseState} required={config.requiresLicense}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                {US_STATES.map((state) => (
                                  <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-1">
                        <p className="font-medium">What happens next?</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          <li>Your credentials will be reviewed by our team</li>
                          <li>Verification typically takes 1-2 business days</li>
                          <li>You'll receive an email once approved</li>
                        </ul>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setStep(2)}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1"
                          disabled={loading}
                        >
                          {loading ? "Creating account..." : "Create Account"}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
