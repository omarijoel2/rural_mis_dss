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
import { Plus, Play, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { useAllocationRules, useAllocationRuns } from '../../hooks/useCosting';

export function AllocationConsolePage() {
  const [activeTab, setActiveTab] = useState('rules');

  const { data: rulesData, isLoading: rulesLoading, error: rulesError } = useAllocationRules({ active: true });
  const { data: runsData, isLoading: runsLoading, error: runsError } = useAllocationRuns();

  const rules = rulesData?.data || [];
  const runs = runsData?.data || [];

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

            {rulesError && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4">
                Error loading rules: {rulesError instanceof Error ? rulesError.message : 'Unknown error'}
              </div>
            )}

            {rulesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : rules.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No allocation rules configured. Click "New Rule" to create one.
              </div>
            ) : (
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
                      {rule.basis === 'driver' && rule.driver ? `Driver: ${rule.driver.name}` : 
                       rule.basis === 'percentage' && rule.percentage ? `${rule.percentage}%` : 
                       'Equal Split'}
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
            )}
          </Card>
        </TabsContent>

        <TabsContent value="runs" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Allocation Run History</h3>

            {runsError && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4">
                Error loading runs: {runsError instanceof Error ? runsError.message : 'Unknown error'}
              </div>
            )}

            {runsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : runs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No allocation runs executed yet. Click "Execute Allocation" to run one.
              </div>
            ) : (
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
                    <TableCell className="font-medium">{run.period_from} to {run.period_to}</TableCell>
                    <TableCell>{getStatusBadge(run.status)}</TableCell>
                    <TableCell className="text-sm">{new Date(run.started_at).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{run.completed_at ? new Date(run.completed_at).toLocaleString() : '-'}</TableCell>
                    <TableCell className="text-right font-mono">{(run.meta as { results_count?: number })?.results_count ?? 0}</TableCell>
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
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
