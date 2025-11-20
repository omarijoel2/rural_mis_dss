import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Droplets, Package, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export function DosingControl() {
  const [activeTab, setActiveTab] = useState<'plans' | 'stocks'>('plans');

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['dose-plans'],
    queryFn: () => coreOpsService.dosing.getPlans({ per_page: 50 }),
    enabled: activeTab === 'plans',
  });

  const { data: stocks, isLoading: stocksLoading } = useQuery({
    queryKey: ['chemical-stocks'],
    queryFn: () => coreOpsService.dosing.getStocks({ per_page: 50 }),
    enabled: activeTab === 'stocks',
  });

  const isLowStock = (stock: any) => {
    return stock.reorder_level_kg && stock.qty_on_hand_kg <= stock.reorder_level_kg;
  };

  return (
    <div className="container mx-auto p-6 space-y-6 bg-background">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dosing Control</h1>
          <p className="text-muted-foreground">Chemical dosing plans and stock management</p>
        </div>
        <Button>
          <Droplets className="mr-2 h-4 w-4" />
          Create Dose Plan
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="bg-muted">
          <TabsTrigger value="plans">Dosing Plans</TabsTrigger>
          <TabsTrigger value="stocks">Chemical Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-6">
          {plansLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-lg text-muted-foreground">Loading dosing plans...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans?.data.map((plan) => (
                  <Card key={plan.id} className={`bg-card text-card-foreground ${!plan.active ? 'opacity-60' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-primary" />
                          <CardTitle className="text-base text-foreground">
                            {plan.asset?.name || plan.asset?.code || 'Unknown Asset'}
                          </CardTitle>
                        </div>
                        <Badge variant={plan.active ? 'default' : 'secondary'}>
                          {plan.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <CardDescription>{plan.scheme?.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {plan.chemical && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Chemical:</span>
                          <span className="font-medium text-foreground">{plan.chemical}</span>
                        </div>
                      )}
                      {plan.flow_bands && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-xs font-medium text-foreground mb-2">Flow Bands</div>
                          <div className="text-xs text-muted-foreground">
                            {Object.keys(plan.flow_bands).length} band(s) configured
                          </div>
                        </div>
                      )}
                      {plan.thresholds && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-xs font-medium text-foreground mb-2">Thresholds</div>
                          <div className="text-xs text-muted-foreground">
                            {Object.keys(plan.thresholds).length} threshold(s) configured
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {plans?.data.length === 0 && (
                <Card className="bg-card text-card-foreground">
                  <CardContent className="flex flex-col items-center justify-center p-12">
                    <Droplets className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground mb-4">No dosing plans configured</p>
                    <Button>Create First Dosing Plan</Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="stocks" className="mt-6">
          {stocksLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-lg text-muted-foreground">Loading chemical stock...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {stocks?.data.map((stock) => (
                  <Card key={stock.id} className="bg-card text-card-foreground">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4" />
                          <div>
                            <CardTitle className="text-base text-foreground">{stock.chemical}</CardTitle>
                            <CardDescription>
                              {stock.scheme?.name}
                              {stock.facility?.name && ` - ${stock.facility.name}`}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">As of</div>
                          <div className="text-sm font-medium text-foreground">
                            {format(new Date(stock.as_of), 'PP')}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLowStock(stock) && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Stock level is at or below reorder point
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Quantity on Hand</div>
                          <div className={`text-2xl font-bold ${isLowStock(stock) ? 'text-red-600' : 'text-foreground'}`}>
                            {stock.qty_on_hand_kg.toLocaleString()} kg
                          </div>
                        </div>
                        {stock.reorder_level_kg && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Reorder Level</div>
                            <div className="text-2xl font-bold text-muted-foreground">
                              {stock.reorder_level_kg.toLocaleString()} kg
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {stocks?.data.length === 0 && (
                <Card className="bg-card text-card-foreground">
                  <CardContent className="flex flex-col items-center justify-center p-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground mb-4">No chemical stock records</p>
                    <Button>Record Stock Level</Button>
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
