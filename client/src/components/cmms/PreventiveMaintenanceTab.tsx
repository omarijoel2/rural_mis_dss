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
import { Switch } from '../../components/ui/switch';
import { Plus, Calendar, Clock, Play, CheckCircle, AlertTriangle, Loader2, Trash2, Edit } from 'lucide-react';
import type { PmTemplate } from '../../types/cmms';
import { toast } from 'sonner';

const TRIGGER_TYPE_LABELS: Record<string, string> = {
  time_based: 'Time-Based',
  usage_based: 'Usage-Based',
  combined: 'Combined',
};

const TRIGGER_TYPE_COLORS: Record<string, string> = {
  time_based: 'bg-blue-100 text-blue-800',
  usage_based: 'bg-purple-100 text-purple-800',
  combined: 'bg-green-100 text-green-800',
};

export function PreventiveMaintenanceTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PmTemplate | undefined>();
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [classFilter, setClassFilter] = useState<number | undefined>(undefined);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTriggerType, setFormTriggerType] = useState<'time_based' | 'usage_based' | 'combined'>('time_based');
  const [formFrequencyDays, setFormFrequencyDays] = useState('');
  const [formToleranceDays, setFormToleranceDays] = useState('');
  const [formAssetClassId, setFormAssetClassId] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formChecklist, setFormChecklist] = useState('');

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

  const createMutation = useMutation({
    mutationFn: (data: CreatePmTemplateDto) => assetService.createPmTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-templates'] });
      resetForm();
      setDialogOpen(false);
      toast.success('PM template created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create template');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreatePmTemplateDto> }) => 
      assetService.updatePmTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-templates'] });
      resetForm();
      setDialogOpen(false);
      toast.success('PM template updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update template');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => assetService.deletePmTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-templates'] });
      toast.success('PM template deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete template');
    },
  });

  const generateMutation = useMutation({
    mutationFn: (templateId?: number) => assetService.generatePmWorkOrders(templateId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success(`Generated ${data.count} work orders`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate work orders');
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

  const activeTemplates = templates?.filter(t => t.is_active).length || 0;
  const totalTemplates = templates?.length || 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTemplates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeTemplates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalTemplates - activeTemplates}</div>
          </CardContent>
        </Card>
        <Card className="flex flex-col justify-center">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generateMutation.mutate(undefined)}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Generate All
              </Button>
              <Button size="sm" onClick={() => {
                resetForm();
                setDialogOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                New
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4">
            <Select 
              value={activeFilter === undefined ? 'all' : activeFilter ? 'active' : 'inactive'}
              onValueChange={(v) => setActiveFilter(v === 'all' ? undefined : v === 'active')}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
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
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Asset Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Asset Class</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Gen</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No PM templates found. Create your first template to schedule preventive maintenance.
                      </TableCell>
                    </TableRow>
                  ) : (
                    templates?.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>{template.asset_class?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge className={TRIGGER_TYPE_COLORS[template.trigger_type]}>
                            {TRIGGER_TYPE_LABELS[template.trigger_type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {template.frequency_days ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {template.frequency_days}d
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={template.is_active ? 'default' : 'secondary'}>
                            {template.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {template.next_gen_date ? (
                            <span className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              {new Date(template.next_gen_date).toLocaleDateString()}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => generateMutation.mutate(template.id)}
                              disabled={generateMutation.isPending}
                              title="Generate work orders"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm('Delete this PM template?')) {
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
              <Label htmlFor="pm-name">Template Name *</Label>
              <Input
                id="pm-name"
                placeholder="e.g., Monthly Pump Inspection"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pm-description">Description</Label>
              <Textarea
                id="pm-description"
                placeholder="Describe the maintenance activities..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pm-asset-class">Asset Class *</Label>
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
              <Label htmlFor="pm-trigger-type">Trigger Type</Label>
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
                  <Label htmlFor="pm-frequency">Frequency (Days)</Label>
                  <Input
                    id="pm-frequency"
                    type="number"
                    placeholder="e.g., 30"
                    value={formFrequencyDays}
                    onChange={(e) => setFormFrequencyDays(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pm-tolerance">Tolerance (Days)</Label>
                  <Input
                    id="pm-tolerance"
                    type="number"
                    placeholder="e.g., 5"
                    value={formToleranceDays}
                    onChange={(e) => setFormToleranceDays(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="pm-checklist">Checklist Items (one per line)</Label>
              <Textarea
                id="pm-checklist"
                placeholder="Check oil level&#10;Inspect belts&#10;Test alarms"
                rows={3}
                value={formChecklist}
                onChange={(e) => setFormChecklist(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="pm-is-active"
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
              <Label htmlFor="pm-is-active">Active</Label>
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
