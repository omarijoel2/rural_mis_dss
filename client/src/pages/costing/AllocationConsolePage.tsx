import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Plus, Play, CheckCircle, XCircle, Clock } from 'lucide-react';

export function AllocationConsolePage() {
  const [activeTab, setActiveTab] = useState('rules');

  const rules = [
    { id: 1, name: 'Power Cost Allocation', basis: 'driver', driver: 'kWh consumed', active: true, applies_to: 'Electricity expenses' },
    { id: 2, name: 'Admin Cost Split', basis: 'percentage', percentage: 25, active: true, applies_to: 'Administrative overhead' },
    { id: 3, name: 'Equal Scheme Split', basis: 'equal', active: true, applies_to: 'Corporate costs' },
  ];

  const runs = [
    { id: 1, period: '2025-01', status: 'completed', started_at: '2025-01-15 08:30', completed_at: '2025-01-15 08:35', results_count: 245 },
    { id: 2, period: '2024-12', status: 'completed', started_at: '2024-12-15 09:15', completed_at: '2024-12-15 09:18', results_count: 238 },
    { id: 3, period: '2024-11', status: 'failed', started_at: '2024-11-15 10:00', completed_at: '2024-11-15 10:02', results_count: 0 },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; icon: any }> = {
      running: { variant: 'secondary', icon: Clock },
      completed: { variant: 'default', icon: CheckCircle },
      failed: { variant: 'destructive', icon: XCircle },
    };
    const config = variants[status] || variants.running;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Allocation Console</h1>
          <p className="text-muted-foreground mt-1">
            Manage cost allocation rules and execute allocation runs
          </p>
        </div>
        <Button className="gap-2" variant="default">
          <Play className="h-4 w-4" />
          Execute Allocation
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules">Allocation Rules</TabsTrigger>
          <TabsTrigger value="runs">Allocation Runs</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Active Allocation Rules</h3>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Rule
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Allocation Basis</TableHead>
                  <TableHead>Driver/Percentage</TableHead>
                  <TableHead>Applies To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {rule.basis.charAt(0).toUpperCase() + rule.basis.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {'driver' in rule ? rule.driver : rule.percentage ? `${rule.percentage}%` : 'Equal'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{rule.applies_to}</TableCell>
                    <TableCell>
                      <Badge variant={rule.active ? 'default' : 'secondary'}>
                        {rule.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="runs" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Allocation Run History</h3>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started At</TableHead>
                  <TableHead>Completed At</TableHead>
                  <TableHead className="text-right">Results</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">{run.period}</TableCell>
                    <TableCell>{getStatusBadge(run.status)}</TableCell>
                    <TableCell className="text-sm">{run.started_at}</TableCell>
                    <TableCell className="text-sm">{run.completed_at || '-'}</TableCell>
                    <TableCell className="text-right font-mono">{run.results_count}</TableCell>
                    <TableCell>
                      {run.status === 'completed' && (
                        <Button variant="ghost" size="sm">View Results</Button>
                      )}
                      {run.status === 'failed' && (
                        <Button variant="ghost" size="sm">View Error</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
