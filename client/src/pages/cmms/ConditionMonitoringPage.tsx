import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conditionMonitoringService } from '../../services/cmms.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
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
  DialogTrigger,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Activity, AlertTriangle, TrendingUp, Gauge, Plus, Edit } from 'lucide-react';
import type { ConditionTag } from '../../types/cmms';
import { toast } from 'sonner';

const HEALTH_COLORS = {
  normal: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  alarm: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export function ConditionMonitoringPage() {
  const [filters, setFilters] = useState({ page: 1, per_page: 20 });
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [readingDialogOpen, setReadingDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<ConditionTag | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['condition-tags', filters],
    queryFn: () => conditionMonitoringService.getTags(filters),
  });

  const createTagMutation = useMutation({
    mutationFn: conditionMonitoringService.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condition-tags'] });
      setTagDialogOpen(false);
      toast.success('Tag created successfully');
    },
    onError: () => toast.error('Failed to create tag'),
  });

  const recordReadingMutation = useMutation({
    mutationFn: ({ tagId, data }: { tagId: number; data: any }) =>
      conditionMonitoringService.recordReading(tagId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condition-tags'] });
      setReadingDialogOpen(false);
      toast.success('Reading recorded');
    },
    onError: () => toast.error('Failed to record reading'),
  });

  const handleCreateTag = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const lowerLimit = parseFloat(formData.get('lower_limit') as string);
    const upperLimit = parseFloat(formData.get('upper_limit') as string);
    
    if (isNaN(lowerLimit) || isNaN(upperLimit)) {
      toast.error('Please enter valid numeric values');
      e.currentTarget.reset();
      return;
    }
    
    const data = {
      tag: formData.get('tag') as string,
      parameter: formData.get('parameter') as string,
      unit: formData.get('unit') as string,
      lower_limit: lowerLimit,
      upper_limit: upperLimit,
      is_active: true,
    };
    createTagMutation.mutate(data);
  };

  const handleRecordReading = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTag) {
      toast.error('No tag selected');
      return;
    }
    const formData = new FormData(e.currentTarget);
    const value = parseFloat(formData.get('value') as string);
    
    if (isNaN(value)) {
      toast.error('Please enter a valid numeric value');
      e.currentTarget.reset();
      return;
    }
    
    const data = {
      value,
      recorded_at: new Date().toISOString(),
    };
    recordReadingMutation.mutate({ tagId: selectedTag.id, data });
  };

  const activeAlarms = data?.data?.filter(tag => tag.health_status !== 'normal') || [];
  const criticalCount = activeAlarms.filter(tag => tag.health_status === 'critical').length;
  const alarmCount = activeAlarms.filter(tag => tag.health_status === 'alarm').length;
  const warningCount = activeAlarms.filter(tag => tag.health_status === 'warning').length;

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Failed to load condition tags</h3>
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
          <p className="text-muted-foreground">Real-time asset health and predictive analytics</p>
        </div>
        <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Condition Tag</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTag} className="space-y-4">
              <div>
                <Label htmlFor="tag">Tag ID</Label>
                <Input id="tag" name="tag" placeholder="PUMP-01-VIBRATION" required />
              </div>
              <div>
                <Label htmlFor="parameter">Parameter</Label>
                <Input id="parameter" name="parameter" placeholder="Vibration" required />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" name="unit" placeholder="mm/s" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lower_limit">Lower Limit</Label>
                  <Input
                    id="lower_limit"
                    name="lower_limit"
                    type="number"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="upper_limit">Upper Limit</Label>
                  <Input
                    id="upper_limit"
                    name="upper_limit"
                    type="number"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setTagDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTagMutation.isPending}>
                  Create
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Active Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Monitoring points</p>
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
            <p className="text-xs text-muted-foreground">Immediate action required</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Alarms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{alarmCount}</div>
            <p className="text-xs text-muted-foreground">Out of range</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <p className="text-xs text-muted-foreground">Watch closely</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Condition Tags</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No condition tags configured. Create one to start monitoring.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Last Value</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Last Reading</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-mono">{tag.tag}</TableCell>
                    <TableCell>{tag.parameter}</TableCell>
                    <TableCell className="font-semibold">
                      {tag.last_value?.toFixed(2) || '—'} {tag.unit}
                    </TableCell>
                    <TableCell>
                      <Badge className={HEALTH_COLORS[tag.health_status]}>
                        {tag.health_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tag.last_reading_at
                        ? new Date(tag.last_reading_at).toLocaleString()
                        : '—'}
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
                        <Edit className="h-4 w-4 mr-1" />
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

      <Dialog open={readingDialogOpen} onOpenChange={setReadingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Reading: {selectedTag?.tag}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRecordReading} className="space-y-4">
            <div>
              <Label htmlFor="value">Value ({selectedTag?.unit})</Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                required
                placeholder={`Between ${selectedTag?.lower_limit} and ${selectedTag?.upper_limit}`}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReadingDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={recordReadingMutation.isPending}>
                Record
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
