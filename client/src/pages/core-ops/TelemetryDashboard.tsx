import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export function TelemetryDashboard() {
  const [filters, setFilters] = useState({
    category: '',
    enabled: true,
  });

  const { data: tags, isLoading, error } = useQuery({
    queryKey: ['telemetry-tags', filters],
    queryFn: () => coreOpsService.telemetry.getTags({ ...filters, per_page: 50 }),
  });

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'float':
      case 'int':
        return <TrendingUp className="h-4 w-4" />;
      case 'bool':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const hasAlarms = (tag: any) => {
    return tag.thresholds && Object.keys(tag.thresholds).length > 0;
  };

  return (
    <div className="container mx-auto p-6 space-y-6 bg-background">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Telemetry & SCADA</h1>
        <p className="text-muted-foreground">Real-time monitoring and data acquisition</p>
      </div>

      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-foreground">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
              <Input
                placeholder="Filter by category..."
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="bg-background text-foreground"
              />
            </div>
            <div className="w-48">
              <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
              <Select
                value={filters.enabled ? 'enabled' : 'all'}
                onValueChange={(value) => setFilters({ ...filters, enabled: value === 'enabled' })}
              >
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  <SelectItem value="enabled">Enabled Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => setFilters({ category: '', enabled: true })}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && !tags ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Loading telemetry tags...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-lg text-destructive">Error loading telemetry: {(error as Error).message}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags?.data.map((tag) => (
              <Card key={tag.id} className={`bg-card text-card-foreground ${!tag.enabled ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getDataTypeIcon(tag.data_type)}
                      <CardTitle className="text-base text-foreground">{tag.tag_name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      {hasAlarms(tag) && (
                        <Badge variant="outline" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Alarms
                        </Badge>
                      )}
                      {!tag.enabled && (
                        <Badge variant="secondary" className="text-xs">Disabled</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {tag.scheme?.name || tag.asset?.name || tag.facility?.name || 'Unassigned'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline">{tag.data_type}</Badge>
                  </div>
                  {tag.unit && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Unit:</span>
                      <span className="font-medium text-foreground">{tag.unit}</span>
                    </div>
                  )}
                  {tag.category && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium text-foreground">{tag.category}</span>
                    </div>
                  )}
                  {tag.thresholds && Object.keys(tag.thresholds).length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-xs font-medium text-foreground mb-2">Thresholds</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(tag.thresholds).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                            <span className="font-medium text-foreground">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {tags?.data.length === 0 && (
            <Card className="bg-card text-card-foreground">
              <CardContent className="flex flex-col items-center justify-center p-12">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-4">No telemetry tags found</p>
                <Button>Create Telemetry Tag</Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
