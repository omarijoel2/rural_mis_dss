import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { storesService } from '../../services/cmms.service';
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
import { Package, ArrowDownCircle, ArrowUpCircle, AlertTriangle, TrendingDown } from 'lucide-react';
import { FormInput } from '../../components/forms/FormInput';
import { FormTextarea } from '../../components/forms/FormTextarea';
import { toast } from 'sonner';

const receiptSchema = z.object({
  part_id: z.number().int().positive('Part ID is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit_cost: z.number().positive('Unit cost must be positive'),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

const issueSchema = z.object({
  part_id: z.number().int().positive('Part ID is required'),
  quantity: z.number().positive('Quantity must be positive'),
  work_order_id: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

type ReceiptFormData = z.infer<typeof receiptSchema>;
type IssueFormData = z.infer<typeof issueSchema>;

export function StoresPage() {
  const [filters, setFilters] = useState({ page: 1, per_page: 15 });
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const receiptForm = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      part_id: 0,
      quantity: 0,
      unit_cost: 0,
      supplier: '',
      notes: '',
    },
  });

  const issueForm = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      part_id: 0,
      quantity: 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (!receiptDialogOpen) {
      receiptForm.reset();
    }
  }, [receiptDialogOpen, receiptForm]);

  useEffect(() => {
    if (!issueDialogOpen) {
      issueForm.reset();
    }
  }, [issueDialogOpen, issueForm]);

  const { data: inventory, isLoading, error } = useQuery({
    queryKey: ['inventory', filters],
    queryFn: () => storesService.getInventory(filters),
  });

  const { data: transactions } = useQuery({
    queryKey: ['inventory-transactions', { page: 1, per_page: 10 }],
    queryFn: () => storesService.getTransactions({ page: 1, per_page: 10 }),
  });

  const receiptMutation = useMutation({
    mutationFn: storesService.receiveStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      setReceiptDialogOpen(false);
      toast.success('Stock received successfully');
    },
    onError: () => toast.error('Failed to receive stock'),
  });

  const issueMutation = useMutation({
    mutationFn: storesService.issueStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      setIssueDialogOpen(false);
      toast.success('Stock issued successfully');
    },
    onError: () => toast.error('Failed to issue stock'),
  });

  const handleReceiveStock = (data: ReceiptFormData) => {
    receiptMutation.mutate({
      part_id: data.part_id,
      quantity: data.quantity,
      unit_cost: data.unit_cost,
      supplier: data.supplier || '',
      received_at: new Date().toISOString(),
      notes: data.notes || '',
    });
  };

  const handleIssueStock = (data: IssueFormData) => {
    const payload: any = {
      part_id: data.part_id,
      quantity: data.quantity,
      issued_at: new Date().toISOString(),
      notes: data.notes || '',
    };
    
    if (data.work_order_id) {
      payload.work_order_id = data.work_order_id;
    }

    issueMutation.mutate(payload);
  };

  const totalValue = inventory?.data?.reduce((sum, item) => sum + (item.quantity || 0) * (item.avg_cost || 0), 0) || 0;
  const lowStockCount = inventory?.data?.filter(item => item.quantity && item.quantity < 10).length || 0;

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Failed to load inventory data</h3>
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
          <p className="text-muted-foreground">Spare parts, tools, and consumables</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setReceiptDialogOpen(true)}>
            <ArrowDownCircle className="h-4 w-4 mr-2" />
            Receive Stock
          </Button>
          <Button variant="outline" onClick={() => setIssueDialogOpen(true)}>
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            Issue Stock
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory?.total || 0}</div>
            <p className="text-xs text-muted-foreground">SKUs in stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total cost</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-yellow-600" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Items &lt; 10 units</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions?.total || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : !inventory?.data || inventory.data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No inventory items. Receive stock to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Avg Cost</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.data.map((item) => (
                  <TableRow key={item.part_id}>
                    <TableCell className="font-mono font-medium">{item.part_id}</TableCell>
                    <TableCell>{item.description || '—'}</TableCell>
                    <TableCell>
                      <span className={item.quantity && item.quantity < 10 ? 'text-yellow-600 font-medium' : ''}>
                        {item.quantity || 0}
                      </span>
                    </TableCell>
                    <TableCell>${item.avg_cost?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell className="font-medium">
                      ${((item.quantity || 0) * (item.avg_cost || 0)).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {item.quantity && item.quantity < 10 ? (
                        <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive Stock</DialogTitle>
          </DialogHeader>
          <form onSubmit={receiptForm.handleSubmit(handleReceiveStock)} className="space-y-4">
            <FormInput
              control={receiptForm.control}
              name="part_id"
              label="Part ID"
              type="number"
              required
              error={receiptForm.formState.errors.part_id?.message}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={receiptForm.control}
                name="quantity"
                label="Quantity"
                type="number"
                step="0.01"
                required
                error={receiptForm.formState.errors.quantity?.message}
              />
              <FormInput
                control={receiptForm.control}
                name="unit_cost"
                label="Unit Cost"
                type="number"
                step="0.01"
                required
                error={receiptForm.formState.errors.unit_cost?.message}
              />
            </div>
            <FormInput
              control={receiptForm.control}
              name="supplier"
              label="Supplier"
              error={receiptForm.formState.errors.supplier?.message}
            />
            <FormTextarea
              control={receiptForm.control}
              name="notes"
              label="Notes"
              rows={3}
              error={receiptForm.formState.errors.notes?.message}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReceiptDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={receiptMutation.isPending || !receiptForm.formState.isValid}
              >
                Receive Stock
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Stock</DialogTitle>
          </DialogHeader>
          <form onSubmit={issueForm.handleSubmit(handleIssueStock)} className="space-y-4">
            <FormInput
              control={issueForm.control}
              name="part_id"
              label="Part ID"
              type="number"
              required
              error={issueForm.formState.errors.part_id?.message}
            />
            <FormInput
              control={issueForm.control}
              name="quantity"
              label="Quantity"
              type="number"
              step="0.01"
              required
              error={issueForm.formState.errors.quantity?.message}
            />
            <FormInput
              control={issueForm.control}
              name="work_order_id"
              label="Work Order ID (optional)"
              type="number"
              error={issueForm.formState.errors.work_order_id?.message}
            />
            <FormTextarea
              control={issueForm.control}
              name="notes"
              label="Notes"
              rows={3}
              error={issueForm.formState.errors.notes?.message}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIssueDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={issueMutation.isPending || !issueForm.formState.isValid}
              >
                Issue Stock
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
