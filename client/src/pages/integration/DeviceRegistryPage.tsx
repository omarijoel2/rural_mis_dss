import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { Smartphone, Wifi, WifiOff, MapPin, Plus, Trash2, Settings } from 'lucide-react';
import { listDevices } from '@/services/integrationApi';

export function DeviceRegistryPage() {
  const [devices, setDevices] = useState([
    { 
      id: 1, 
      name: 'Field Device-001', 
      type: 'mobile', 
      os: 'Android 12', 
      status: 'active', 
      lastSync: '2025-11-24T10:30:00Z',
      location: 'Turkana County',
      appVersion: '1.2.3'
    },
    { 
      id: 2, 
      name: 'IoT Sensor-042', 
      type: 'iot', 
      os: 'Linux ARM', 
      status: 'active', 
      lastSync: '2025-11-24T15:20:00Z',
      location: 'Borehole-05',
      appVersion: '2.1.0'
    },
    { 
      id: 3, 
      name: 'Tablet-Ops', 
      type: 'tablet', 
      os: 'iPadOS 17', 
      status: 'offline', 
      lastSync: '2025-11-20T08:00:00Z',
      location: 'Control Center',
      appVersion: '1.1.5'
    },
  ]);

  const [syncQueue] = useState([
    { id: 1, device: 'Field Device-001', operation: 'create', entity: 'customer', status: 'synced' },
    { id: 2, device: 'IoT Sensor-042', operation: 'update', entity: 'reading', status: 'pending' },
    { id: 3, device: 'Tablet-Ops', operation: 'delete', entity: 'ticket', status: 'conflict' },
  ]);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const result = await listDevices();
        if (result.success && result.devices) {
          setDevices(result.devices);
        }
      } catch (error) {
        console.error('Failed to load devices:', error);
      }
    };
    loadDevices();
  }, []);

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
            <Button>
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
