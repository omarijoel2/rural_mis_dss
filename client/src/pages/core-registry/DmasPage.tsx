import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dmaService } from '../../services/dma.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { RequirePerm } from '../../components/RequirePerm';
import { Download, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function DmasPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    status: 'active',
  });
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dmas'],
    queryFn: () => dmaService.getAll({ per_page: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => dmaService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dmas'] });
      setDialogOpen(false);
      setFormData({ code: '', name: '', status: 'active' });
      toast.success('DMA created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create DMA');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/v1/gis/dmas/export', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dmas-${new Date().toISOString().split('T')[0]}.geojson`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">District Metered Areas (DMAs)</h1>
          <p className="text-muted-foreground">Manage water distribution network DMAs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export GeoJSON
          </Button>
          <RequirePerm permission="create dmas">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create DMA
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New DMA</DialogTitle>
                  <DialogDescription>Add a new District Metered Area to the system</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="code">Code*</Label>
                    <Input
                      id="code"
                      placeholder="e.g. DMA-001"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Name*</Label>
                    <Input
                      id="name"
                      placeholder="DMA name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Creating...' : 'Create DMA'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </RequirePerm>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg text-muted-foreground">Loading DMAs...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-2">Error loading DMAs</p>
            <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
          </div>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.data.map((dma) => (
          <Card key={dma.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{dma.name}</CardTitle>
              <CardDescription>Code: {dma.code}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium capitalize ${
                    dma.status === 'active' ? 'text-green-600' : 
                    dma.status === 'planned' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {dma.status}
                  </span>
                </div>
                {dma.nightline_threshold_m3h && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nightline:</span>
                    <span className="font-medium">{dma.nightline_threshold_m3h} m³/h</span>
                  </div>
                )}
                {dma.pressure_target_bar && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pressure:</span>
                    <span className="font-medium">{dma.pressure_target_bar} bar</span>
                  </div>
                )}
                {dma.scheme && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheme:</span>
                    <span className="font-medium text-xs">{dma.scheme.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <p className="text-lg text-muted-foreground mb-4">No DMAs found</p>
            <RequirePerm permission="create dmas">
              <Button>Create Your First DMA</Button>
            </RequirePerm>
          </CardContent>
        </Card>
      )}
        </>
      )}
    </div>
  );
}
