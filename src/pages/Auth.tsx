import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole, UserCredentials } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RoleSelector } from '@/components/Auth/RoleSelector';
import { CredentialsForm } from '@/components/Auth/CredentialsForm';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle } from 'lucide-react';

type SignUpStep = 'account' | 'role' | 'credentials' | 'review';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [signUpStep, setSignUpStep] = useState<SignUpStep>('account');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [credentials, setCredentials] = useState<UserCredentials | null>(null);
  const [signUpLoading, setSignUpLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      await signIn(loginEmail, loginPassword);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignUpSubmit = async () => {
    if (!selectedRole || !credentials) return;

    setSignUpLoading(true);
    try {
      await signUp(signUpEmail, signUpPassword, selectedRole, credentials);
      toast({
        title: 'Registration successful!',
        description: 'Your account has been created. Welcome to GradeMyBuilding!',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setSignUpLoading(false);
    }
  };

  const renderSignUpStep = () => {
    switch (signUpStep) {
      case 'account':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Enter your email and password to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (signUpEmail && signUpPassword.length >= 8) {
                    setSignUpStep('role');
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters
                  </p>
                </div>
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        );

      case 'role':
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Select Your Role</h2>
              <p className="text-muted-foreground">Choose the role that best describes you</p>
            </div>
            <RoleSelector selectedRole={selectedRole} onSelectRole={setSelectedRole} />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSignUpStep('account')} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => selectedRole && setSignUpStep('credentials')}
                disabled={!selectedRole}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 'credentials':
        return selectedRole ? (
          <CredentialsForm
            role={selectedRole}
            onSubmit={(creds) => {
              setCredentials(creds);
              setSignUpStep('review');
            }}
            onBack={() => setSignUpStep('role')}
          />
        ) : null;

      case 'review':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Information</CardTitle>
              <CardDescription>Please verify your details before submitting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{signUpEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <p className="text-base capitalize">{selectedRole?.replace(/_/g, ' ')}</p>
                </div>
                {credentials && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p className="text-base">{credentials.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Company</p>
                      <p className="text-base">{credentials.company_name}</p>
                    </div>
                    {credentials.license_number && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">License</p>
                        <p className="text-base">
                          {credentials.license_number} ({credentials.license_state})
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your credentials will be reviewed by our team. You'll receive email notification once
                  verified.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSignUpStep('credentials')}
                  disabled={signUpLoading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button onClick={handleSignUpSubmit} disabled={signUpLoading} className="flex-1">
                  {signUpLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">GradeMyBuilding</h1>
          <p className="text-muted-foreground">Professional property inspection platform</p>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Demo Mode:</strong> This is a client-side demo. For production use with real security,
            enable Lovable Cloud backend.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue={searchParams.get('tab') || 'login'} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Sign in to your account to continue</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Your password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loginLoading}>
                    {loginLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">{renderSignUpStep()}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
