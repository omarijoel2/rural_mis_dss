import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export function PermissionMatrix() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permission Matrix</h1>
        <p className="text-muted-foreground">
          Grid view of roles × permissions with bulk operations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles × Permissions Matrix</CardTitle>
          <CardDescription>Check boxes to grant permissions to roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Matrix grid will display here once roles and permissions are seeded.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
