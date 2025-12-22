import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { Smartphone, Wifi, WifiOff, MapPin, Plus, Trash2, Settings } from 'lucide-react';
import { listDevices, registerDevice } from '@/services/integrationApi';

// Simple modal/dialog for device registration
function RegisterDeviceDialog({ open, onClose, onRegister }: { open: boolean, onClose: () => void, onRegister: (device: any) => void }) {
  const [form, setForm] = useState({ name: '', os: '', location: '', appVersion: '' });
  const [loading, setLoading] = useState(false);
  const handleChange = (e: any) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    await onRegister(form);
    setLoading(false);
    onClose();
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form className="bg-white rounded-lg shadow-lg p-6 w-80 space-y-4" onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold">Register Device</h3>
        <input name="name" placeholder="Device Name" className="w-full border p-2 rounded" value={form.name} onChange={handleChange} required />
        <input name="os" placeholder="OS" className="w-full border p-2 rounded" value={form.os} onChange={handleChange} required />
        <input name="location" placeholder="Location" className="w-full border p-2 rounded" value={form.location} onChange={handleChange} required />
        <input name="appVersion" placeholder="App Version" className="w-full border p-2 rounded" value={form.appVersion} onChange={handleChange} required />
        <div className="flex gap-2 justify-end">
          <button type="button" className="px-3 py-1 rounded bg-gray-200" onClick={onClose}>Cancel</button>
          <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </div>
      </form>
    </div>
  );
}

export function DeviceRegistryPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [syncQueue] = useState([
    { id: 1, device: 'Field Device-001', operation: 'create', entity: 'customer', status: 'synced' },
    { id: 2, device: 'IoT Sensor-042', operation: 'update', entity: 'reading', status: 'pending' },
    { id: 3, device: 'Tablet-Ops', operation: 'delete', entity: 'ticket', status: 'conflict' },
  ]);

  const loadDevices = async () => {
    try {
      const result = await listDevices();
      if (Array.isArray(result)) setDevices(result);
      else if (result.devices) setDevices(result.devices);
      else if (result.data) setDevices(result.data);
      else setDevices([]);
    } catch (error) {
      setDevices([]);
      console.error('Failed to load devices:', error);
    }
  };

  useEffect(() => { loadDevices(); }, []);

  const handleRegister = async (device: any) => {
    await registerDevice(device);
    await loadDevices();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <RegisterDeviceDialog open={registerOpen} onClose={() => setRegisterOpen(false)} onRegister={handleRegister} />
      <div>
        <h1 className="text-3xl font-bold">Device Registry & Offline Sync</h1>
        <p className="text-muted-foreground">Manage field devices and synchronization queues</p>
      </div>

      <Tabs defaultValue="devices" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="sync">Sync Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Registered Devices</h2>
              <p className="text-sm text-muted-foreground">{devices.length} devices registered</p>
            </div>
            <Button onClick={() => setRegisterOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Register Device
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {devices.map(device => (
              <Card key={device.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">{device.name}</p>
                        <p className="text-xs text-muted-foreground">{device.os}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">STATUS</p>
                      <Badge className={`mt-1 ${getStatusColor(device.status)}`}>
                        {device.status === 'active' ? (
                          <><Wifi className="h-3 w-3 mr-1" />{device.status}</>
                        ) : (
                          <><WifiOff className="h-3 w-3 mr-1" />{device.status}</>
                        )}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">LOCATION</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        <p className="text-sm">{device.location}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">APP VERSION</p>
                      <p className="text-sm font-medium mt-1">v{device.appVersion}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">LAST SYNC</p>
                      <p className="text-sm mt-1">{new Date(device.lastSync).toLocaleString()}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost"><Settings className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <h2 className="text-lg font-semibold">Offline Sync Queue</h2>

          <div className="space-y-2">
            {syncQueue.map(item => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <p className="text-sm font-medium">{item.device}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{item.entity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">OPERATION</p>
                      <Badge variant="outline" className="mt-1">{item.operation}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">STATUS</p>
                      <Badge 
                        className={`mt-1 ${
                          item.status === 'synced' ? 'bg-green-100 text-green-800' :
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <div />
                    <div className="flex justify-end gap-2">
                      {item.status === 'conflict' && (
                        <>
                          <Button size="sm" variant="outline" className="text-sm">Server</Button>
                          <Button size="sm" variant="outline" className="text-sm">Device</Button>
                        </>
                      )}
                      {item.status === 'pending' && (
                        <Button size="sm" variant="outline">Sync Now</Button>
                      )}
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
