import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Plus, Edit, Trash2, Calculator } from 'lucide-react';
import { commercialService, type Tariff, type TariffBlock } from '@/services/commercial.service';
import { toast } from 'sonner';

export function Tariffs() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'future'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const queryClient = useQueryClient();

  const { data: tariffsData, isLoading } = useQuery({
    queryKey: ['tariffs', statusFilter, searchTerm],
    queryFn: () => commercialService.getTariffs({
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: searchTerm || undefined,
      per_page: 50,
    }),
  });

  const createMutation = useMutation({
    mutationFn: commercialService.createTariff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
      setDialogOpen(false);
      setEditingTariff(null);
      toast.success('Tariff created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create tariff');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Tariff> }) =>
      commercialService.updateTariff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
      setDialogOpen(false);
      setEditingTariff(null);
      toast.success('Tariff updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update tariff');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: commercialService.deleteTariff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
      toast.success('Tariff deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete tariff');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const blocks: TariffBlock[] = [];
    let blockIndex = 0;
    while (formData.has(`block_${blockIndex}_min`)) {
      blocks.push({
        min: parseFloat(formData.get(`block_${blockIndex}_min`) as string),
        max: formData.get(`block_${blockIndex}_max`) ? parseFloat(formData.get(`block_${blockIndex}_max`) as string) : null,
        rate: parseFloat(formData.get(`block_${blockIndex}_rate`) as string),
        lifeline: formData.get(`block_${blockIndex}_lifeline`) === 'on',
      });
      blockIndex++;
    }

    const data: Partial<Tariff> = {
      name: formData.get('name') as string,
      valid_from: formData.get('valid_from') as string,
      valid_to: formData.get('valid_to') as string || null,
      blocks,
      fixed_charge: parseFloat(formData.get('fixed_charge') as string) || 0,
      currency: formData.get('currency') as string || 'KES',
    };

    if (editingTariff) {
      updateMutation.mutate({ id: editingTariff.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (tariff: Tariff) => {
    setEditingTariff(tariff);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this tariff?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (tariff: Tariff) => {
    const now = new Date();
    const validFrom = new Date(tariff.valid_from);
    const validTo = tariff.valid_to ? new Date(tariff.valid_to) : null;

    if (validFrom > now) {
      return <Badge variant="secondary">Future</Badge>;
    } else if (validTo && validTo < now) {
      return <Badge variant="destructive">Expired</Badge>;
    } else {
      return <Badge className="bg-green-600">Active</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Customer Tariffs</h1>
          <p className="text-muted-foreground mt-1">Water pricing structures by customer category</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTariff(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tariff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTariff ? 'Edit Tariff' : 'Create New Tariff'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tariff Name</Label>
                  <Input id="name" name="name" defaultValue={editingTariff?.name} required />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" name="currency" defaultValue={editingTariff?.currency || 'KES'} maxLength={3} />
                </div>
                <div>
                  <Label htmlFor="valid_from">Valid From</Label>
                  <Input id="valid_from" name="valid_from" type="date" defaultValue={editingTariff?.valid_from} required />
                </div>
                <div>
                  <Label htmlFor="valid_to">Valid To (Optional)</Label>
                  <Input id="valid_to" name="valid_to" type="date" defaultValue={editingTariff?.valid_to || ''} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="fixed_charge">Fixed Charge</Label>
                  <Input id="fixed_charge" name="fixed_charge" type="number" step="0.01" defaultValue={editingTariff?.fixed_charge || 0} />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Rate Blocks</h3>
                {(editingTariff?.blocks || [{ min: 0, max: 10, rate: 50, lifeline: true }]).map((block, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 mb-2">
                    <div>
                      <Label htmlFor={`block_${index}_min`}>Min (m³)</Label>
                      <Input id={`block_${index}_min`} name={`block_${index}_min`} type="number" step="0.01" defaultValue={block.min} required />
                    </div>
                    <div>
                      <Label htmlFor={`block_${index}_max`}>Max (m³)</Label>
                      <Input id={`block_${index}_max`} name={`block_${index}_max`} type="number" step="0.01" defaultValue={block.max || ''} placeholder="∞" />
                    </div>
                    <div>
                      <Label htmlFor={`block_${index}_rate`}>Rate</Label>
                      <Input id={`block_${index}_rate`} name={`block_${index}_rate`} type="number" step="0.01" defaultValue={block.rate} required />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name={`block_${index}_lifeline`} defaultChecked={block.lifeline} />
                        <span className="text-sm">Lifeline</span>
                      </label>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">Add more blocks by manually editing after creation</p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingTariff ? 'Update' : 'Create'} Tariff
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tariff Management
            </CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search tariffs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="future">Future</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tariffs...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tariff Name</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Blocks</TableHead>
                  <TableHead>Fixed Charge</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tariffsData?.data?.map((tariff: Tariff) => (
                  <TableRow key={tariff.id}>
                    <TableCell className="font-medium">{tariff.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>From: {new Date(tariff.valid_from).toLocaleDateString()}</div>
                        {tariff.valid_to && <div>To: {new Date(tariff.valid_to).toLocaleDateString()}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(tariff)}</TableCell>
                    <TableCell>{tariff.blocks.length} blocks</TableCell>
                    <TableCell>{tariff.currency} {tariff.fixed_charge.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(tariff)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(tariff.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {tariffsData?.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No tariffs found. Create your first tariff to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
