import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetService, CreatePmTemplateDto } from '../../services/asset.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import { Plus, Calendar, Clock, Settings, Play, CheckCircle, AlertTriangle, BarChart3, Loader2, Trash2, Edit } from 'lucide-react';
import type { PmTemplate, AssetClass } from '../../types/cmms';

const TRIGGER_TYPE_LABELS = {
  time_based: 'Time-Based',
  usage_based: 'Usage-Based',
  combined: 'Combined',
};

const TRIGGER_TYPE_COLORS = {
  time_based: 'bg-blue-100 text-blue-800',
  usage_based: 'bg-purple-100 text-purple-800',
  combined: 'bg-green-100 text-green-800',
};

export function PreventiveMaintenancePage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PmTemplate | undefined>();
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [classFilter, setClassFilter] = useState<number | undefined>(undefined);
  const [generatingAll, setGeneratingAll] = useState(false);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTriggerType, setFormTriggerType] = useState<'time_based' | 'usage_based' | 'combined'>('time_based');
  const [formFrequencyDays, setFormFrequencyDays] = useState('');
  const [formToleranceDays, setFormToleranceDays] = useState('');
  const [formAssetClassId, setFormAssetClassId] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formChecklist, setFormChecklist] = useState('');

  const [complianceStart, setComplianceStart] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [complianceEnd, setComplianceEnd] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ['pm-templates', activeFilter, classFilter],
    queryFn: () => assetService.getPmTemplates({ 
      is_active: activeFilter, 
      asset_class_id: classFilter 
    }),
  });

  const { data: classes } = useQuery({
    queryKey: ['asset-classes'],
    queryFn: () => assetService.getClasses(),
  });

  const { data: compliance, isLoading: loadingCompliance } = useQuery({
    queryKey: ['pm-compliance', complianceStart, complianceEnd],
    queryFn: () => assetService.getPmCompliance(complianceStart, complianceEnd),
    enabled: Boolean(complianceStart && complianceEnd),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePmTemplateDto) => assetService.createPmTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-templates'] });
      resetForm();
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreatePmTemplateDto> }) => 
      assetService.updatePmTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-templates'] });
      resetForm();
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => assetService.deletePmTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-templates'] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: (templateId?: number) => assetService.generatePmWorkOrders(templateId),
    onSuccess: (data) => {
      setGeneratingAll(false);
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      alert(`Generated ${data.count} work orders successfully.`);
    },
    onError: () => {
      setGeneratingAll(false);
    },
  });

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormTriggerType('time_based');
    setFormFrequencyDays('');
    setFormToleranceDays('');
    setFormAssetClassId('');
    setFormIsActive(true);
    setFormChecklist('');
    setEditingTemplate(undefined);
  };

  const openEditDialog = (template: PmTemplate) => {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormDescription(template.description || '');
    setFormTriggerType(template.trigger_type);
    setFormFrequencyDays(template.frequency_days?.toString() || '');
    setFormToleranceDays(template.tolerance_days?.toString() || '');
    setFormAssetClassId(template.asset_class_id.toString());
    setFormIsActive(template.is_active);
    setFormChecklist(template.checklist?.join('\n') || '');
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formName || !formAssetClassId) return;

    const data: CreatePmTemplateDto = {
      name: formName,
      description: formDescription || undefined,
      trigger_type: formTriggerType,
      frequency_days: formFrequencyDays ? parseInt(formFrequencyDays) : undefined,
      tolerance_days: formToleranceDays ? parseInt(formToleranceDays) : undefined,
      asset_class_id: parseInt(formAssetClassId),
      is_active: formIsActive,
      checklist: formChecklist ? formChecklist.split('\n').filter(s => s.trim()) : undefined,
    };

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleGenerateAll = () => {
    setGeneratingAll(true);
    generateMutation.mutate(undefined);
  };

  const activeTemplates = templates?.filter(t => t.is_active).length || 0;
  const totalTemplates = templates?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Preventive Maintenance</h1>
          <p className="text-muted-foreground">Manage PM templates and schedule preventive work orders</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleGenerateAll}
            disabled={generatingAll || generateMutation.isPending}
          >
            {(generatingAll || generateMutation.isPending) ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Generate All Due PM
          </Button>
          <Button onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTemplates}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeTemplates}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive Templates</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{totalTemplates - activeTemplates}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 mb-6">
                <Select 
                  value={activeFilter === undefined ? 'all' : activeFilter ? 'active' : 'inactive'}
                  onValueChange={(v) => setActiveFilter(v === 'all' ? undefined : v === 'active')}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Templates</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={classFilter?.toString() || 'all'}
                  onValueChange={(v) => setClassFilter(v === 'all' ? undefined : parseInt(v))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by asset class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Asset Classes</SelectItem>
                    {classes?.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template Name</TableHead>
                        <TableHead>Asset Class</TableHead>
                        <TableHead>Trigger Type</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Next Generation</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                            No PM templates found. Create your first template to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        templates?.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">{template.name}</TableCell>
                            <TableCell>{template.asset_class?.name || 'Unknown'}</TableCell>
                            <TableCell>
                              <Badge className={TRIGGER_TYPE_COLORS[template.trigger_type]}>
                                {TRIGGER_TYPE_LABELS[template.trigger_type]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {template.frequency_days ? (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  {template.frequency_days} days
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={template.is_active ? 'default' : 'secondary'}>
                                {template.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {template.next_gen_date ? (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  {new Date(template.next_gen_date).toLocaleDateString()}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Not set</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => generateMutation.mutate(template.id)}
                                  disabled={generateMutation.isPending}
                                  title="Generate work orders"
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(template)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this template?')) {
                                      deleteMutation.mutate(template.id);
                                    }
                                  }}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PM Compliance Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="space-y-2">
                  <Label>Period Start</Label>
                  <Input
                    type="date"
                    value={complianceStart}
                    onChange={(e) => setComplianceStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Period End</Label>
                  <Input
                    type="date"
                    value={complianceEnd}
                    onChange={(e) => setComplianceEnd(e.target.value)}
                  />
                </div>
              </div>

              {loadingCompliance ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : compliance ? (
                <div className="grid gap-4 md:grid-cols-4 mt-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-3xl font-bold ${
                        (compliance.compliance_pct || 0) >= 90 ? 'text-green-600' :
                        (compliance.compliance_pct || 0) >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {compliance.compliance_pct?.toFixed(1) || 0}%
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">PM Scheduled</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{compliance.pm_scheduled || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Completed On-Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">{compliance.pm_completed_on_time || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Completed Late</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-yellow-600">{compliance.pm_completed_late || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Deferred</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-orange-600">{compliance.pm_deferred || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Skipped</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-600">{compliance.pm_skipped || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Breakdown WOs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{compliance.breakdown_wo || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">PM/Breakdown Ratio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {compliance.pm_breakdown_ratio?.toFixed(2) || 'N/A'}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Select a date range to view compliance metrics
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit PM Template' : 'Create PM Template'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Monthly Pump Inspection"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the maintenance activities..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-class">Asset Class *</Label>
              <Select value={formAssetClassId} onValueChange={setFormAssetClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trigger-type">Trigger Type</Label>
              <Select 
                value={formTriggerType} 
                onValueChange={(v) => setFormTriggerType(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time_based">Time-Based</SelectItem>
                  <SelectItem value="usage_based">Usage-Based</SelectItem>
                  <SelectItem value="combined">Combined</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formTriggerType === 'time_based' || formTriggerType === 'combined') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency (Days)</Label>
                  <Input
                    id="frequency"
                    type="number"
                    placeholder="e.g., 30"
                    value={formFrequencyDays}
                    onChange={(e) => setFormFrequencyDays(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tolerance">Tolerance (Days)</Label>
                  <Input
                    id="tolerance"
                    type="number"
                    placeholder="e.g., 5"
                    value={formToleranceDays}
                    onChange={(e) => setFormToleranceDays(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="checklist">Checklist Items (one per line)</Label>
              <Textarea
                id="checklist"
                placeholder="Check oil level&#10;Inspect belts&#10;Test alarms"
                rows={4}
                value={formChecklist}
                onChange={(e) => setFormChecklist(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-active"
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
              <Label htmlFor="is-active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formName || !formAssetClassId || createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingTemplate ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
