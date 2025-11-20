import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storesService } from '../../services/cmms.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
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
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Package, TrendingDown, DollarSign, Warehouse, Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function StoresPage() {
  const [filters, setFilters] = useState({ page: 1, per_page: 15 });
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: stores, isLoading, error } = useQuery({
    queryKey: ['stores', filters],
    queryFn: () => storesService.getStores(filters),
  });

  const { data: valuation } = useQuery({
    queryKey: ['stores-valuation'],
    queryFn: () => storesService.getValuation(),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => storesService.getLowStock(),
  });

  const receiptMutation = useMutation({
    mutationFn: storesService.receiveStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['stores-valuation'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });
      setReceiptDialogOpen(false);
      toast.success('Stock received successfully');
    },
    onError: () => toast.error('Failed to receive stock'),
  });

  const issueMutation = useMutation({
    mutationFn: storesService.issueStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['stores-valuation'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });
      setIssueDialogOpen(false);
      toast.success('Stock issued successfully');
    },
    onError: () => toast.error('Failed to issue stock'),
  });

  const handleReceiveStock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const partId = parseInt(formData.get('part_id') as string);
    const quantity = parseFloat(formData.get('quantity') as string);
    const unitCost = parseFloat(formData.get('unit_cost') as string);
    
    if (isNaN(partId) || isNaN(quantity) || isNaN(unitCost)) {
      toast.error('Please enter valid numeric values');
      e.currentTarget.reset();
      return;
    }
    
    const data = {
      part_id: partId,
      quantity,
      unit_cost: unitCost,
      po_num: formData.get('po_num') as string,
      notes: formData.get('notes') as string,
    };
    receiptMutation.mutate(data);
  };

  const handleIssueStock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const partId = parseInt(formData.get('part_id') as string);
    const quantity = parseFloat(formData.get('quantity') as string);
    const workOrderIdStr = formData.get('work_order_id') as string;
    
    if (isNaN(partId) || isNaN(quantity)) {
      toast.error('Please enter valid part ID and quantity');
      e.currentTarget.reset();
      return;
    }
    
    const data: any = {
      part_id: partId,
      quantity,
      notes: formData.get('notes') as string,
    };
    
    if (workOrderIdStr && workOrderIdStr.trim()) {
      const workOrderId = parseInt(workOrderIdStr);
      if (!isNaN(workOrderId)) {
        data.work_order_id = workOrderId;
      }
    }
    
    issueMutation.mutate(data);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Failed to load stores data</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stores & Inventory</h1>
          <p className="text-muted-foreground">Spare parts and consumables management</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Receive Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Receive Stock</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleReceiveStock} className="space-y-4">
                <div>
                  <Label htmlFor="part_id">Part ID</Label>
                  <Input id="part_id" name="part_id" type="number" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit_cost">Unit Cost</Label>
                    <Input
                      id="unit_cost"
                      name="unit_cost"
                      type="number"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="po_num">PO Number</Label>
                  <Input id="po_num" name="po_num" />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" rows={2} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReceiptDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={receiptMutation.isPending}>
                    Receive
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Issue Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Issue Stock</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleIssueStock} className="space-y-4">
                <div>
                  <Label htmlFor="part_id">Part ID</Label>
                  <Input id="part_id" name="part_id" type="number" required />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="work_order_id">Work Order ID</Label>
                  <Input id="work_order_id" name="work_order_id" type="number" />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" rows={2} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIssueDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={issueMutation.isPending}>
                    Issue
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              Stores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Active locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${valuation?.total_value?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total on hand</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {lowStock?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Items need reorder</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {valuation?.by_category?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Part categories</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stores" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock Alerts</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
        </TabsList>

        <TabsContent value="stores">
          <Card>
            <CardHeader>
              <CardTitle>Store Locations</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : !stores?.data || stores.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No stores configured
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Manager</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stores.data.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell className="font-medium">{store.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{store.type}</Badge>
                        </TableCell>
                        <TableCell>{store.location || '—'}</TableCell>
                        <TableCell>{store.manager?.name || 'Unassigned'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {lowStock && lowStock.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part</TableHead>
                      <TableHead>Current Qty</TableHead>
                      <TableHead>Reorder Point</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStock.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.part_name}</TableCell>
                        <TableCell className="text-orange-600 font-semibold">
                          {item.qty_on_hand}
                        </TableCell>
                        <TableCell>{item.reorder_point}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Create PO
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No low stock items
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="valuation">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Valuation by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {valuation?.by_category && valuation.by_category.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {valuation.by_category.map((cat: any) => (
                      <TableRow key={cat.category}>
                        <TableCell className="font-medium">{cat.category}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ${cat.total_value?.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No valuation data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
