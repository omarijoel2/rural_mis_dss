import { useState, useMemo } from 'react';
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
import { Plus, Search, FileText, Check, Clock, Archive, Loader2 } from 'lucide-react';
import { useBudgetVersions } from '../../hooks/useCosting';

export function BudgetListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const filters = useMemo(() => {
    return selectedYear === 'all' ? {} : { fiscal_year: parseInt(selectedYear) };
  }, [selectedYear]);

  const { data: budgetsData, isLoading, error } = useBudgetVersions(filters);

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

  const budgets = budgetsData?.data || [];

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = useMemo(() => {
    const total = budgets.length;
    const approved = budgets.filter(b => b.status === 'approved').length;
    const pending = budgets.filter(b => b.status === 'submitted').length;
    const draft = budgets.filter(b => b.status === 'draft').length;
    return { total, approved, pending, draft };
  }, [budgets]);

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

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4">
            Error loading budgets: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Budget Name</TableHead>
                <TableHead>Fiscal Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBudgets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No budgets found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBudgets.map((budget) => (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">{budget.name}</TableCell>
                    <TableCell>{budget.fiscal_year}</TableCell>
                    <TableCell>{getStatusBadge(budget.status)}</TableCell>
                    <TableCell>{new Date(budget.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/costing/budgets/${budget.id}`)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Total Budgets</div>
          <div className="text-3xl font-bold mt-2">{stats.total}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Approved</div>
          <div className="text-3xl font-bold mt-2">{stats.approved}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Pending Approval</div>
          <div className="text-3xl font-bold mt-2">{stats.pending}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Draft</div>
          <div className="text-3xl font-bold mt-2">{stats.draft}</div>
        </Card>
      </div>
    </div>
  );
}
