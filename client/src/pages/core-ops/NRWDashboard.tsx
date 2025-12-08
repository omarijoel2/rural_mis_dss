import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { dmaService } from '../../services/dma.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Droplets, TrendingDown, TrendingUp, Wrench, DollarSign, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function NRWDashboard() {
  const [activeTab, setActiveTab] = useState<'snapshots' | 'interventions'>('snapshots');
  const [snapshotDialogOpen, setSnapshotDialogOpen] = useState(false);
  const [interventionDialogOpen, setInterventionDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const [snapshotForm, setSnapshotForm] = useState({
    dma_id: '',
    as_of: format(new Date(), 'yyyy-MM-dd'),
    system_input_volume_m3: '',
    billed_authorized_m3: '',
    unbilled_authorized_m3: '',
    apparent_losses_m3: '',
    real_losses_m3: '',
  });

  const [interventionForm, setInterventionForm] = useState({
    dma_id: '',
    type: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    estimated_savings_m3d: '',
    realized_savings_m3d: '',
    cost: '',
    responsible: '',
    notes: '',
  });

  const { data: snapshots, isLoading: snapshotsLoading } = useQuery({
    queryKey: ['nrw-snapshots'],
    queryFn: () => coreOpsService.nrw.getSnapshots({ per_page: 50 }),
    enabled: activeTab === 'snapshots',
  });

  const { data: interventions, isLoading: interventionsLoading } = useQuery({
    queryKey: ['nrw-interventions'],
    queryFn: () => coreOpsService.nrw.getInterventions({ per_page: 50 }),
    enabled: activeTab === 'interventions',
  });

  const { data: dmas } = useQuery({
    queryKey: ['dmas'],
    queryFn: () => dmaService.getAll({ per_page: 100 }),
  });

  const createSnapshotMutation = useMutation({
    mutationFn: (data: any) => coreOpsService.nrw.createSnapshot(data),
    onSuccess: () => {
      toast.success('NRW snapshot recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['nrw-snapshots'] });
      setSnapshotDialogOpen(false);
      resetSnapshotForm();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to record snapshot');
    },
  });

  const createInterventionMutation = useMutation({
    mutationFn: (data: any) => coreOpsService.nrw.createIntervention(data),
    onSuccess: () => {
      toast.success('Intervention recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['nrw-interventions'] });
      setInterventionDialogOpen(false);
      resetInterventionForm();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to record intervention');
    },
  });

  const resetSnapshotForm = () => {
    setSnapshotForm({
      dma_id: '',
      as_of: format(new Date(), 'yyyy-MM-dd'),
      system_input_volume_m3: '',
      billed_authorized_m3: '',
      unbilled_authorized_m3: '',
      apparent_losses_m3: '',
      real_losses_m3: '',
    });
  };

  const resetInterventionForm = () => {
    setInterventionForm({
      dma_id: '',
      type: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      estimated_savings_m3d: '',
      realized_savings_m3d: '',
      cost: '',
      responsible: '',
      notes: '',
    });
  };

  const handleSnapshotSubmit = () => {
    const systemInput = parseFloat(snapshotForm.system_input_volume_m3) || 0;
    const billedAuth = parseFloat(snapshotForm.billed_authorized_m3) || 0;
    const unbilledAuth = parseFloat(snapshotForm.unbilled_authorized_m3) || 0;
    const apparentLosses = parseFloat(snapshotForm.apparent_losses_m3) || 0;
    const realLosses = parseFloat(snapshotForm.real_losses_m3) || 0;

    const nrwM3 = systemInput - billedAuth - unbilledAuth;
    const nrwPct = systemInput > 0 ? (nrwM3 / systemInput) * 100 : 0;

    createSnapshotMutation.mutate({
      dma_id: snapshotForm.dma_id,
      as_of: snapshotForm.as_of,
      system_input_volume_m3: systemInput,
      billed_authorized_m3: billedAuth,
      unbilled_authorized_m3: unbilledAuth,
      apparent_losses_m3: apparentLosses,
      real_losses_m3: realLosses,
      nrw_m3: nrwM3,
      nrw_pct: nrwPct,
    });
  };

  const handleInterventionSubmit = () => {
    createInterventionMutation.mutate({
      dma_id: interventionForm.dma_id || undefined,
      type: interventionForm.type,
      date: interventionForm.date,
      estimated_savings_m3d: parseFloat(interventionForm.estimated_savings_m3d) || undefined,
      realized_savings_m3d: parseFloat(interventionForm.realized_savings_m3d) || undefined,
      cost: parseFloat(interventionForm.cost) || undefined,
      responsible: interventionForm.responsible || undefined,
      notes: interventionForm.notes || undefined,
    });
  };

  const getNRWColor = (nrwPct: number) => {
    if (nrwPct < 15) return 'text-green-600';
    if (nrwPct < 25) return 'text-yellow-600';
    if (nrwPct < 35) return 'text-orange-600';
    return 'text-red-600';
  };

  const getInterventionIcon = (type: string) => {
    switch (type) {
      case 'leak_repair':
        return <Wrench className="h-4 w-4" />;
      case 'meter_replacement':
        return <Droplets className="h-4 w-4" />;
      default:
        return <TrendingDown className="h-4 w-4" />;
    }
  };

  const interventionTypes = [
    { value: 'leak_repair', label: 'Leak Repair' },
    { value: 'meter_replacement', label: 'Meter Replacement' },
    { value: 'prv_tuning', label: 'PRV Tuning' },
    { value: 'sectorization', label: 'Sectorization' },
    { value: 'campaign', label: 'Campaign' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6 bg-background">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">NRW & Water Balance</h1>
          <p className="text-muted-foreground">Non-Revenue Water monitoring and intervention tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setInterventionDialogOpen(true)}>
            <Wrench className="mr-2 h-4 w-4" />
            Record Intervention
          </Button>
          <Button onClick={() => setSnapshotDialogOpen(true)}>
            <Droplets className="mr-2 h-4 w-4" />
            Record Snapshot
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="bg-muted">
          <TabsTrigger value="snapshots">NRW Snapshots</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
        </TabsList>

        <TabsContent value="snapshots" className="mt-6">
          {snapshotsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {snapshots?.data.map((snapshot) => (
                  <Card key={snapshot.id} className="bg-card text-card-foreground hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base text-foreground">
                            {snapshot.dma?.name || 'Unknown DMA'}
                          </CardTitle>
                          <CardDescription>
                            {format(new Date(snapshot.as_of), 'PPP')}
                          </CardDescription>
                        </div>
                        <div className={`text-2xl font-bold ${getNRWColor(snapshot.nrw_pct)}`}>
                          {snapshot.nrw_pct.toFixed(1)}%
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">System Input</div>
                          <div className="font-medium text-foreground">
                            {snapshot.system_input_volume_m3.toLocaleString()} m³
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">NRW Volume</div>
                          <div className="font-medium text-foreground">
                            {snapshot.nrw_m3.toLocaleString()} m³
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Billed Authorized:</span>
                          <span className="font-medium text-foreground">
                            {snapshot.billed_authorized_m3.toLocaleString()} m³
                          </span>
                        </div>
                        {snapshot.unbilled_authorized_m3 && snapshot.unbilled_authorized_m3 > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Unbilled Authorized:</span>
                            <span className="font-medium text-foreground">
                              {snapshot.unbilled_authorized_m3.toLocaleString()} m³
                            </span>
                          </div>
                        )}
                        {snapshot.apparent_losses_m3 && snapshot.apparent_losses_m3 > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Apparent Losses:</span>
                            <span className="font-medium text-foreground">
                              {snapshot.apparent_losses_m3.toLocaleString()} m³
                            </span>
                          </div>
                        )}
                        {snapshot.real_losses_m3 && snapshot.real_losses_m3 > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Real Losses:</span>
                            <span className="font-medium text-foreground">
                              {snapshot.real_losses_m3.toLocaleString()} m³
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {snapshots?.data.length === 0 && (
                <Card className="bg-card text-card-foreground">
                  <CardContent className="flex flex-col items-center justify-center p-12">
                    <Droplets className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground mb-4">No NRW snapshots recorded</p>
                    <Button onClick={() => setSnapshotDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Record First Snapshot
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="interventions" className="mt-6">
          {interventionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {interventions?.data.map((intervention) => (
                  <Card key={intervention.id} className="bg-card text-card-foreground hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getInterventionIcon(intervention.type)}
                          <div>
                            <CardTitle className="text-base text-foreground capitalize">
                              {intervention.type.replace('_', ' ')}
                            </CardTitle>
                            <CardDescription>
                              {intervention.dma?.name || intervention.asset?.name || 'General'}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {format(new Date(intervention.date), 'PP')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {intervention.estimated_savings_m3d && (
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="text-xs text-muted-foreground">Est. Savings</div>
                              <div className="font-medium text-foreground">
                                {intervention.estimated_savings_m3d.toLocaleString()} m³/day
                              </div>
                            </div>
                          </div>
                        )}
                        {intervention.cost && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-xs text-muted-foreground">Cost</div>
                              <div className="font-medium text-foreground">
                                KES {intervention.cost.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        )}
                        {intervention.responsible && (
                          <div>
                            <div className="text-xs text-muted-foreground">Responsible</div>
                            <div className="font-medium text-foreground">{intervention.responsible}</div>
                          </div>
                        )}
                      </div>
                      {intervention.notes && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-xs text-muted-foreground">{intervention.notes}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {interventions?.data.length === 0 && (
                <Card className="bg-card text-card-foreground">
                  <CardContent className="flex flex-col items-center justify-center p-12">
                    <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground mb-4">No interventions recorded</p>
                    <Button onClick={() => setInterventionDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Record First Intervention
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={snapshotDialogOpen} onOpenChange={setSnapshotDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record NRW Snapshot</DialogTitle>
            <DialogDescription>
              Enter water balance data for a DMA. NRW percentage will be calculated automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dma">DMA Zone *</Label>
                <Select
                  value={snapshotForm.dma_id}
                  onValueChange={(v) => setSnapshotForm({ ...snapshotForm, dma_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select DMA" />
                  </SelectTrigger>
                  <SelectContent>
                    {dmas?.data.map((dma) => (
                      <SelectItem key={dma.id} value={dma.id}>
                        {dma.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="as_of">Date *</Label>
                <Input
                  id="as_of"
                  type="date"
                  value={snapshotForm.as_of}
                  onChange={(e) => setSnapshotForm({ ...snapshotForm, as_of: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="system_input">System Input Volume (m³) *</Label>
              <Input
                id="system_input"
                type="number"
                placeholder="e.g., 10000"
                value={snapshotForm.system_input_volume_m3}
                onChange={(e) => setSnapshotForm({ ...snapshotForm, system_input_volume_m3: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billed_auth">Billed Authorized (m³) *</Label>
                <Input
                  id="billed_auth"
                  type="number"
                  placeholder="e.g., 7500"
                  value={snapshotForm.billed_authorized_m3}
                  onChange={(e) => setSnapshotForm({ ...snapshotForm, billed_authorized_m3: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unbilled_auth">Unbilled Authorized (m³)</Label>
                <Input
                  id="unbilled_auth"
                  type="number"
                  placeholder="e.g., 200"
                  value={snapshotForm.unbilled_authorized_m3}
                  onChange={(e) => setSnapshotForm({ ...snapshotForm, unbilled_authorized_m3: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apparent_losses">Apparent Losses (m³)</Label>
                <Input
                  id="apparent_losses"
                  type="number"
                  placeholder="e.g., 500"
                  value={snapshotForm.apparent_losses_m3}
                  onChange={(e) => setSnapshotForm({ ...snapshotForm, apparent_losses_m3: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="real_losses">Real Losses (m³)</Label>
                <Input
                  id="real_losses"
                  type="number"
                  placeholder="e.g., 1800"
                  value={snapshotForm.real_losses_m3}
                  onChange={(e) => setSnapshotForm({ ...snapshotForm, real_losses_m3: e.target.value })}
                />
              </div>
            </div>

            {snapshotForm.system_input_volume_m3 && snapshotForm.billed_authorized_m3 && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Calculated NRW:</div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {(
                      parseFloat(snapshotForm.system_input_volume_m3 || '0') -
                      parseFloat(snapshotForm.billed_authorized_m3 || '0') -
                      parseFloat(snapshotForm.unbilled_authorized_m3 || '0')
                    ).toLocaleString()} m³
                  </span>
                  <span className={`text-xl font-bold ${getNRWColor(
                    ((parseFloat(snapshotForm.system_input_volume_m3 || '0') -
                      parseFloat(snapshotForm.billed_authorized_m3 || '0') -
                      parseFloat(snapshotForm.unbilled_authorized_m3 || '0')) /
                      parseFloat(snapshotForm.system_input_volume_m3 || '1')) * 100
                  )}`}>
                    {(
                      ((parseFloat(snapshotForm.system_input_volume_m3 || '0') -
                        parseFloat(snapshotForm.billed_authorized_m3 || '0') -
                        parseFloat(snapshotForm.unbilled_authorized_m3 || '0')) /
                        parseFloat(snapshotForm.system_input_volume_m3 || '1')) * 100
                    ).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSnapshotDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSnapshotSubmit}
              disabled={!snapshotForm.dma_id || !snapshotForm.system_input_volume_m3 || !snapshotForm.billed_authorized_m3 || createSnapshotMutation.isPending}
            >
              {createSnapshotMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Snapshot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={interventionDialogOpen} onOpenChange={setInterventionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record Intervention</DialogTitle>
            <DialogDescription>
              Document an NRW reduction intervention such as leak repairs or meter replacements.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="intervention_type">Intervention Type *</Label>
                <Select
                  value={interventionForm.type}
                  onValueChange={(v) => setInterventionForm({ ...interventionForm, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {interventionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="intervention_date">Date *</Label>
                <Input
                  id="intervention_date"
                  type="date"
                  value={interventionForm.date}
                  onChange={(e) => setInterventionForm({ ...interventionForm, date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="intervention_dma">DMA Zone (Optional)</Label>
              <Select
                value={interventionForm.dma_id}
                onValueChange={(v) => setInterventionForm({ ...interventionForm, dma_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select DMA (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {dmas?.data.map((dma) => (
                    <SelectItem key={dma.id} value={dma.id}>
                      {dma.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_savings">Est. Savings (m³/day)</Label>
                <Input
                  id="estimated_savings"
                  type="number"
                  placeholder="e.g., 50"
                  value={interventionForm.estimated_savings_m3d}
                  onChange={(e) => setInterventionForm({ ...interventionForm, estimated_savings_m3d: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="realized_savings">Realized Savings (m³/day)</Label>
                <Input
                  id="realized_savings"
                  type="number"
                  placeholder="e.g., 45"
                  value={interventionForm.realized_savings_m3d}
                  onChange={(e) => setInterventionForm({ ...interventionForm, realized_savings_m3d: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Cost (KES)</Label>
                <Input
                  id="cost"
                  type="number"
                  placeholder="e.g., 50000"
                  value={interventionForm.cost}
                  onChange={(e) => setInterventionForm({ ...interventionForm, cost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsible">Responsible Party</Label>
                <Input
                  id="responsible"
                  type="text"
                  placeholder="e.g., Operations Team"
                  value={interventionForm.responsible}
                  onChange={(e) => setInterventionForm({ ...interventionForm, responsible: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional details about the intervention..."
                value={interventionForm.notes}
                onChange={(e) => setInterventionForm({ ...interventionForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInterventionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInterventionSubmit}
              disabled={!interventionForm.type || createInterventionMutation.isPending}
            >
              {createInterventionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Intervention
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
