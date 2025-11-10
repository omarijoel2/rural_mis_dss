import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
import { Plus, Search, FileText, Check, Clock, Archive } from 'lucide-react';

export function BudgetListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const budgets = [
    { id: 1, name: 'FY 2025 Operating Budget', fiscal_year: 2025, status: 'approved', total_amount: 2500000, created_at: '2024-09-15' },
    { id: 2, name: 'FY 2025 Capital Budget', fiscal_year: 2025, status: 'approved', total_amount: 5000000, created_at: '2024-09-20' },
    { id: 3, name: 'FY 2026 Draft Budget', fiscal_year: 2026, status: 'draft', total_amount: 2750000, created_at: '2024-11-01' },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline'; icon: any }> = {
      draft: { variant: 'secondary', icon: FileText },
      submitted: { variant: 'outline', icon: Clock },
      approved: { variant: 'default', icon: Check },
      archived: { variant: 'outline', icon: Archive },
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

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'all' || budget.fiscal_year.toString() === selectedYear;
    return matchesSearch && matchesYear;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Budget Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage annual budgets with approval workflows
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Budget
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search budgets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Years</option>
            <option value="2026">FY 2026</option>
            <option value="2025">FY 2025</option>
            <option value="2024">FY 2024</option>
          </select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Budget Name</TableHead>
              <TableHead>Fiscal Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead>Created</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBudgets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No budgets found
                </TableCell>
              </TableRow>
            ) : (
              filteredBudgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell className="font-medium">{budget.name}</TableCell>
                  <TableCell>{budget.fiscal_year}</TableCell>
                  <TableCell>{getStatusBadge(budget.status)}</TableCell>
                  <TableCell className="text-right font-mono">
                    ${budget.total_amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{new Date(budget.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/costing/budgets/${budget.id}`)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Total Budgets</div>
          <div className="text-3xl font-bold mt-2">{budgets.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Approved Budget (FY 2025)</div>
          <div className="text-3xl font-bold mt-2">$7.5M</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Pending Approval</div>
          <div className="text-3xl font-bold mt-2">1</div>
        </Card>
      </div>
    </div>
  );
}
