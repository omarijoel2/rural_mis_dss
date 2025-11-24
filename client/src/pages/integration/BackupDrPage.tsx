import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { HardDrive, Clock, AlertCircle, Play, Plus, Edit, Trash2, Download } from 'lucide-react';

export function BackupDrPage() {
  const [policies] = useState([
    { id: 1, name: 'Daily Full Backup', type: 'full', schedule: '02:00 UTC', retention: '30 days', status: 'active' },
    { id: 2, name: 'Hourly Incremental', type: 'incremental', schedule: 'Every hour', retention: '7 days', status: 'active' },
    { id: 3, name: 'Weekly Snapshot', type: 'snapshot', schedule: 'Sunday 03:00 UTC', retention: '90 days', status: 'active' },
  ]);

  const [backups] = useState([
    { id: 1, policy: 'Daily Full Backup', size: '45.2 GB', status: 'completed', date: '2025-11-24T02:15:00Z', duration: '3h 42m' },
    { id: 2, policy: 'Daily Full Backup', size: '44.8 GB', status: 'completed', date: '2025-11-23T02:10:00Z', duration: '3h 38m' },
    { id: 3, policy: 'Hourly Incremental', size: '312 MB', status: 'completed', date: '2025-11-24T14:00:00Z', duration: '12m' },
  ]);

  const [drPlan] = useState({
    name: 'Primary Site Recovery',
    rto: 15, // minutes
    rpo: 5,  // minutes
    services: 8,
    lastTested: '2025-11-15T10:30:00Z',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backup & Disaster Recovery</h1>
        <p className="text-muted-foreground">Data protection and business continuity management</p>
      </div>

      <Tabs defaultValue="policies" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="backups">Backup Jobs</TabsTrigger>
          <TabsTrigger value="drplan">DR Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Backup Policies</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </div>

          <div className="space-y-2">
            {policies.map(policy => (
              <Card key={policy.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div>
                      <p className="font-medium">{policy.name}</p>
                      <Badge variant="outline" className="mt-1">{policy.type}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">SCHEDULE</p>
                      <p className="text-sm mt-1">{policy.schedule}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">RETENTION</p>
                      <p className="text-sm mt-1">{policy.retention}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">STATUS</p>
                      <Badge className="mt-1 bg-green-100 text-green-800">{policy.status}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">NEXT RUN</p>
                      <p className="text-sm mt-1">In 8h 23m</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost"><Play className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Recent Backup Jobs</h2>
              <p className="text-sm text-muted-foreground">{backups.length} backups completed</p>
            </div>
            <Button size="sm">
              <Play className="h-4 w-4 mr-2" />
              Run Backup Now
            </Button>
          </div>

          <div className="space-y-2">
            {backups.map(backup => (
              <Card key={backup.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div>
                      <p className="font-medium text-sm">{backup.policy}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(backup.date).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">SIZE</p>
                      <p className="font-medium mt-1">{backup.size}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">DURATION</p>
                      <p className="text-sm mt-1">{backup.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">STATUS</p>
                      <Badge className="mt-1 bg-green-100 text-green-800">{backup.status}</Badge>
                    </div>
                    <div />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="text-sm">
                        <Download className="h-3 w-3 mr-1" />
                        Restore
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="drplan" className="space-y-4">
          <h2 className="text-lg font-semibold">Disaster Recovery Plan</h2>

          <Card>
            <CardHeader>
              <CardTitle>{drPlan.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs text-blue-600 font-semibold">RTO (Recovery Time Objective)</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{drPlan.rto}m</p>
                  <p className="text-sm text-blue-700 mt-2">Maximum allowable downtime</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-xs text-green-600 font-semibold">RPO (Recovery Point Objective)</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">{drPlan.rpo}m</p>
                  <p className="text-sm text-green-700 mt-2">Maximum data loss acceptable</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-xs text-purple-600 font-semibold">Critical Services</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">{drPlan.services}</p>
                  <p className="text-sm text-purple-700 mt-2">Protected systems</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-sm">Last DR Test</p>
                      <p className="text-xs text-muted-foreground">{new Date(drPlan.lastTested).toLocaleString()}</p>
                    </div>
                  </div>
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Test DR Plan
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Recovery Steps</h4>
                <ol className="space-y-2">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm flex items-center justify-center">1</span>
                    <span className="text-sm">Notify incident response team</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm flex items-center justify-center">2</span>
                    <span className="text-sm">Activate standby infrastructure</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm flex items-center justify-center">3</span>
                    <span className="text-sm">Restore databases from latest backup</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm flex items-center justify-center">4</span>
                    <span className="text-sm">Verify application functionality</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm flex items-center justify-center">5</span>
                    <span className="text-sm">Switch DNS to recovery site</span>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
