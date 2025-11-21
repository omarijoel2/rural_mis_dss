import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Plus, ShoppingCart, X, Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface RequisitionItem {
  description: string;
  quantity: string;
  unit: string;
  unit_cost_estimate: string;
}

export function RequisitionsPage() {
  const [open, setOpen] = useState(false);
  const [justification, setJustification] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [items, setItems] = useState<RequisitionItem[]>([
    { description: '', quantity: '', unit: '', unit_cost_estimate: '' },
  ]);

  const queryClient = useQueryClient();

  const { data: requisitions } = useQuery({
    queryKey: ['requisitions'],
    queryFn: async () => {
      const res = await fetch('/api/v1/procurement/requisitions');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/v1/procurement/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create requisition');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      setOpen(false);
      resetForm();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/procurement/requisitions/${id}/submit`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to submit');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    },
  });

  const resetForm = () => {
    setJustification('');
    setRequiredDate('');
    setItems([{ description: '', quantity: '', unit: '', unit_cost_estimate: '' }]);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: '', unit: '', unit_cost_estimate: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof RequisitionItem, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(item => 
      item.description && item.quantity && item.unit && item.unit_cost_estimate
    );
    
    createMutation.mutate({
      justification,
      required_date: requiredDate || null,
      items: validItems,
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      submitted: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Purchase Requisitions</h1>
          <p className="text-muted-foreground mt-1">
            Request procurement of goods and services
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Requisition
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Purchase Requisition</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="justification">Justification / Purpose *</Label>
                <Textarea
                  id="justification"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explain why these items are needed..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="required_date">Required Date</Label>
                <Input
                  id="required_date"
                  type="date"
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Items *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto border rounded-lg p-3">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end p-2 bg-muted/30 rounded">
                      <div className="col-span-5">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          placeholder="0"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Unit</Label>
                        <Input
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          placeholder="pcs, kg, etc"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Unit Cost</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_cost_estimate}
                          onChange={(e) => updateItem(index, 'unit_cost_estimate', e.target.value)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="col-span-1 flex items-end">
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Requisition'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Requisition List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requisition No</TableHead>
                <TableHead>Requestor</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Estimate</TableHead>
                <TableHead>Required Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requisitions?.data && requisitions.data.length > 0 ? (
                requisitions.data.map((req: any) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono">{req.requisition_no}</TableCell>
                    <TableCell>{req.requestor?.name || 'N/A'}</TableCell>
                    <TableCell>{req.items?.length || 0} items</TableCell>
                    <TableCell>KES {parseFloat(req.total_estimate).toLocaleString()}</TableCell>
                    <TableCell>
                      {req.required_date ? new Date(req.required_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell>
                      {req.status === 'draft' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => submitMutation.mutate(req.id)}
                          disabled={submitMutation.isPending}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Submit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No requisitions yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
