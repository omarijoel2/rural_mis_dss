import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Activity, AlertTriangle, TrendingUp, Plus, Check, Clock } from 'lucide-react';

export function ObservabilityPage() {
  const [alerts] = useState([
    { id: 1, name: 'High CPU Usage', severity: 'critical', condition: 'cpu > 85%', status: 'open' },
    { id: 2, name: 'Database Connection Pool', severity: 'warning', condition: 'connections > 100', status: 'open' },
    { id: 3, name: 'API Response Time', severity: 'warning', condition: 'latency > 2s', status: 'active' },
  ]);

  const [incidents] = useState([
    { id: 1, policy: 'High CPU Usage', severity: 'critical', status: 'open', firedAt: '2025-11-24T15:32:00Z' },
    { id: 2, policy: 'Database Connection Pool', severity: 'warning', status: 'acknowledged', firedAt: '2025-11-24T14:15:00Z' },
    { id: 3, policy: 'API Response Time', severity: 'warning', status: 'resolved', firedAt: '2025-11-23T10:30:00Z' },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Observability & Ops Dashboard</h1>
        <p className="text-muted-foreground">System metrics, alerts, and incident management</p>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alert Policies</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <h2 className="text-lg font-semibold">System Metrics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">CPU USAGE</p>
                <p className="text-3xl font-bold mt-1">42%</p>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                  <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '42%' }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">MEMORY</p>
                <p className="text-3xl font-bold mt-1">68%</p>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                  <div className="h-2 bg-orange-500 rounded-full" style={{ width: '68%' }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">API LATENCY</p>
                <p className="text-3xl font-bold mt-1">127ms</p>
                <Badge className="mt-2 bg-green-100 text-green-800">Good</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">ERROR RATE</p>
                <p className="text-3xl font-bold mt-1">0.2%</p>
                <Badge className="mt-2 bg-green-100 text-green-800">Excellent</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Alert Policies ({alerts.length})</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </div>

          <div className="space-y-2">
            {alerts.map(alert => (
              <Card key={alert.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <p className="font-medium">{alert.name}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{alert.condition}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">SEVERITY</p>
                      <Badge 
                        className={`mt-1 ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">STATUS</p>
                      <Badge className="mt-1 bg-green-100 text-green-800">{alert.status}</Badge>
                    </div>
                    <div />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline" className="text-red-500">Delete</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <h2 className="text-lg font-semibold">Active Incidents ({incidents.filter(i => i.status === 'open').length})</h2>

          <div className="space-y-2">
            {incidents.map(incident => (
              <Card 
                key={incident.id}
                className={incident.status === 'open' ? 'border-red-200 bg-red-50' : ''}
              >
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        {incident.status === 'open' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        <div>
                          <p className="font-medium">{incident.policy}</p>
                          <p className="text-xs text-muted-foreground">{new Date(incident.firedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">SEVERITY</p>
                      <Badge 
                        className={`mt-1 ${
                          incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {incident.severity}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">STATUS</p>
                      <Badge 
                        className={`mt-1 ${
                          incident.status === 'open' ? 'bg-red-100 text-red-800' :
                          incident.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        {incident.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">DURATION</p>
                      <p className="text-sm mt-1">45 minutes</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      {incident.status === 'open' && (
                        <Button size="sm" variant="outline">
                          <Check className="h-3 w-3 mr-1" />
                          Acknowledge
                        </Button>
                      )}
                      {incident.status !== 'resolved' && (
                        <Button size="sm" variant="outline">Resolve</Button>
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
