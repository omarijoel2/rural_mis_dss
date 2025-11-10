import { useState } from 'react';
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
import { Plus, Search, ChevronRight } from 'lucide-react';

export function GlAccountsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set(['4']));

  const accounts = [
    { id: '1', code: '1000', name: 'Assets', type: 'asset', level: 0, parent_id: null, active: true, has_children: true },
    { id: '2', code: '2000', name: 'Liabilities', type: 'liability', level: 0, parent_id: null, active: true, has_children: false },
    { id: '3', code: '3000', name: 'Equity', type: 'equity', level: 0, parent_id: null, active: true, has_children: false },
    { id: '4', code: '4000', name: 'Revenue', type: 'revenue', level: 0, parent_id: null, active: true, has_children: true },
    { id: '5', code: '4100', name: 'Water Sales', type: 'revenue', level: 1, parent_id: '4', active: true, has_children: true },
    { id: '6', code: '4110', name: 'Residential Water Sales', type: 'revenue', level: 2, parent_id: '5', active: true, has_children: false },
    { id: '7', code: '4120', name: 'Commercial Water Sales', type: 'revenue', level: 2, parent_id: '5', active: true, has_children: false },
    { id: '8', code: '4200', name: 'Connection Fees', type: 'revenue', level: 1, parent_id: '4', active: true, has_children: false },
    { id: '9', code: '5000', name: 'Expenses', type: 'expense', level: 0, parent_id: null, active: true, has_children: true },
    { id: '10', code: '5100', name: 'Operations', type: 'expense', level: 1, parent_id: '9', active: true, has_children: true },
    { id: '11', code: '5110', name: 'Electricity', type: 'expense', level: 2, parent_id: '10', active: true, has_children: false },
    { id: '12', code: '5120', name: 'Chemicals', type: 'expense', level: 2, parent_id: '10', active: true, has_children: false },
  ];

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      asset: 'bg-blue-100 text-blue-700',
      liability: 'bg-red-100 text-red-700',
      equity: 'bg-purple-100 text-purple-700',
      revenue: 'bg-green-100 text-green-700',
      expense: 'bg-orange-100 text-orange-700',
    };
    return (
      <Badge className={colors[type] || ''}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const toggleExpand = (accountId: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  const shouldShowAccount = (account: typeof accounts[0]): boolean => {
    if (!account.parent_id) return true;
    const parent = accounts.find(a => a.id === account.parent_id);
    if (!parent) return true;
    if (!expandedAccounts.has(account.parent_id)) return false;
    return shouldShowAccount(parent);
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = searchTerm === '' || 
      account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && shouldShowAccount(account);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">GL Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Chart of accounts with hierarchical structure
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Account
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.map((account) => (
              <TableRow key={account.id} className={account.level > 0 ? 'bg-muted/30' : ''}>
                <TableCell className="font-mono font-medium">
                  <div className="flex items-center gap-2">
                    {account.level > 0 && (
                      <span className="text-muted-foreground" style={{ marginLeft: `${account.level * 20}px` }}>
                        └─
                      </span>
                    )}
                    {account.has_children && (
                      <button onClick={() => toggleExpand(account.id)} className="hover:bg-muted rounded p-1">
                        <ChevronRight className={`h-4 w-4 transition-transform ${expandedAccounts.has(account.id) ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                    {account.code}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell>{getTypeBadge(account.type)}</TableCell>
                <TableCell>
                  <Badge variant={account.active ? 'default' : 'secondary'}>
                    {account.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Assets</div>
          <div className="text-2xl font-bold mt-1">1</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Liabilities</div>
          <div className="text-2xl font-bold mt-1">1</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Equity</div>
          <div className="text-2xl font-bold mt-1">1</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Revenue</div>
          <div className="text-2xl font-bold mt-1">4</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Expenses</div>
          <div className="text-2xl font-bold mt-1">5</div>
        </Card>
      </div>
    </div>
  );
}
