import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { conditionMonitoringService } from '../../services/cmms.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Activity, Plus, TrendingUp, AlertTriangle, Thermometer } from 'lucide-react';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import type { ConditionTag } from '../../types/cmms';
import { toast } from 'sonner';

const STATUS_COLORS = {
  normal: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  alarm: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800',
};

const tagSchema = z.object({
  tag: z.string().min(1, 'Tag is required'),
  parameter: z.string().min(1, 'Parameter is required'),
  unit: z.string().min(1, 'Unit is required'),
  asset_id: z.number().int().positive('Asset ID is required'),
});

const readingSchema = z.object({
  value: z.number(),
  source: z.string().optional(),
});

type TagFormData = z.infer<typeof tagSchema>;
type ReadingFormData = z.infer<typeof readingSchema>;

export function ConditionMonitoringPage() {
  const [filters, setFilters] = useState({ page: 1, per_page: 15 });
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [readingDialogOpen, setReadingDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<ConditionTag | null>(null);
  const queryClient = useQueryClient();

  const tagForm = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      tag: '',
      parameter: '',
      unit: '',
      asset_id: 1,
    },
  });

  const readingForm = useForm<ReadingFormData>({
    resolver: zodResolver(readingSchema),
    defaultValues: {
      value: 0,
      source: 'manual',
    },
  });

  useEffect(() => {
    if (!tagDialogOpen) {
      tagForm.reset();
    }
  }, [tagDialogOpen, tagForm]);

  useEffect(() => {
    if (!readingDialogOpen) {
      readingForm.reset();
      setSelectedTag(null);
    }
  }, [readingDialogOpen, readingForm]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['monitoring-tags', filters],
    queryFn: () => conditionMonitoringService.getTags(filters),
  });

  const createTagMutation = useMutation({
    mutationFn: conditionMonitoringService.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-tags'] });
      setTagDialogOpen(false);
      toast.success('Tag created successfully');
    },
    onError: () => toast.error('Failed to create tag'),
  });

  const ingestReadingMutation = useMutation({
    mutationFn: ({ tagId, data }: { tagId: number; data: any }) => 
      conditionMonitoringService.ingestReading(tagId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-tags'] });
      setReadingDialogOpen(false);
      toast.success('Reading recorded successfully');
    },
    onError: () => toast.error('Failed to record reading'),
  });

  const handleCreateTag = (data: TagFormData) => {
    createTagMutation.mutate(data);
  };

  const handleRecordReading = (data: ReadingFormData) => {
    if (!selectedTag) {
      toast.error('No tag selected');
      return;
    }

    ingestReadingMutation.mutate({
      tagId: selectedTag.id,
      data: {
        value: data.value,
        source: data.source || 'manual',
        read_at: new Date().toISOString(),
      },
    });
  };

  const normalCount = data?.data?.filter(t => t.health_status === 'normal').length || 0;
  const warningCount = data?.data?.filter(t => t.health_status === 'warning').length || 0;
  const criticalCount = data?.data?.filter(t => t.health_status === 'critical' || t.health_status === 'alarm').length || 0;

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Failed to load monitoring data</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Condition Monitoring</h1>
          <p className="text-muted-foreground">Track parameter trends and set alarms</p>
        </div>
        <Button onClick={() => setTagDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Tag
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Monitored parameters</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Normal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{normalCount}</div>
            <p className="text-xs text-muted-foreground">Within limits</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-yellow-600" />
              Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <p className="text-xs text-muted-foreground">Near limits</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Out of limits</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monitoring Tags</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No monitoring tags configured. Create your first tag to start tracking parameters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Limits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Reading</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-mono font-medium">{tag.tag}</TableCell>
                    <TableCell>{tag.parameter}</TableCell>
                    <TableCell>
                      {tag.last_value !== null ? `${tag.last_value} ${tag.unit}` : '—'}
                    </TableCell>
                    <TableCell className="text-xs">
                      Thresholds configured
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[tag.health_status]}>
                        {tag.health_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tag.last_reading_at
                        ? new Date(tag.last_reading_at).toLocaleString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTag(tag);
                          setReadingDialogOpen(true);
                        }}
                      >
                        <Activity className="h-4 w-4 mr-1" />
                        Record
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Monitoring Tag</DialogTitle>
          </DialogHeader>
          <form onSubmit={tagForm.handleSubmit(handleCreateTag)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={tagForm.control}
                name="tag"
                label="Tag ID"
                placeholder="e.g., P-101-FLOW"
                required
                error={tagForm.formState.errors.tag?.message}
              />
              <FormInput
                control={tagForm.control}
                name="parameter"
                label="Parameter"
                placeholder="e.g., Flow Rate"
                required
                error={tagForm.formState.errors.parameter?.message}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={tagForm.control}
                name="unit"
                label="Unit"
                placeholder="e.g., m³/h"
                required
                error={tagForm.formState.errors.unit?.message}
              />
              <FormInput
                control={tagForm.control}
                name="asset_id"
                label="Asset ID"
                type="number"
                required
                error={tagForm.formState.errors.asset_id?.message}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTagDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTagMutation.isPending || !tagForm.formState.isValid}
              >
                Create Tag
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={readingDialogOpen} onOpenChange={setReadingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Reading: {selectedTag?.tag}</DialogTitle>
          </DialogHeader>
          <form onSubmit={readingForm.handleSubmit(handleRecordReading)} className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm font-medium">{selectedTag?.parameter}</p>
              <p className="text-xs text-muted-foreground">
                Tag: {selectedTag?.tag} | Unit: {selectedTag?.unit}
              </p>
            </div>
            <FormInput
              control={readingForm.control}
              name="value"
              label={`Value (${selectedTag?.unit})`}
              type="number"
              step="0.01"
              required
              error={readingForm.formState.errors.value?.message}
            />
            <FormInput
              control={readingForm.control}
              name="source"
              label="Source"
              placeholder="e.g., manual, sensor"
              error={readingForm.formState.errors.source?.message}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReadingDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={ingestReadingMutation.isPending || !readingForm.formState.isValid}
              >
                Record Reading
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
