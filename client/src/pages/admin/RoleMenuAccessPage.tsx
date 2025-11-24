import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Shield, Users } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface Module {
  key: string;
  name: string;
}

export function RoleMenuAccessPage() {
  const roles: Role[] = [
    { id: 'admin', name: 'Admin', description: 'Full system access', color: 'bg-red-500' },
    { id: 'manager', name: 'Manager', description: 'Operational management', color: 'bg-blue-500' },
    { id: 'operator', name: 'Operator', description: 'Day-to-day operations', color: 'bg-green-500' },
    { id: 'analyst', name: 'Analyst', description: 'Data analysis and reporting', color: 'bg-purple-500' },
    { id: 'viewer', name: 'Viewer', description: 'Read-only access', color: 'bg-gray-500' },
  ];

  const modules: Module[] = [
    { key: 'core-registry', name: 'Core Registry' },
    { key: 'core-ops', name: 'Core Operations' },
    { key: 'crm', name: 'CRM' },
    { key: 'cmms', name: 'CMMS' },
    { key: 'water-quality', name: 'Water Quality' },
    { key: 'hydromet', name: 'Hydromet' },
    { key: 'costing', name: 'Costing & Finance' },
    { key: 'procurement', name: 'Procurement' },
    { key: 'projects', name: 'Projects' },
    { key: 'community', name: 'Community & Stakeholder' },
    { key: 'risk-compliance', name: 'Risk, Compliance & Governance' },
    { key: 'dsa', name: 'Decision Support & Analytics' },
    { key: 'training', name: 'Training & Knowledge' },
    { key: 'me', name: 'M&E' },
  ];

  const [access, setAccess] = useState<Record<string, Set<string>>>({
    admin: new Set(modules.map(m => m.key)),
    manager: new Set(['core-registry', 'core-ops', 'crm', 'cmms', 'water-quality', 'projects', 'costing']),
    operator: new Set(['core-ops', 'cmms', 'water-quality']),
    analyst: new Set(['dsa', 'me', 'costing', 'core-registry']),
    viewer: new Set(['core-registry', 'me', 'dsa']),
  });

  const toggleAccess = (roleId: string, moduleKey: string) => {
    const newAccess = new Set(access[roleId]);
    if (newAccess.has(moduleKey)) {
      newAccess.delete(moduleKey);
    } else {
      newAccess.add(moduleKey);
    }
    setAccess({ ...access, [roleId]: newAccess });
  };

  const hasAccess = (roleId: string, moduleKey: string) => {
    return access[roleId]?.has(moduleKey) || false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Role & Menu Access Control</h1>
        <p className="text-muted-foreground">Define which modules each role can access</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Module Access by Role</CardTitle>
          <CardDescription>Check the boxes to grant module access to each role. Uncheck to restrict access.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Module</th>
                  {roles.map((role) => (
                    <th key={role.id} className="text-center py-3 px-2">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`${role.color} text-white px-2 py-1 rounded text-xs font-medium`}>
                          {role.name}
                        </div>
                        <span className="text-xs text-muted-foreground max-w-[80px]">{role.description}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map((module) => (
                  <tr key={module.key} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{module.name}</td>
                    {roles.map((role) => (
                      <td key={`${role.id}-${module.key}`} className="text-center py-3 px-2">
                        <Checkbox
                          checked={hasAccess(role.id, module.key)}
                          onCheckedChange={() => toggleAccess(role.id, module.key)}
                          aria-label={`Grant ${role.name} access to ${module.name}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex gap-2 justify-end">
            <Button variant="outline">Cancel</Button>
            <Button>Save Access Rules</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className={`${role.color} text-white p-2 rounded`}>
                  <Users className="h-4 w-4" />
                </div>
                {role.name}
              </CardTitle>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">Accessible Modules:</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(access[role.id] || [])
                    .map(key => modules.find(m => m.key === key))
                    .filter(Boolean)
                    .map((module) => (
                      <Badge key={module?.key} variant="secondary">
                        {module?.name}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
