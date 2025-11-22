import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Plus, Pencil, Trash2, Power } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function TelemetryDashboard() {
  const [filters, setFilters] = useState({
    category: '',
    enabled: true,
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [formData, setFormData] = useState({
    tag_name: '',
    data_type: 'float',
    unit: '',
    category: '',
    enabled: true,
    thresholds: {} as Record<string, number>,
  });
  const queryClient = useQueryClient();

  const { data: tags, isLoading, error } = useQuery({
    queryKey: ['telemetry-tags', filters],
    queryFn: () => coreOpsService.telemetry.getTags({ ...filters, per_page: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => coreOpsService.telemetry.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telemetry-tags'] });
      setCreateDialogOpen(false);
      setFormData({ tag_name: '', data_type: 'float', unit: '', category: '', enabled: true, thresholds: {} });
      toast.success('Telemetry tag created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create telemetry tag');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      if (!selectedTag) throw new Error('No tag selected');
      return coreOpsService.telemetry.updateTag(selectedTag.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telemetry-tags'] });
      setEditDialogOpen(false);
      setSelectedTag(null);
      toast.success('Telemetry tag updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update telemetry tag');
    },
  });

  const toggleEnabledMutation = useMutation({
    mutationFn: (tag: any) => coreOpsService.telemetry.updateTag(tag.id, { enabled: !tag.enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telemetry-tags'] });
      toast.success('Tag status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update tag status');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tag_name || !formData.data_type) {
      toast.error('Tag name and data type are required');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEditTag = (tag: any) => {
    setSelectedTag(tag);
    setFormData({
      tag_name: tag.tag_name,
      data_type: tag.data_type,
      unit: tag.unit || '',
      category: tag.category || '',
      enabled: tag.enabled,
      thresholds: tag.thresholds || {},
    });
    setEditDialogOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tag_name || !formData.data_type) {
      toast.error('Tag name and data type are required');
      return;
    }
    updateMutation.mutate(formData);
  };

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'float':
      case 'int':
        return <TrendingUp className="h-4 w-4" />;
      case 'bool':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const hasAlarms = (tag: any) => {
    return tag.thresholds && Object.keys(tag.thresholds).length > 0;
  };

  return (
    <div className="container mx-auto p-6 space-y-6 bg-background">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Telemetry & SCADA</h1>
          <p className="text-muted-foreground">Real-time monitoring and data acquisition</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Telemetry Tag</DialogTitle>
              <DialogDescription>Add a new telemetry tag for SCADA monitoring</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tag_name">Tag Name*</Label>
                  <Input
                    id="tag_name"
                    placeholder="e.g. Pump_01_Pressure"
                    value={formData.tag_name}
                    onChange={(e) => setFormData({ ...formData, tag_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_type">Data Type*</Label>
                  <Select value={formData.data_type} onValueChange={(v) => setFormData({ ...formData, data_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="float">Float</SelectItem>
                      <SelectItem value="int">Integer</SelectItem>
                      <SelectItem value="bool">Boolean</SelectItem>
                      <SelectItem value="string">String</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    placeholder="e.g. bar, m³/h, °C"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g. pressure, flow, temperature"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label className="cursor-pointer">Enable this tag</Label>
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Tag'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-foreground">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
              <Input
                placeholder="Filter by category..."
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="bg-background text-foreground"
              />
            </div>
            <div className="w-48">
              <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
              <Select
                value={filters.enabled ? 'enabled' : 'all'}
                onValueChange={(value) => setFilters({ ...filters, enabled: value === 'enabled' })}
              >
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  <SelectItem value="enabled">Enabled Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => setFilters({ category: '', enabled: true })}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && !tags ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Loading telemetry tags...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-lg text-destructive">Error loading telemetry: {(error as Error).message}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags?.data.map((tag) => (
              <Card key={tag.id} className={`bg-card text-card-foreground ${!tag.enabled ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getDataTypeIcon(tag.data_type)}
                      <CardTitle className="text-base text-foreground">{tag.tag_name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      {hasAlarms(tag) && (
                        <Badge variant="outline" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Alarms
                        </Badge>
                      )}
                      {!tag.enabled && (
                        <Badge variant="secondary" className="text-xs">Disabled</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {tag.scheme?.name || tag.asset?.name || tag.facility?.name || 'Unassigned'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">{tag.data_type}</Badge>
                    </div>
                    {tag.unit && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Unit:</span>
                        <span className="font-medium text-foreground">{tag.unit}</span>
                      </div>
                    )}
                    {tag.category && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium text-foreground">{tag.category}</span>
                      </div>
                    )}
                    {tag.thresholds && Object.keys(tag.thresholds).length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-xs font-medium text-foreground mb-2">Thresholds</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(tag.thresholds).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                              <span className="font-medium text-foreground">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTag(tag)}
                      className="flex-1"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleEnabledMutation.mutate(tag)}
                      disabled={toggleEnabledMutation.isPending}
                      className="flex-1"
                    >
                      <Power className="h-3 w-3 mr-1" />
                      {tag.enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {tags?.data.length === 0 && (
            <Card className="bg-card text-card-foreground">
              <CardContent className="flex flex-col items-center justify-center p-12">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-4">No telemetry tags found</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Telemetry Tag</DialogTitle>
            <DialogDescription>Update telemetry tag configuration</DialogDescription>
          </DialogHeader>
          {selectedTag && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_tag_name">Tag Name*</Label>
                  <Input
                    id="edit_tag_name"
                    placeholder="e.g. Pump_01_Pressure"
                    value={formData.tag_name}
                    onChange={(e) => setFormData({ ...formData, tag_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_data_type">Data Type*</Label>
                  <Select value={formData.data_type} onValueChange={(v) => setFormData({ ...formData, data_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="float">Float</SelectItem>
                      <SelectItem value="int">Integer</SelectItem>
                      <SelectItem value="bool">Boolean</SelectItem>
                      <SelectItem value="string">String</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_unit">Unit</Label>
                  <Input
                    id="edit_unit"
                    placeholder="e.g. bar, m³/h, °C"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_category">Category</Label>
                  <Input
                    id="edit_category"
                    placeholder="e.g. pressure, flow, temperature"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label className="cursor-pointer">Enable this tag</Label>
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Tag'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
