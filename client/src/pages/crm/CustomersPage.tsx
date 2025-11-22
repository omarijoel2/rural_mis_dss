import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { crmService, type Customer } from '../../services/crm.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Search, UserPlus, Eye } from 'lucide-react';

const CUSTOMER_TYPE_COLORS = {
  residential: 'bg-blue-100 text-blue-800',
  commercial: 'bg-purple-100 text-purple-800',
  industrial: 'bg-orange-100 text-orange-800',
  public: 'bg-green-100 text-green-800',
};

export function CustomersPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => crmService.getCustomers({ search, per_page: 50 }),
  });

  const customers = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage customer accounts and information</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {isLoading && !data ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Loading customers...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-lg text-destructive">Error loading customers: {(error as Error).message}</p>
        </div>
      ) : (
        <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, phone, or email..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID Number</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer: Customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.first_name} {customer.last_name}
                    </TableCell>
                    <TableCell>{customer.id_number}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell>
                      <Badge className={CUSTOMER_TYPE_COLORS[customer.customer_type]}>
                        {customer.customer_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {customer.service_connections && customer.service_connections.length > 0 ? (
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/crm/accounts/${customer.service_connections[0].account_no}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" disabled>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {customers.length} customer(s)
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}
