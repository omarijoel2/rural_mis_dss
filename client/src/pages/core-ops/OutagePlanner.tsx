import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { AlertTriangle, Calendar, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export function OutagePlanner() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'draft' | 'closed'>('active');

  const { data, isLoading, error } = useQuery({
    queryKey: ['outages', activeFilter],
    queryFn: () => coreOpsService.outages.getAll({
      active: activeFilter === 'active' ? true : undefined,
      state: activeFilter === 'draft' ? 'draft' : activeFilter === 'closed' ? 'closed' : undefined,
      per_page: 50,
    }),
  });

  const getStateColor = (state: string) => {
    switch (state) {
      case 'live':
        return 'destructive';
      case 'approved':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'restored':
        return 'outline';
      case 'closed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getCauseIcon = (cause: string) => {
    switch (cause) {
      case 'planned':
        return <Calendar className="h-4 w-4" />;
      case 'fault':
        return <AlertTriangle className="h-4 w-4" />;
      case 'power':
        return <AlertTriangle className="h-4 w-4" />;
      case 'water_quality':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-destructive">Error loading outages: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-background">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Outage Management</h1>
          <p className="text-muted-foreground">Plan and track water supply interruptions</p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Outage
        </Button>
      </div>

      <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)}>
        <TabsList className="bg-muted">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-lg text-muted-foreground">Loading outages...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {data?.data.map((outage) => (
                  <Card key={outage.id} className="bg-card text-card-foreground hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getCauseIcon(outage.cause)}
                          <div>
                            <CardTitle className="text-foreground">
                              {outage.scheme?.name || 'Unknown Scheme'}
                              {outage.code && <span className="text-muted-foreground ml-2">({outage.code})</span>}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {outage.dma?.name && `DMA: ${outage.dma.name}`}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getStateColor(outage.state)} className="capitalize">
                            {outage.state}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {outage.cause}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {outage.summary && (
                        <p className="text-sm text-muted-foreground">{outage.summary}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-xs text-muted-foreground">Start Time</div>
                            <div className="font-medium text-foreground">
                              {format(new Date(outage.starts_at), 'PPp')}
                            </div>
                          </div>
                        </div>

                        {outage.ends_at && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-xs text-muted-foreground">End Time</div>
                              <div className="font-medium text-foreground">
                                {format(new Date(outage.ends_at), 'PPp')}
                              </div>
                            </div>
                          </div>
                        )}

                        {outage.estimated_customers_affected && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-xs text-muted-foreground">Est. Customers</div>
                              <div className="font-medium text-foreground">
                                {outage.estimated_customers_affected.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        )}

                        {outage.actual_restored_at && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="text-xs text-muted-foreground">Restored At</div>
                              <div className="font-medium text-foreground">
                                {format(new Date(outage.actual_restored_at), 'PPp')}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {outage.audits && outage.audits.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-xs font-medium text-foreground mb-2">Recent Activity</div>
                          <div className="space-y-1">
                            {outage.audits.slice(0, 3).map((audit) => (
                              <div key={audit.id} className="text-xs text-muted-foreground">
                                {audit.event} - {format(new Date(audit.created_at), 'PPp')}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {data?.data.length === 0 && (
                <Card className="bg-card text-card-foreground">
                  <CardContent className="flex flex-col items-center justify-center p-12">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground mb-4">No outages found</p>
                    <Button>
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule First Outage
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
