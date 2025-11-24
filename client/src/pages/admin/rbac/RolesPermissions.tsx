import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Shield, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function RolesPermissions() {
  const roles = [
    { id: 'admin', name: 'Administrator', description: 'Full system access and configuration', permissions: 'All', color: 'bg-red-500' },
    { id: 'manager', name: 'Manager', description: 'Operational management and oversight', permissions: 'Core Registry, Core Ops, CRM, Projects', color: 'bg-blue-500' },
    { id: 'operator', name: 'Operator', description: 'Day-to-day operational tasks', permissions: 'Core Ops, CMMS, Water Quality', color: 'bg-green-500' },
    { id: 'analyst', name: 'Analyst', description: 'Data analysis and reporting', permissions: 'DSA, M&E, Costing, Analytics', color: 'bg-purple-500' },
    { id: 'viewer', name: 'Viewer', description: 'Read-only access to dashboards', permissions: 'Core Registry, M&E, DSA', color: 'bg-gray-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions Management</h1>
          <p className="text-muted-foreground">
            Manage system roles, permissions, and menu access control
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${role.color} text-white p-3 rounded-lg`}>
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">ACCESSIBLE MODULES:</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.split(', ').map((perm) => (
                    <Badge key={perm} variant="secondary" className="text-xs">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Permissions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Roles Overview
          </CardTitle>
          <CardDescription>
            Each role has specific module access and granular permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                <p className="text-3xl font-bold mt-2">5</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Users Assigned</p>
                <p className="text-3xl font-bold mt-2">24</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Permissions Configured</p>
                <p className="text-3xl font-bold mt-2">142</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              For detailed permission management and role hierarchy, see Roles & Permissions in the Admin menu.
              Use the "Role & Menu Access" option to control which modules each role can access.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
