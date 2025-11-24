import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Lock, Shield, Smartphone, Settings, Plus, Check, X } from 'lucide-react';

export function SsoConfigPage() {
  const [ssoProviders] = useState([
    {
      id: 1,
      name: 'Azure AD',
      type: 'oidc',
      issuer: 'https://login.microsoftonline.com/tenant-id/v2.0',
      status: 'active',
      users: 45,
      lastSync: '2025-11-24T14:30:00Z',
    },
    {
      id: 2,
      name: 'Google Workspace',
      type: 'oidc',
      issuer: 'https://accounts.google.com',
      status: 'inactive',
      users: 0,
      lastSync: null,
    },
  ]);

  const [mfaPolicy] = useState({
    enforcementPolicy: 'recommended', // optional, recommended, required
    allowedMethods: ['totp', 'sms', 'email'],
    gracePeriodDays: 7,
  });

  const [abacPolicies] = useState([
    {
      id: 1,
      name: 'Operator Dashboard Access',
      effect: 'allow',
      condition: 'role=operator AND scheme_id NOT NULL',
      priority: 100,
    },
    {
      id: 2,
      name: 'Deny Access After Hours',
      effect: 'deny',
      condition: 'time > 18:00 AND time < 06:00 AND role != admin',
      priority: 50,
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Identity & Access Management</h1>
        <p className="text-muted-foreground">Configure SSO, MFA, and attribute-based access control</p>
      </div>

      <Tabs defaultValue="sso" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sso" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">SSO</span>
          </TabsTrigger>
          <TabsTrigger value="mfa" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">MFA</span>
          </TabsTrigger>
          <TabsTrigger value="abac" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">ABAC</span>
          </TabsTrigger>
        </TabsList>

        {/* SSO Providers */}
        <TabsContent value="sso" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Single Sign-On (OIDC/SAML)</h2>
              <p className="text-sm text-muted-foreground">Connect identity providers for enterprise authentication</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ssoProviders.map(provider => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <CardDescription className="mt-1">{provider.type.toUpperCase()}</CardDescription>
                    </div>
                    <Badge variant={provider.status === 'active' ? 'default' : 'outline'}>
                      {provider.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">ISSUER</p>
                    <p className="text-xs font-mono break-all">{provider.issuer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SYNCED USERS</p>
                    <p className="text-lg font-bold">{provider.users}</p>
                  </div>
                  {provider.lastSync && (
                    <div>
                      <p className="text-xs text-muted-foreground">LAST SYNC</p>
                      <p className="text-sm">{new Date(provider.lastSync).toLocaleString()}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">Test</Button>
                    <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                    {provider.status === 'inactive' && (
                      <Button size="sm" className="flex-1">Enable</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Configuration Steps</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p>1. Register this application with your IdP</p>
              <p>2. Provide Redirect URI: https://yourdomain.com/auth/callback</p>
              <p>3. Copy Client ID and Client Secret here</p>
              <p>4. Click "Test" to verify connectivity</p>
              <p>5. Enable once testing is successful</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MFA Settings */}
        <TabsContent value="mfa" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Multi-Factor Authentication</h2>
            <p className="text-sm text-muted-foreground">Enforce MFA for enhanced security</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">MFA Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Enforcement Policy</label>
                <div className="flex gap-2 mt-2">
                  <Badge variant={mfaPolicy.enforcementPolicy === 'optional' ? 'default' : 'outline'}>Optional</Badge>
                  <Badge variant={mfaPolicy.enforcementPolicy === 'recommended' ? 'default' : 'outline'}>Recommended</Badge>
                  <Badge variant={mfaPolicy.enforcementPolicy === 'required' ? 'default' : 'outline'}>Required</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Current: {mfaPolicy.enforcementPolicy}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Allowed Methods</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['totp', 'sms', 'email'].map(method => (
                    <Badge 
                      key={method}
                      variant={mfaPolicy.allowedMethods.includes(method) ? 'default' : 'outline'}
                      className="cursor-pointer"
                    >
                      {method === 'totp' ? 'Authenticator App' : method.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Grace Period</label>
                <div className="flex items-center gap-2 mt-2">
                  <Input type="number" value={mfaPolicy.gracePeriodDays} className="w-20" disabled />
                  <span className="text-sm text-muted-foreground">days to enroll</span>
                </div>
              </div>

              <Button>Save MFA Settings</Button>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900 text-base">MFA Enrollment Status</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-green-800 space-y-1">
              <p>✓ 38 users with MFA enabled</p>
              <p>✓ 7 users pending enrollment</p>
              <p>✓ Grace period expires: 2025-12-01</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABAC Policies */}
        <TabsContent value="abac" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Attribute-Based Access Control</h2>
              <p className="text-sm text-muted-foreground">Fine-grained policies based on user attributes</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </div>

          <div className="space-y-2">
            {abacPolicies.map(policy => (
              <Card key={policy.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <p className="font-medium text-sm">{policy.name}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{policy.condition}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">EFFECT</p>
                      <Badge 
                        variant={policy.effect === 'allow' ? 'default' : 'destructive'} 
                        className="mt-1"
                      >
                        {policy.effect.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">PRIORITY</p>
                      <p className="font-medium mt-1">{policy.priority}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline" className="text-red-500">Delete</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900 text-base">ABAC Attributes Available</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-800 space-y-1">
              <p>• role (admin, manager, operator, analyst, viewer)</p>
              <p>• scheme_id (for location-based access)</p>
              <p>• dma_id (for distribution area control)</p>
              <p>• department (operations, finance, etc.)</p>
              <p>• sensitivity (public, internal, confidential)</p>
              <p>• time (for business hours restrictions)</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
