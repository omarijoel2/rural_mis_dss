import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface TwoFactorStatus {
  enabled: boolean;
  qr_code?: string;
  secret?: string;
  recovery_codes?: string[];
}

export function TwoFactorSetupPage() {
  const queryClient = useQueryClient();
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const { data: status, isLoading } = useQuery({
    queryKey: ['2fa-status'],
    queryFn: () => apiClient.get<TwoFactorStatus>('/auth/2fa/status'),
  });

  const enrollMutation = useMutation({
    mutationFn: () => apiClient.post<TwoFactorStatus>('/auth/2fa/enroll'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
      toast.success('2FA enrollment started');
    },
    onError: () => {
      toast.error('Failed to start 2FA enrollment');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (code: string) => 
      apiClient.post<{ recovery_codes: string[] }>('/auth/2fa/verify', { code }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      setRecoveryCodes(data.recovery_codes || []);
      toast.success('2FA enabled successfully');
      setVerificationCode('');
    },
    onError: () => {
      toast.error('Invalid verification code');
    },
  });

  const disableMutation = useMutation({
    mutationFn: () => apiClient.post('/auth/2fa/disable'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      setRecoveryCodes([]);
      toast.success('2FA disabled');
    },
    onError: () => {
      toast.error('Failed to disable 2FA');
    },
  });

  const handleEnroll = () => {
    enrollMutation.mutate();
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      verifyMutation.mutate(verificationCode);
    }
  };

  const handleDisable = () => {
    if (confirm('Are you sure you want to disable 2FA? This will reduce your account security.')) {
      disableMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-8">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Two-Factor Authentication</h1>
          <p className="text-muted-foreground mt-2">
            Add an extra layer of security to your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {status?.enabled ? (
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                ) : (
                  <Shield className="h-6 w-6 text-muted-foreground" />
                )}
                <div>
                  <CardTitle>Status</CardTitle>
                  <CardDescription>
                    {status?.enabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
                  </CardDescription>
                </div>
              </div>
              {status?.enabled && (
                <Badge variant="default" className="bg-green-600">Enabled</Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {!status?.enabled && !status?.qr_code && (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app in addition to your password.
                  </AlertDescription>
                </Alert>

                <Button onClick={handleEnroll} disabled={enrollMutation.isPending}>
                  {enrollMutation.isPending ? 'Setting up...' : 'Enable 2FA'}
                </Button>
              </div>
            )}

            {status?.qr_code && !status?.enabled && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Step 1: Scan QR Code</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
                  </p>
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <img 
                      src={status.qr_code} 
                      alt="2FA QR Code" 
                      className="w-64 h-64"
                    />
                  </div>
                </div>

                {status.secret && (
                  <div>
                    <Label>Manual Entry Code</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      If you can't scan the QR code, enter this code manually:
                    </p>
                    <code className="block p-3 bg-muted rounded text-sm font-mono">
                      {status.secret}
                    </code>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Step 2: Verify Code</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter the 6-digit code from your authenticator app to complete setup
                  </p>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleVerify();
                        }}
                      />
                    </div>
                    <Button 
                      onClick={handleVerify}
                      disabled={verificationCode.length !== 6 || verifyMutation.isPending}
                    >
                      {verifyMutation.isPending ? 'Verifying...' : 'Verify & Enable'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {status?.enabled && (
              <div className="space-y-4">
                <Alert className="border-green-600 bg-green-50">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-900">
                    Your account is protected with two-factor authentication.
                  </AlertDescription>
                </Alert>

                <Button 
                  variant="destructive" 
                  onClick={handleDisable}
                  disabled={disableMutation.isPending}
                >
                  {disableMutation.isPending ? 'Disabling...' : 'Disable 2FA'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {(recoveryCodes.length > 0 || (status?.recovery_codes && status.recovery_codes.length > 0)) && (
          <Card>
            <CardHeader>
              <CardTitle>Recovery Codes</CardTitle>
              <CardDescription>
                Save these recovery codes in a safe place. You can use them to access your account if you lose your authenticator device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {recoveryCodes.length > 0 
                    ? 'Save these recovery codes now! They will not be shown again.'
                    : 'Each recovery code can only be used once. Store them securely.'}
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 gap-2">
                {(recoveryCodes.length > 0 ? recoveryCodes : status?.recovery_codes || []).map((code, index) => (
                  <code key={index} className="block p-2 bg-muted rounded text-sm font-mono">
                    {code}
                  </code>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
