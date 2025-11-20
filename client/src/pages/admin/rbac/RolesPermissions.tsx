import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Shield } from 'lucide-react';

export function RolesPermissions() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage roles and their associated permissions
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Roles</CardTitle>
          <CardDescription>Admin, Manager, Operator, Analyst, Viewer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Run RBAC seeder to create roles and permissions.</p>
            <code className="text-xs mt-2 block">php artisan db:seed --class=RBACPermissionSeeder</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
