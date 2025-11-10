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
import { Plus, Search, Building2 } from 'lucide-react';

export function CostCentersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const costCenters = [
    { id: 1, code: 'CC-100', name: 'Operations', owner: 'John Smith', active: true, parent: null },
    { id: 2, code: 'CC-101', name: 'Water Production', owner: 'Jane Doe', active: true, parent: 'Operations' },
    { id: 3, code: 'CC-102', name: 'Distribution', owner: 'Bob Johnson', active: true, parent: 'Operations' },
    { id: 4, code: 'CC-200', name: 'Engineering', owner: 'Alice Williams', active: true, parent: null },
    { id: 5, code: 'CC-201', name: 'Design & Planning', owner: 'Charlie Brown', active: true, parent: 'Engineering' },
    { id: 6, code: 'CC-300', name: 'Finance', owner: 'Diana Prince', active: true, parent: null },
    { id: 7, code: 'CC-400', name: 'Administration', owner: 'Eve Adams', active: true, parent: null },
    { id: 8, code: 'CC-500', name: 'Customer Service', owner: 'Frank Miller', active: true, parent: null },
  ];

  const filteredCostCenters = costCenters.filter(cc => {
    const matchesSearch = 
      cc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cc.owner && cc.owner.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cost Centers</h1>
          <p className="text-muted-foreground mt-1">
            Organizational units for cost tracking and allocation
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Cost Center
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cost centers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Cost Center Name</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCostCenters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No cost centers found
                </TableCell>
              </TableRow>
            ) : (
              filteredCostCenters.map((cc) => (
                <TableRow key={cc.id}>
                  <TableCell className="font-mono font-medium">{cc.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{cc.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {cc.parent || '-'}
                  </TableCell>
                  <TableCell className="text-sm">{cc.owner || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={cc.active ? 'default' : 'secondary'}>
                      {cc.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Total Cost Centers</div>
          <div className="text-3xl font-bold mt-2">{costCenters.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Active</div>
          <div className="text-3xl font-bold mt-2">
            {costCenters.filter(cc => cc.active).length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">With Owner</div>
          <div className="text-3xl font-bold mt-2">
            {costCenters.filter(cc => cc.owner).length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Parent Centers</div>
          <div className="text-3xl font-bold mt-2">
            {costCenters.filter(cc => !cc.parent).length}
          </div>
        </Card>
      </div>
    </div>
  );
}
