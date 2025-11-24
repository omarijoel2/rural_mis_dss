import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Key, Plus, RotateCcw, Eye, EyeOff, Trash2, Copy, AlertCircle } from 'lucide-react';

interface ApiKey {
  id: number;
  appName: string;
  keyId: string;
  keySecret: string;
  scopes: string[];
  rateLimit: number;
  lastUsedAt: string | null;
  createdAt: string;
  isActive: boolean;
}

interface OAuthClient {
  id: number;
  clientName: string;
  clientId: string;
  grantTypes: string[];
  redirectUris: string[];
  isActive: boolean;
  createdAt: string;
}

export function ApiCatalogPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 1,
      appName: 'SCADA Integration',
      keyId: 'sk_live_abc123xyz',
      keySecret: '••••••••••••••••',
      scopes: ['read:telemetry', 'write:alarms'],
      rateLimit: 5000,
      lastUsedAt: '2025-11-24T14:32:00Z',
      createdAt: '2025-11-01T10:00:00Z',
      isActive: true,
    },
    {
      id: 2,
      appName: 'Billing System',
      keyId: 'sk_live_def456uvw',
      keySecret: '••••••••••••••••',
      scopes: ['read:billing', 'write:payments'],
      rateLimit: 1000,
      lastUsedAt: '2025-11-24T16:15:00Z',
      createdAt: '2025-11-10T08:30:00Z',
      isActive: true,
    },
  ]);

  const [oauthClients] = useState<OAuthClient[]>([
    {
      id: 1,
      clientName: 'Mobile App',
      clientId: 'oauth_mobile_app_001',
      grantTypes: ['authorization_code', 'refresh_token'],
      redirectUris: ['https://app.example.com/callback'],
      isActive: true,
      createdAt: '2025-11-05T12:00:00Z',
    },
  ]);

  const [showSecrets, setShowSecrets] = useState<Record<number, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSecretVisibility = (id: number) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const rotateKey = (id: number) => {
    setApiKeys(prev =>
      prev.map(key =>
        key.id === id
          ? { ...key, keySecret: 'sk_live_' + Math.random().toString(36).substr(2, 20) }
          : key
      )
    );
  };

  const deleteKey = (id: number) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
  };

  const filteredKeys = apiKeys.filter(key =>
    key.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.keyId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Catalog & Key Management</h1>
        <p className="text-muted-foreground">Manage API keys, OAuth clients, and integration credentials</p>
      </div>

      {/* API Keys Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">API Keys</h2>
            <p className="text-sm text-muted-foreground">Server-to-server authentication tokens</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Generate New Key
          </Button>
        </div>

        <Input
          placeholder="Search API keys..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />

        <div className="space-y-2">
          {filteredKeys.map(key => (
            <Card key={key.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-3">
                    <p className="font-medium text-sm">{key.appName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{key.keyId}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground">SCOPES</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {key.scopes.map(scope => (
                        <Badge key={scope} variant="secondary" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground">RATE LIMIT</p>
                    <p className="font-medium">{key.rateLimit}/hr</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground">LAST USED</p>
                    <p className="text-sm">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}</p>
                  </div>
                  <div className="md:col-span-3 flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleSecretVisibility(key.id)}
                    >
                      {showSecrets[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(key.keySecret)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => rotateKey(key.id)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => deleteKey(key.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* OAuth Clients Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">OAuth Clients</h2>
            <p className="text-sm text-muted-foreground">Third-party application integrations</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Register OAuth Client
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {oauthClients.map(client => (
            <Card key={client.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{client.clientName}</CardTitle>
                <CardDescription className="font-mono text-xs">{client.clientId}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">GRANT TYPES</p>
                  <div className="flex flex-wrap gap-1">
                    {client.grantTypes.map(gt => (
                      <Badge key={gt} variant="outline" className="text-xs">
                        {gt}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">REDIRECT URIs</p>
                  {client.redirectUris.map(uri => (
                    <p key={uri} className="text-xs font-mono break-all">{uri}</p>
                  ))}
                </div>
                <div className="pt-2 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                  <Button size="sm" variant="outline" className="flex-1 text-red-500">Revoke</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900">API Security Best Practices</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>• Rotate API keys every 90 days</p>
          <p>• Use minimal scopes required for your integration</p>
          <p>• Monitor API audit logs for unusual activity</p>
          <p>• Revoke unused keys immediately</p>
          <p>• Never commit API keys to version control</p>
        </CardContent>
      </Card>
    </div>
  );
}
