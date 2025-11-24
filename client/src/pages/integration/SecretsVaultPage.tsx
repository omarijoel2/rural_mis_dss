import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Copy, RotateCw, Trash2, Plus, AlertCircle } from 'lucide-react';
import { getSecretAuditLog } from '@/services/integrationApi';

export function SecretsVaultPage() {
  const [secrets, setSecrets] = useState([
    { id: 1, key: 'SENDGRID_API_KEY', type: 'api_key', owner: 'Integrations', expiresIn: '45 days', lastRotated: '2025-10-01' },
    { id: 2, key: 'DATABASE_PASSWORD', type: 'password', owner: 'Database', expiresIn: 'Never', lastRotated: '2025-06-15' },
    { id: 3, key: 'TWILIO_AUTH_TOKEN', type: 'token', owner: 'Communications', expiresIn: '30 days', lastRotated: '2025-11-01' },
    { id: 4, key: 'SSL_CERTIFICATE', type: 'certificate', owner: 'Infrastructure', expiresIn: '60 days', lastRotated: 'N/A' },
  ]);

  const [accessLog, setAccessLog] = useState([
    { id: 1, secret: 'SENDGRID_API_KEY', accessedBy: 'admin@example.com', type: 'read', timestamp: '2025-11-24T14:32:00Z', ip: '192.168.1.1' },
    { id: 2, secret: 'DATABASE_PASSWORD', accessedBy: 'backup-service', type: 'read', timestamp: '2025-11-24T10:00:00Z', ip: '10.0.0.5' },
    { id: 3, secret: 'TWILIO_AUTH_TOKEN', accessedBy: 'notifications-service', type: 'read', timestamp: '2025-11-24T15:20:00Z', ip: '10.0.1.3' },
  ]);

  useEffect(() => {
    const loadAuditLog = async () => {
      try {
        const result = await getSecretAuditLog();
        if (result.success && result.logs) {
          setAccessLog(result.logs);
        }
      } catch (error) {
        console.error('Failed to load audit log:', error);
      }
    };
    loadAuditLog();
  }, []);

  const [showSecrets, setShowSecrets] = useState<Record<number, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSecretVisibility = (id: number) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'api_key':
        return 'bg-blue-100 text-blue-800';
      case 'password':
        return 'bg-red-100 text-red-800';
      case 'token':
        return 'bg-green-100 text-green-800';
      case 'certificate':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSecrets = secrets.filter(secret =>
    secret.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Secrets Vault</h1>
        <p className="text-muted-foreground">Secure credential storage with encryption and rotation policies</p>
      </div>

      <Tabs defaultValue="secrets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="secrets">Secrets</TabsTrigger>
          <TabsTrigger value="audit">Access Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="secrets" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Stored Secrets</h2>
              <p className="text-sm text-muted-foreground">{filteredSecrets.length} secrets encrypted</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Secret
            </Button>
          </div>

          <Input
            placeholder="Search secrets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />

          <div className="space-y-2">
            {filteredSecrets.map(secret => (
              <Card key={secret.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-blue-500" />
                        <p className="font-mono font-medium text-sm">{secret.key}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">TYPE</p>
                      <Badge className={`mt-1 ${getTypeColor(secret.type)}`}>{secret.type}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">OWNER</p>
                      <p className="text-sm mt-1">{secret.owner}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">EXPIRES IN</p>
                      <Badge 
                        variant="outline"
                        className={secret.expiresIn === 'Never' ? '' : secret.expiresIn.includes('30') ? 'border-yellow-300' : ''}
                      >
                        {secret.expiresIn}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">LAST ROTATED</p>
                      <p className="text-sm mt-1">{secret.lastRotated}</p>
                    </div>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleSecretVisibility(secret.id)}
                      >
                        {showSecrets[secret.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard('••••••••••••••••')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <RotateCw className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-amber-900">Rotation Reminders</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-amber-800 space-y-2">
              <p>• SENDGRID_API_KEY - Rotate in 45 days</p>
              <p>• TWILIO_AUTH_TOKEN - Rotate in 30 days</p>
              <p>• DATABASE_PASSWORD - No expiration set</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <h2 className="text-lg font-semibold">Access Audit Log</h2>

          <div className="space-y-2">
            {accessLog.map(log => (
              <Card key={log.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <p className="font-mono font-medium text-sm">{log.secret}</p>
                      <p className="text-xs text-muted-foreground mt-1">{log.accessedBy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">ACCESS TYPE</p>
                      <Badge variant="outline" className="mt-1">{log.type}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">TIMESTAMP</p>
                      <p className="text-sm mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">IP ADDRESS</p>
                      <p className="font-mono text-sm mt-1">{log.ip}</p>
                    </div>
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline">Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
