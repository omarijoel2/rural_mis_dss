import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { FileText, CheckCircle, Send, Download } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function LPOManagementPage() {
  const [generateFromRfqOpen, setGenerateFromRfqOpen] = useState(false);
  const [selectedRfqId, setSelectedRfqId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [termsConditions, setTermsConditions] = useState('Standard payment terms: Net 30 days');

  const queryClient = useQueryClient();

  const { data: lpos } = useQuery({
    queryKey: ['lpos'],
    queryFn: async () => {
      const res = await fetch('/api/v1/procurement/lpos');
      return res.json();
    },
  });

  const { data: awardedRfqs } = useQuery({
    queryKey: ['awarded-rfqs'],
    queryFn: async () => {
      const res = await fetch('/api/v1/procurement/rfqs?status=awarded');
      return res.json();
    },
  });

  const generateFromRfqMutation = useMutation({
    mutationFn: async (data: { rfq_id: string; delivery_date: string; terms_conditions: string }) => {
      const res = await fetch('/api/v1/procurement/lpos/generate-from-rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to generate LPO');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lpos'] });
      queryClient.invalidateQueries({ queryKey: ['awarded-rfqs'] });
      setGenerateFromRfqOpen(false);
      setSelectedRfqId('');
      setDeliveryDate('');
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/procurement/lpos/${id}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to approve');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lpos'] });
    },
  });

  const issueMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/procurement/lpos/${id}/issue`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to issue');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lpos'] });
    },
  });

  const handleGenerateFromRfq = (e: React.FormEvent) => {
    e.preventDefault();
    generateFromRfqMutation.mutate({
      rfq_id: selectedRfqId,
      delivery_date: deliveryDate,
      terms_conditions: termsConditions,
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      approved: 'bg-blue-100 text-blue-700',
      issued: 'bg-green-100 text-green-700',
      delivered: 'bg-purple-100 text-purple-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Local Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage LPOs from awarded RFQs
          </p>
        </div>
        <Dialog open={generateFromRfqOpen} onOpenChange={setGenerateFromRfqOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Generate from RFQ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate LPO from Awarded RFQ</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleGenerateFromRfq} className="space-y-4">
              <div>
                <Label htmlFor="rfq">Select Awarded RFQ *</Label>
                <select
                  id="rfq"
                  className="w-full border rounded-md p-2"
                  value={selectedRfqId}
                  onChange={(e) => setSelectedRfqId(e.target.value)}
                  required
                >
                  <option value="">-- Select RFQ --</option>
                  {awardedRfqs?.data?.map((rfq: any) => (
                    <option key={rfq.id} value={rfq.id}>
                      {rfq.rfq_no} - {rfq.title} (Vendor: {rfq.awarded_vendor?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="delivery_date">Expected Delivery Date *</Label>
                <Input
                  id="delivery_date"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={termsConditions}
                  onChange={(e) => setTermsConditions(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setGenerateFromRfqOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={generateFromRfqMutation.isPending}>
                  {generateFromRfqMutation.isPending ? 'Generating...' : 'Generate LPO'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            LPO List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LPO No</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>RFQ Reference</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lpos?.data && lpos.data.length > 0 ? (
                lpos.data.map((lpo: any) => (
                  <TableRow key={lpo.id}>
                    <TableCell className="font-mono font-medium">{lpo.lpo_no}</TableCell>
                    <TableCell>{lpo.vendor?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {lpo.rfq ? (
                        <span className="text-sm text-muted-foreground">{lpo.rfq.rfq_no}</span>
                      ) : (
                        'Direct'
                      )}
                    </TableCell>
                    <TableCell>{new Date(lpo.order_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {lpo.delivery_date ? new Date(lpo.delivery_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">
                      KES {parseFloat(lpo.total_amount).toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(lpo.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {lpo.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveMutation.mutate(lpo.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                        )}
                        {lpo.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => issueMutation.mutate(lpo.id)}
                            disabled={issueMutation.isPending}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Issue
                          </Button>
                        )}
                        {lpo.status === 'issued' && (
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No LPOs yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-medium text-blue-900 mb-2">LPO Workflow</h3>
          <div className="flex items-center gap-4 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center font-bold">1</div>
              <span>Generate from RFQ</span>
            </div>
            <div className="text-blue-400">→</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center font-bold">2</div>
              <span>Approve</span>
            </div>
            <div className="text-blue-400">→</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center font-bold">3</div>
              <span>Issue to Vendor</span>
            </div>
            <div className="text-blue-400">→</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center font-bold">4</div>
              <span>Track Delivery</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
