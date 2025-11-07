import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Users, Plus } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  guard_name: string;
  created_at: string;
  permissions?: Permission[];
}

interface Permission {
  id: string;
  name: string;
}

export function RolesPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['roles'],
    queryFn: () => apiClient.get<{ roles: Role[] }>('/rbac/roles'),
  });

  const roles = data?.roles || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Roles & Permissions
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage user roles and access permissions
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              Error loading roles: {error?.message || 'Unknown error'}
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No roles found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{role.guard_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {role.permissions?.slice(0, 3).map(perm => (
                          <Badge key={perm.id} variant="secondary" className="text-xs">
                            {perm.name}
                          </Badge>
                        ))}
                        {(role.permissions?.length || 0) > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(role.permissions?.length || 0) - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {new Date(role.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
