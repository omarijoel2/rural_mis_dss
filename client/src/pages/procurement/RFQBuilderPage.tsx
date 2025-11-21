import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Plus, FileText, Users, Award, Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function RFQBuilderPage() {
  const [open, setOpen] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issue_date: '',
    submission_deadline: '',
    items: [{ description: '', quantity: '', unit: '', specifications: '' }],
    vendor_ids: [] as string[],
  });

  const queryClient = useQueryClient();

  const { data: rfqs } = useQuery({
    queryKey: ['rfqs'],
    queryFn: async () => {
      const res = await fetch('/api/v1/procurement/rfqs');
      return res.json();
    },
  });

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await fetch('/api/v1/procurement/vendors?status=active');
      return res.json();
    },
  });

  const { data: selectedRfqData } = useQuery({
    queryKey: ['rfq', selectedRfq],
    queryFn: async () => {
      const res = await fetch(`/api/v1/procurement/rfqs/${selectedRfq}`);
      return res.json();
    },
    enabled: !!selectedRfq,
  });

  const { data: evaluationMatrix } = useQuery({
    queryKey: ['rfq-evaluation', selectedRfq],
    queryFn: async () => {
      const res = await fetch(`/api/v1/procurement/rfqs/${selectedRfq}/evaluation-matrix`);
      return res.json();
    },
    enabled: !!selectedRfq && selectedRfqData?.data?.status === 'evaluating',
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/v1/procurement/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create RFQ');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      setOpen(false);
    },
  });

  const issueMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/procurement/rfqs/${id}/issue`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to issue RFQ');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      issued: 'bg-blue-100 text-blue-700',
      evaluating: 'bg-orange-100 text-orange-700',
      awarded: 'bg-green-100 text-green-700',
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">RFQ Management</h1>
          <p className="text-muted-foreground mt-1">
            Create RFQs, invite vendors, and evaluate bids
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New RFQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Request for Quotation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">RFQ Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Supply of Water Treatment Chemicals"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="issue_date">Issue Date *</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deadline">Submission Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.submission_deadline}
                    onChange={(e) => setFormData({ ...formData, submission_deadline: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Invite Vendors</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto border rounded p-2">
                  {vendors?.data?.map((vendor: any) => (
                    <label key={vendor.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.vendor_ids.includes(vendor.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, vendor_ids: [...formData.vendor_ids, vendor.id] });
                          } else {
                            setFormData({ ...formData, vendor_ids: formData.vendor_ids.filter(id => id !== vendor.id) });
                          }
                        }}
                      />
                      {vendor.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create RFQ'}
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
            RFQ List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RFQ No</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Invitations</TableHead>
                <TableHead>Bids</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfqs?.data && rfqs.data.length > 0 ? (
                rfqs.data.map((rfq: any) => (
                  <TableRow key={rfq.id} className="cursor-pointer" onClick={() => setSelectedRfq(rfq.id)}>
                    <TableCell className="font-mono">{rfq.rfq_no}</TableCell>
                    <TableCell className="font-medium">{rfq.title}</TableCell>
                    <TableCell>{new Date(rfq.issue_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(rfq.submission_deadline).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rfq.invitations_count || 0} vendors</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{rfq.bids_count || 0} bids</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(rfq.status)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {rfq.status === 'draft' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => issueMutation.mutate(rfq.id)}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Issue
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No RFQs yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedRfqData?.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              RFQ Details: {selectedRfqData.data.rfq_no}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="bids">Bids ({selectedRfqData.data.bids?.length || 0})</TabsTrigger>
                {selectedRfqData.data.status === 'evaluating' && (
                  <TabsTrigger value="evaluation">Evaluation Matrix</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{selectedRfqData.data.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedRfqData.data.status)}
                  </div>
                </div>
                {selectedRfqData.data.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p>{selectedRfqData.data.description}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bids">
                {selectedRfqData.data.bids && selectedRfqData.data.bids.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Bid Amount</TableHead>
                        <TableHead>Delivery Days</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRfqData.data.bids.map((bid: any) => (
                        <TableRow key={bid.id}>
                          <TableCell>{bid.vendor?.name}</TableCell>
                          <TableCell>KES {parseFloat(bid.total_bid_amount).toLocaleString()}</TableCell>
                          <TableCell>{bid.delivery_days} days</TableCell>
                          <TableCell>{new Date(bid.submitted_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No bids submitted yet</p>
                )}
              </TabsContent>

              {selectedRfqData.data.status === 'evaluating' && (
                <TabsContent value="evaluation">
                  {evaluationMatrix?.data && evaluationMatrix.data.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Bid Amount</TableHead>
                          <TableHead>Weighted Score</TableHead>
                          <TableHead>Delivery</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {evaluationMatrix.data.map((row: any) => (
                          <TableRow key={row.vendor_id}>
                            <TableCell>
                              <Badge className={row.rank === 1 ? 'bg-green-100 text-green-700' : ''}>
                                #{row.rank}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{row.vendor_name}</TableCell>
                            <TableCell>KES {parseFloat(row.bid_amount).toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="font-bold text-blue-600">{row.weighted_total}/100</div>
                            </TableCell>
                            <TableCell>{row.delivery_days} days</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No evaluations yet</p>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
