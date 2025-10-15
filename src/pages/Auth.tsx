import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { RoleSelector } from '@/components/Auth/RoleSelector';
import { CredentialsForm } from '@/components/Auth/CredentialsForm';
import { ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { ThemeToggle } from '@/components/Layout/ThemeToggle';

type SignUpStep = 'account' | 'role' | 'credentials' | 'review';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Signup state
  const [signUpStep, setSignUpStep] = useState<SignUpStep>('account');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: null as AppRole | null,
    full_name: '',
    phone: '',
    company_name: '',
    company_email: '',
    license_number: '',
    license_state: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      await signIn(loginEmail, loginPassword);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignUpSubmit = async () => {
    // Validation
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (!signUpData.role) {
      toast({
        title: 'Please select a role',
        variant: 'destructive',
      });
      return;
    }

    if (!signUpData.full_name || !signUpData.company_name) {
      toast({
        title: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSigningUp(true);

    try {
      await signUp({
        email: signUpData.email,
        role: signUpData.role,
        full_name: signUpData.full_name,
        phone: signUpData.phone,
        company_name: signUpData.company_name,
        company_email: signUpData.company_email,
        license_number: signUpData.license_number,
        license_state: signUpData.license_state,
      });

      toast({
        title: 'Registration successful!',
        description: 'Your account has been created. Welcome to GradeMyBuilding!',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const canProceedFromAccount = signUpData.email && signUpData.password && signUpData.confirmPassword;
  const canProceedFromRole = signUpData.role !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Award className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">GradeMyBuilding</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoggingIn}>
                    {isLoggingIn ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <div className="space-y-6">
                  {/* Progress indicator */}
                  <div className="flex items-center justify-between mb-6">
                    {['account', 'role', 'credentials', 'review'].map((step, idx) => (
                      <div key={step} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            signUpStep === step
                              ? 'bg-primary text-primary-foreground'
                              : idx < ['account', 'role', 'credentials', 'review'].indexOf(signUpStep)
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        {idx < 3 && <div className="w-12 h-0.5 bg-muted mx-2" />}
                      </div>
                    ))}
                  </div>

                  {/* Step 1: Account */}
                  {signUpStep === 'account' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Create Account</h3>
                      </div>
                      <div>
                        <Label htmlFor="signup-email">Email *</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                          placeholder="you@company.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="signup-password">Password *</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={signUpData.password}
                          onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                          placeholder="Min. 8 characters"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="signup-confirm">Confirm Password *</Label>
                        <Input
                          id="signup-confirm"
                          type="password"
                          value={signUpData.confirmPassword}
                          onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                      <Button
                        onClick={() => setSignUpStep('role')}
                        className="w-full"
                        disabled={!canProceedFromAccount}
                      >
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Step 2: Role Selection */}
                  {signUpStep === 'role' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Select Your Role</h3>
                      </div>
                      <RoleSelector
                        selectedRole={signUpData.role}
                        onSelect={(role) => setSignUpData({ ...signUpData, role })}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setSignUpStep('account')}
                          className="flex-1"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button
                          onClick={() => setSignUpStep('credentials')}
                          className="flex-1"
                          disabled={!canProceedFromRole}
                        >
                          Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Credentials */}
                  {signUpStep === 'credentials' && signUpData.role && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Professional Credentials</h3>
                      </div>
                      <CredentialsForm
                        role={signUpData.role}
                        data={{
                          full_name: signUpData.full_name,
                          phone: signUpData.phone,
                          company_name: signUpData.company_name,
                          company_email: signUpData.company_email,
                          license_number: signUpData.license_number,
                          license_state: signUpData.license_state,
                        }}
                        onChange={(data) => setSignUpData({ ...signUpData, ...data })}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setSignUpStep('role')}
                          className="flex-1"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button
                          onClick={() => setSignUpStep('review')}
                          className="flex-1"
                        >
                          Review <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Review */}
                  {signUpStep === 'review' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Review & Submit</h3>
                      </div>
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <p><strong>Email:</strong> {signUpData.email}</p>
                        <p><strong>Role:</strong> {signUpData.role}</p>
                        <p><strong>Name:</strong> {signUpData.full_name}</p>
                        <p><strong>Company:</strong> {signUpData.company_name}</p>
                        {signUpData.license_number && (
                          <p><strong>License:</strong> {signUpData.license_number} ({signUpData.license_state})</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setSignUpStep('credentials')}
                          className="flex-1"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button
                          onClick={handleSignUpSubmit}
                          className="flex-1"
                          disabled={isSigningUp}
                        >
                          {isSigningUp ? 'Creating account...' : 'Create Account'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
