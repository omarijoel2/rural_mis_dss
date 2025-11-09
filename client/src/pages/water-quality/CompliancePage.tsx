import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/api-client';

export function CompliancePage() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['water-quality-compliance-summary'],
    queryFn: async () => {
      return apiClient.get<any>('/v1/water-quality/compliance/summary');
    }
  });

  const { data: compliance, isLoading: complianceLoading } = useQuery({
    queryKey: ['water-quality-compliance'],
    queryFn: async () => {
      return apiClient.get<any>('/v1/water-quality/compliance', { per_page: 50 });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Compliance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor regulatory compliance with WHO and WASREB water quality standards
          </p>
        </div>
        <Button>
          <TrendingUp className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? '...' : `${summary?.overall_compliance_rate?.toFixed(1) || 0}%`}
            </div>
            <Progress value={summary?.overall_compliance_rate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant Points</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? '...' : summary?.compliant_points || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of {summary?.total_points || 0} sampling points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summaryLoading ? '...' : summary?.non_compliant_points || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              require immediate action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests This Period</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? '...' : summary?.total_tests || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.failed_tests || 0} failed tests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Details */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance by Parameter & Location</CardTitle>
        </CardHeader>
        <CardContent>
          {complianceLoading ? (
            <div className="text-center py-8">Loading compliance data...</div>
          ) : (
            <div className="space-y-4">
              {compliance?.data?.map((item: any) => {
                const complianceRate = (item.compliant_samples / item.total_samples) * 100;
                const isCompliant = complianceRate >= 95;
                
                return (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{item.parameter?.name || 'Unknown'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.sampling_point?.name || 'All Points'} • {item.period || 'Current Period'}
                        </p>
                      </div>
                      <Badge variant={isCompliant ? 'default' : 'destructive'}>
                        {complianceRate.toFixed(1)}% Compliant
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm mb-2">
                      <div>
                        <span className="text-muted-foreground">Total Samples:</span>
                        <p className="font-medium">{item.total_samples}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Compliant:</span>
                        <p className="font-medium text-green-600">{item.compliant_samples}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Non-Compliant:</span>
                        <p className="font-medium text-red-600">{item.non_compliant_samples}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Limit Applied:</span>
                        <p className="font-medium">{item.limit_type?.toUpperCase() || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <Progress value={complianceRate} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
