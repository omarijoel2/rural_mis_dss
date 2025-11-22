import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facilityService } from '../../services/facility.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Download, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function FacilitiesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    status: 'active',
    scheme_id: '',
  });
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => facilityService.getAll({ per_page: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => facilityService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      setDialogOpen(false);
      setFormData({ code: '', name: '', category: '', status: 'active', scheme_id: '' });
      toast.success('Facility created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create facility');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/v1/gis/facilities/export', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facilities-${new Date().toISOString().split('T')[0]}.geojson`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const categoryColors: Record<string, string> = {
    source: 'bg-blue-500',
    treatment: 'bg-green-500',
    pumpstation: 'bg-purple-500',
    reservoir: 'bg-cyan-500',
    office: 'bg-gray-500',
    workshop: 'bg-yellow-500',
    warehouse: 'bg-orange-500',
    lab: 'bg-pink-500',
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Facilities</h1>
          <p className="text-muted-foreground">Manage water infrastructure facilities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export GeoJSON
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Facility
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Facility</DialogTitle>
                <DialogDescription>Add a new water infrastructure facility to the registry</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Code*</Label>
                    <Input
                      id="code"
                      placeholder="e.g. FAC-001"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category*</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="source">Water Source</SelectItem>
                        <SelectItem value="treatment">Treatment Plant</SelectItem>
                        <SelectItem value="pumpstation">Pump Station</SelectItem>
                        <SelectItem value="reservoir">Reservoir</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                        <SelectItem value="lab">Lab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="name">Name*</Label>
                  <Input
                    id="name"
                    placeholder="Facility name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="standby">Standby</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="scheme_id">Scheme ID</Label>
                    <Input
                      id="scheme_id"
                      placeholder="Optional"
                      value={formData.scheme_id}
                      onChange={(e) => setFormData({ ...formData, scheme_id: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Facility'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg text-muted-foreground">Loading facilities...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-2">Error loading facilities</p>
            <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.data.map((facility) => (
              <Card key={facility.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{facility.name}</CardTitle>
                      <CardDescription>Code: {facility.code}</CardDescription>
                    </div>
                    <Badge className={categoryColors[facility.category] || 'bg-gray-500'}>
                      {facility.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-medium capitalize ${
                        facility.status === 'active' ? 'text-green-600' : 
                        facility.status === 'standby' ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {facility.status}
                      </span>
                    </div>
                    {facility.scheme && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Scheme:</span>
                        <span className="font-medium truncate ml-2">{facility.scheme.name}</span>
                      </div>
                    )}
                    {facility.commissioned_on && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Commissioned:</span>
                        <span className="font-medium">{new Date(facility.commissioned_on).toLocaleDateString()}</span>
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
                <p className="text-lg text-muted-foreground mb-4">No facilities found</p>
                <Button>Create Your First Facility</Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
