import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { Users, Copy, RotateCcw, Check, X, Zap } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  // Bulk operations
  const selectAllForRole = (roleId: string) => {
    setAccess({
      ...access,
      [roleId]: new Set(modules.map(m => m.key)),
    });
  };

  const clearAllForRole = (roleId: string) => {
    setAccess({
      ...access,
      [roleId]: new Set(),
    });
  };

  const copyRoleAccess = (fromRoleId: string, toRoleId: string) => {
    setAccess({
      ...access,
      [toRoleId]: new Set(access[fromRoleId]),
    });
  };

  const resetToDefaults = () => {
    setAccess({
      admin: new Set(modules.map(m => m.key)),
      manager: new Set(['core-registry', 'core-ops', 'crm', 'cmms', 'water-quality', 'projects', 'costing']),
      operator: new Set(['core-ops', 'cmms', 'water-quality']),
      analyst: new Set(['dsa', 'me', 'costing', 'core-registry']),
      viewer: new Set(['core-registry', 'me', 'dsa']),
    });
  };

  // Calculate statistics
  const stats = useMemo(() => {
    return roles.map(role => ({
      roleId: role.id,
      totalModules: access[role.id]?.size || 0,
      percentage: Math.round(((access[role.id]?.size || 0) / modules.length) * 100),
    }));
  }, [access]);

  const [selectedRoleForCopy, setSelectedRoleForCopy] = useState<string>('');
  const [selectedRoleForSelectAll, setSelectedRoleForSelectAll] = useState<string>('');
  const [selectedRoleForClearAll, setSelectedRoleForClearAll] = useState<string>('');
  const [selectedRoleForCopyTo, setSelectedRoleForCopyTo] = useState<string>('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Permission Matrix</h1>
        <p className="text-muted-foreground">Manage role-based module access with bulk operations</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {roles.map((role) => {
          const roleStat = stats.find(s => s.roleId === role.id);
          return (
            <Card key={role.id}>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className={`${role.color} text-white w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <Users className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium">{role.name}</p>
                  <p className="text-2xl font-bold mt-1">{roleStat?.totalModules}</p>
                  <p className="text-xs text-muted-foreground">{roleStat?.percentage}% access</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>Manage role-based module access. Use bulk operations for quick configuration.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bulk Operations Toolbar */}
          <div className="bg-muted/50 p-4 rounded-lg border space-y-4">
            <p className="font-semibold text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Actions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium mb-2">✓ Grant All Modules</p>
                <div className="flex gap-2">
                  <Select value={selectedRoleForSelectAll} onValueChange={setSelectedRoleForSelectAll}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      if (selectedRoleForSelectAll) {
                        selectAllForRole(selectedRoleForSelectAll);
                      }
                    }}
                    disabled={!selectedRoleForSelectAll}
                    className="w-20"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium mb-2">✗ Revoke All Modules</p>
                <div className="flex gap-2">
                  <Select value={selectedRoleForClearAll} onValueChange={setSelectedRoleForClearAll}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => {
                      if (selectedRoleForClearAll) {
                        clearAllForRole(selectedRoleForClearAll);
                      }
                    }}
                    disabled={!selectedRoleForClearAll}
                    className="w-20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium mb-2">⟹ Copy Permissions</p>
                <div className="flex gap-1">
                  <Select value={selectedRoleForCopy} onValueChange={setSelectedRoleForCopy}>
                    <SelectTrigger className="h-9 flex-1">
                      <SelectValue placeholder="From..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedRoleForCopyTo} onValueChange={setSelectedRoleForCopyTo}>
                    <SelectTrigger className="h-9 flex-1">
                      <SelectValue placeholder="To..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.filter(r => r.id !== selectedRoleForCopy).map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      if (selectedRoleForCopy && selectedRoleForCopyTo) {
                        copyRoleAccess(selectedRoleForCopy, selectedRoleForCopyTo);
                      }
                    }}
                    disabled={!selectedRoleForCopy || !selectedRoleForCopyTo}
                    className="w-12"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Permission Matrix Grid */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="text-left py-4 px-4 font-semibold sticky left-0 bg-muted z-10" style={{ minWidth: '200px' }}>Module</th>
                  {roles.map((role) => (
                    <th key={role.id} className="text-center py-4 px-3" style={{ minWidth: '120px' }}>
                      <div className="flex flex-col items-center gap-2">
                        <div className={`${role.color} text-white px-3 py-2 rounded-md text-xs font-semibold`}>
                          {role.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {access[role.id]?.size}/{modules.length}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map((module, idx) => (
                  <tr key={module.key} className={idx % 2 === 0 ? 'bg-background hover:bg-muted/30' : 'bg-muted/20 hover:bg-muted/50'}>
                    <td className="py-4 px-4 font-medium sticky left-0 z-10 bg-inherit">{module.name}</td>
                    {roles.map((role) => (
                      <td key={`${role.id}-${module.key}`} className="text-center py-4 px-3">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={hasAccess(role.id, module.key)}
                            onCheckedChange={() => toggleAccess(role.id, module.key)}
                            aria-label={`Grant ${role.name} access to ${module.name}`}
                            className="h-5 w-5"
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline">Cancel</Button>
            <Button>
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Role Details Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Role Summaries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <Card key={role.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-3">
                  <div className={`${role.color} text-white p-2 rounded-lg`}>
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p>{role.name}</p>
                    <p className="text-xs text-muted-foreground font-normal mt-1">{role.description}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">MODULES ASSIGNED</p>
                    <p className="text-2xl font-bold">{access[role.id]?.size || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">of {modules.length} total</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">ACCESSIBLE:</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(access[role.id] || [])
                        .sort()
                        .map(key => modules.find(m => m.key === key))
                        .filter(Boolean)
                        .map((module) => (
                          <Badge key={module?.key} variant="secondary" className="text-xs">
                            {module?.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
