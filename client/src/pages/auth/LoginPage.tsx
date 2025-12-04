import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AuthLayout } from '../../components/layouts/AuthLayout';
import { Shield, Eye, EyeOff, Loader2, Users, ChevronDown, ChevronUp } from 'lucide-react';

const demoCredentials = [
  { role: 'Super Admin', email: 'superadmin@rwmis.go.ke', password: 'SuperAdmin@2025!', description: 'All counties access' },
  { role: 'Turkana Admin', email: 'admin@turkana.rwmis.go.ke', password: 'CountyAdmin@2025!', description: 'Turkana County' },
  { role: 'Wajir Admin', email: 'admin@wajir.rwmis.go.ke', password: 'CountyAdmin@2025!', description: 'Wajir County' },
  { role: 'Marsabit Admin', email: 'admin@marsabit.rwmis.go.ke', password: 'CountyAdmin@2025!', description: 'Marsabit County' },
  { role: 'Mandera Admin', email: 'admin@mandera.rwmis.go.ke', password: 'CountyAdmin@2025!', description: 'Mandera County' },
  { role: 'Garissa Admin', email: 'admin@garissa.rwmis.go.ke', password: 'CountyAdmin@2025!', description: 'Garissa County' },
  { role: 'Operator', email: 'operator@rwmis.go.ke', password: 'Demo@2025!', description: 'Operations & work orders' },
  { role: 'Technician', email: 'technician@rwmis.go.ke', password: 'Demo@2025!', description: 'Field maintenance' },
  { role: 'Meter Reader', email: 'meterreader@rwmis.go.ke', password: 'Demo@2025!', description: 'Meter readings' },
  { role: 'Billing Clerk', email: 'billing@rwmis.go.ke', password: 'Demo@2025!', description: 'Billing & payments' },
  { role: 'Customer Service', email: 'customerservice@rwmis.go.ke', password: 'Demo@2025!', description: 'Customer support' },
];

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  const handleQuickFill = (cred: typeof demoCredentials[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (requires2FA) {
        const response = await fetch('/api/v1/auth/2fa/challenge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, code: twoFactorCode }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || '2FA verification failed');
        setUser(data.user);
        navigate('/');
      } else {
        try {
          await login(email, password);
          navigate('/');
        } catch (err: any) {
          if (err.message?.includes('2FA') || err.message?.includes('two-factor')) {
            setRequires2FA(true);
            setError('');
          } else {
            throw err;
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="border-0 shadow-xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to access the Rural Water Supply MIS
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="animate-in fade-in-50">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {requires2FA && (
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  Two-factor authentication is enabled. Enter your verification code.
                </AlertDescription>
              </Alert>
            )}
            
            {!requires2FA ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link 
                      to="/auth/forgot-password" 
                      className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11 pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="2fa-code">Verification Code</Label>
                  <Input
                    id="2fa-code"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    required
                    disabled={isLoading}
                    autoFocus
                    className="h-11 text-center text-2xl tracking-widest font-mono"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRequires2FA(false);
                    setTwoFactorCode('');
                    setError('');
                  }}
                  disabled={isLoading}
                  className="w-full"
                >
                  Back to login
                </Button>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium" 
              disabled={isLoading || (requires2FA && twoFactorCode.length !== 6)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : requires2FA ? (
                'Verify & Sign In'
              ) : (
                'Sign In'
              )}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/auth/register" className="text-blue-600 hover:text-blue-500 font-medium hover:underline">
                Create account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowDemoCredentials(!showDemoCredentials)}
          className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Users className="h-4 w-4" />
          Demo Credentials
          {showDemoCredentials ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {showDemoCredentials && (
          <Card className="mt-3 border-dashed border-2 bg-gray-50/50 dark:bg-gray-800/50">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Click to auto-fill credentials for testing
              </p>
              {demoCredentials.map((cred, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickFill(cred)}
                  className="w-full text-left p-3 rounded-lg border bg-white dark:bg-gray-900 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{cred.role}</span>
                    <span className="text-xs text-muted-foreground">{cred.description}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">
                    {cred.email}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AuthLayout>
  );
}
