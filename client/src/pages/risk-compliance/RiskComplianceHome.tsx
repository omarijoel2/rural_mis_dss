import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, AlertTriangle, CheckCircle2, FileText, Shield, Users } from 'lucide-react';

export function RiskComplianceHome() {
  const stats = [
    { label: 'Active Risks', value: 24, icon: AlertTriangle, color: 'text-red-500' },
    { label: 'Incidents (Open)', value: 8, icon: Shield, color: 'text-orange-500' },
    { label: 'Controls Effective', value: '92%', icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Audit Findings', value: 5, icon: BarChart3, color: 'text-yellow-500' },
    { label: 'Policies Published', value: 18, icon: FileText, color: 'text-blue-500' },
    { label: 'Pending Attestations', value: 3, icon: Users, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Risk, Compliance & Governance</h1>
        <p className="text-muted-foreground">Enterprise GRC oversight and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
