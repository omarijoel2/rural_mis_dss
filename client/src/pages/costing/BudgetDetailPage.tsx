import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { ArrowLeft, Check, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { Textarea } from '../../components/ui/textarea';

export function BudgetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');

  const budget = {
    id: 1,
    name: 'FY 2025 Operating Budget',
    fiscal_year: 2025,
    status: 'submitted',
    total_amount: 2500000,
    created_at: '2024-09-15',
    created_by: { name: 'John Smith' },
  };

  const monthlyBreakdown = [
    { month: '2025-01', amount: 208333, actuals: 195000, variance: -13333, variance_pct: -6.4 },
    { month: '2025-02', amount: 208333, actuals: 210000, variance: 1667, variance_pct: 0.8 },
    { month: '2025-03', amount: 208333, actuals: 198000, variance: -10333, variance_pct: -5.0 },
    { month: '2025-04', amount: 208333, actuals: 0, variance: 0, variance_pct: 0 },
    { month: '2025-05', amount: 208333, actuals: 0, variance: 0, variance_pct: 0 },
    { month: '2025-06', amount: 208333, actuals: 0, variance: 0, variance_pct: 0 },
    { month: '2025-07', amount: 208333, actuals: 0, variance: 0, variance_pct: 0 },
    { month: '2025-08', amount: 208333, actuals: 0, variance: 0, variance_pct: 0 },
    { month: '2025-09', amount: 208333, actuals: 0, variance: 0, variance_pct: 0 },
    { month: '2025-10', amount: 208333, actuals: 0, variance: 0, variance_pct: 0 },
    { month: '2025-11', amount: 208333, actuals: 0, variance: 0, variance_pct: 0 },
    { month: '2025-12', amount: 208333, actuals: 0, variance: 0, variance_pct: 0 },
  ];

  const lines = [
    { id: 1, cost_center: 'Operations', gl_account: '5110 - Electricity', amount: 120000, ytd_actual: 35000 },
    { id: 2, cost_center: 'Operations', gl_account: '5120 - Chemicals', amount: 85000, ytd_actual: 22000 },
    { id: 3, cost_center: 'Engineering', gl_account: '5200 - Salaries', amount: 480000, ytd_actual: 140000 },
    { id: 4, cost_center: 'Finance', gl_account: '5300 - Admin', amount: 180000, ytd_actual: 48000 },
  ];

  const handleApprove = () => {
    console.log('Approving budget with notes:', approvalNotes);
    setApprovalDialogOpen(false);
    navigate('/costing/budgets');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline'; icon: any }> = {
      draft: { variant: 'secondary', icon: FileText },
      submitted: { variant: 'outline', icon: FileText },
      approved: { variant: 'default', icon: Check },
    };
    const config = variants[status] || variants.draft;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/costing/budgets')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Budgets
        </Button>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{budget.name}</h1>
          <p className="text-muted-foreground mt-1">
            Created by {budget.created_by.name} on {new Date(budget.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(budget.status)}
          {budget.status === 'submitted' && (
            <Button onClick={() => setApprovalDialogOpen(true)} className="gap-2">
              <Check className="h-4 w-4" />
              Approve Budget
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Total Budget</div>
          <div className="text-3xl font-bold mt-2">${(budget.total_amount / 1000).toFixed(0)}K</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">YTD Actuals</div>
          <div className="text-3xl font-bold mt-2">$603K</div>
          <p className="text-xs text-muted-foreground mt-1">24% of budget</p>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">YTD Variance</div>
          <div className="text-3xl font-bold mt-2 text-red-600">-$22K</div>
          <p className="text-xs text-red-600 mt-1">-3.5% unfavorable</p>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Fiscal Year</div>
          <div className="text-3xl font-bold mt-2">{budget.fiscal_year}</div>
        </Card>
      </div>

      <Tabs defaultValue="breakdown">
        <TabsList>
          <TabsTrigger value="breakdown">Monthly Breakdown</TabsTrigger>
          <TabsTrigger value="lines">Budget Lines</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Monthly Budget vs Actuals</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Actuals</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">Variance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyBreakdown.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell className="text-right font-mono">
                      ${row.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {row.actuals > 0 ? `$${row.actuals.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className={`text-right font-mono ${row.variance < 0 ? 'text-red-600' : row.variance > 0 ? 'text-green-600' : ''}`}>
                      {row.variance !== 0 ? `$${row.variance.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.variance_pct !== 0 ? (
                        <Badge variant={row.variance_pct < 0 ? 'destructive' : 'default'} className="gap-1">
                          {row.variance_pct < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                          {Math.abs(row.variance_pct).toFixed(1)}%
                        </Badge>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="lines" className="mt-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Budget Line Items</h3>
              <Button size="sm">Add Line</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cost Center</TableHead>
                  <TableHead>GL Account</TableHead>
                  <TableHead className="text-right">Annual Budget</TableHead>
                  <TableHead className="text-right">YTD Actual</TableHead>
                  <TableHead className="text-right">% Utilized</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => {
                  const utilization = (line.ytd_actual / line.amount) * 100;
                  return (
                    <TableRow key={line.id}>
                      <TableCell className="font-medium">{line.cost_center}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{line.gl_account}</TableCell>
                      <TableCell className="text-right font-mono">${line.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">${line.ytd_actual.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={utilization > 100 ? 'destructive' : utilization > 75 ? 'outline' : 'secondary'}>
                          {utilization.toFixed(0)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Budget</DialogTitle>
            <DialogDescription>
              You are about to approve "{budget.name}". This action will lock the budget for the fiscal year.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Approval Notes (optional)</label>
              <Textarea
                placeholder="Add any comments or conditions..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>
              Approve Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
