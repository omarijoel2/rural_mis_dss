import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Zap, Database, Shield, Activity } from 'lucide-react';

export function SettingsPage() {
  const [modules, setModules] = useState([
    { key: 'core-registry', name: 'Core Registry', description: 'Schemes, assets, facilities management', enabled: true, icon: Database },
    { key: 'core-ops', name: 'Core Operations', description: 'Telemetry, outages, SCADA control', enabled: true, icon: Activity },
    { key: 'crm', name: 'CRM', description: 'Customer relationship management', enabled: true, icon: Shield },
    { key: 'cmms', name: 'CMMS', description: 'Asset maintenance and work orders', enabled: true, icon: Zap },
    { key: 'water-quality', name: 'Water Quality', description: 'WQ parameters, sampling, compliance', enabled: true, icon: Database },
    { key: 'hydromet', name: 'Hydromet', description: 'Hydro-meteorological data', enabled: true, icon: Database },
    { key: 'costing', name: 'Costing & Finance', description: 'Budgets, allocations, cost-to-serve', enabled: true, icon: Zap },
    { key: 'procurement', name: 'Procurement', description: 'RFQs, LPOs, vendor management', enabled: true, icon: Shield },
    { key: 'projects', name: 'Projects', description: 'Project planning and tracking', enabled: true, icon: Activity },
    { key: 'community', name: 'Community & Stakeholder', description: 'Committees, grievances, vendors', enabled: true, icon: Shield },
    { key: 'risk-compliance', name: 'Risk, Compliance & Governance', description: 'Risk register, incidents, audit', enabled: true, icon: Shield },
    { key: 'dsa', name: 'Decision Support & Analytics', description: 'Forecasts, scenarios, optimization', enabled: true, icon: Zap },
    { key: 'training', name: 'Training & Knowledge', description: 'Learning management, certifications', enabled: true, icon: Database },
    { key: 'me', name: 'M&E', description: 'Monitoring & evaluation, KPIs', enabled: true, icon: Activity },
  ]);

  const toggleModule = (key: string) => {
    setModules(modules.map(m => 
      m.key === key ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const enabledCount = modules.filter(m => m.enabled).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure and manage system modules</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Module Management</CardTitle>
          <CardDescription>Enable or disable modules for this tenant. Disabled modules won't appear in the sidebar.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900">
              Enabled: <strong>{enabledCount} of {modules.length}</strong> modules
            </p>
          </div>

          <div className="space-y-3">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <div key={module.key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                  <div className="flex items-start gap-4 flex-1">
                    <Icon className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold">{module.name}</p>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={module.enabled ? 'default' : 'secondary'}>
                      {module.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Switch
                      checked={module.enabled}
                      onCheckedChange={() => toggleModule(module.key)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex gap-2 justify-end">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium">Multi-Tenancy</p>
              <p className="text-2xl font-bold mt-2">Enabled</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium">RBAC</p>
              <p className="text-2xl font-bold mt-2">Active</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium">Audit Logging</p>
              <p className="text-2xl font-bold mt-2">On</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium">API Rate Limiting</p>
              <p className="text-2xl font-bold mt-2">1000/min</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
