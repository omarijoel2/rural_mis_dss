import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Droplets, Package, AlertTriangle, Plus, History, ArrowRight, FlaskConical } from 'lucide-react';
import { format } from 'date-fns';

interface FlowBand {
  min_lps: number;
  max_lps: number;
  target_mg_l: number;
}

export function DosingControl() {
  const [activeTab, setActiveTab] = useState<'plans' | 'stocks' | 'changelog'>('plans');
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [newStock, setNewStock] = useState({
    chemical: 'chlorine',
    qty_on_hand_kg: '',
    reorder_level_kg: '',
  });

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
    return stock.reorder_level_kg && (stock.qty_on_hand_kg ?? 0) <= stock.reorder_level_kg;
  };

  const getStockPercentage = (stock: any) => {
    if (!stock.reorder_level_kg) return 100;
    const qty = stock.qty_on_hand_kg ?? 0;
    const reorder = stock.reorder_level_kg;
    return Math.min(100, Math.round((qty / (reorder * 2)) * 100));
  };

  const renderFlowBands = (flowBands: FlowBand[] | Record<string, any> | null) => {
    if (!flowBands) return null;
    
    const bands = Array.isArray(flowBands) 
      ? flowBands 
      : Object.values(flowBands);
    
    if (bands.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t">
        <div className="text-xs font-medium text-foreground mb-2">Flow Bands</div>
        <div className="space-y-1">
          {bands.map((band: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1">
              <span className="text-muted-foreground">
                {band.min_lps ?? 0} - {band.max_lps ?? '∞'} L/s
              </span>
              <span className="font-medium text-primary">
                {band.target_mg_l ?? 0} mg/L
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const doseChangeLogs = [
    { id: 1, plan: 'Chlorinator A', changed_by: 'John Operator', changed_at: new Date().toISOString(), field: 'target_mg_l', before: '0.8', after: '1.2', reason: 'Increased turbidity detected' },
    { id: 2, plan: 'Chlorinator B', changed_by: 'Jane Engineer', changed_at: new Date(Date.now() - 86400000).toISOString(), field: 'flow_band', before: '10-20 L/s', after: '15-25 L/s', reason: 'Pump upgrade' },
    { id: 3, plan: 'WTP Main Dosing', changed_by: 'Admin User', changed_at: new Date(Date.now() - 172800000).toISOString(), field: 'chemical', before: 'Chlorine Gas', after: 'Sodium Hypochlorite', reason: 'Safety compliance' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6 bg-background">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dosing Control</h1>
          <p className="text-muted-foreground">Chemical dosing plans and stock management</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Record Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Chemical Stock</DialogTitle>
                <DialogDescription>Update the current stock level for a chemical</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Chemical</Label>
                  <Select value={newStock.chemical} onValueChange={(v) => setNewStock({ ...newStock, chemical: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chlorine">Chlorine</SelectItem>
                      <SelectItem value="sodium_hypochlorite">Sodium Hypochlorite</SelectItem>
                      <SelectItem value="alum">Alum (Aluminum Sulfate)</SelectItem>
                      <SelectItem value="pac">PAC (Poly Aluminum Chloride)</SelectItem>
                      <SelectItem value="lime">Lime (Calcium Hydroxide)</SelectItem>
                      <SelectItem value="fluoride">Fluoride</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity on Hand (kg)</Label>
                  <Input 
                    type="number"
                    placeholder="Enter quantity"
                    value={newStock.qty_on_hand_kg}
                    onChange={(e) => setNewStock({ ...newStock, qty_on_hand_kg: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reorder Level (kg)</Label>
                  <Input 
                    type="number"
                    placeholder="Enter reorder threshold"
                    value={newStock.reorder_level_kg}
                    onChange={(e) => setNewStock({ ...newStock, reorder_level_kg: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStockDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  setStockDialogOpen(false);
                  setNewStock({ chemical: 'chlorine', qty_on_hand_kg: '', reorder_level_kg: '' });
                }}>
                  Save Stock Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button>
            <Droplets className="mr-2 h-4 w-4" />
            Create Dose Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FlaskConical className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{plans?.data?.length ?? 0}</div>
                <div className="text-sm text-muted-foreground">Active Dose Plans</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Package className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stocks?.data?.length ?? 0}</div>
                <div className="text-sm text-muted-foreground">Stock Records</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {stocks?.data?.filter((s: any) => isLowStock(s)).length ?? 0}
                </div>
                <div className="text-sm text-muted-foreground">Low Stock Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <History className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{doseChangeLogs.length}</div>
                <div className="text-sm text-muted-foreground">Recent Changes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="bg-muted">
          <TabsTrigger value="plans">Dosing Plans</TabsTrigger>
          <TabsTrigger value="stocks">Chemical Stock</TabsTrigger>
          <TabsTrigger value="changelog">Change Log</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-6">
          {plansLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-lg text-muted-foreground">Loading dosing plans...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans?.data.map((plan: any) => (
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
                          <span className="font-medium text-foreground capitalize">{plan.chemical.replace('_', ' ')}</span>
                        </div>
                      )}
                      {renderFlowBands(plan.flow_bands)}
                      {plan.thresholds && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-xs font-medium text-foreground mb-2">Residual Thresholds</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {plan.thresholds.min_residual && (
                              <div className="bg-yellow-500/10 rounded px-2 py-1">
                                <span className="text-muted-foreground">Min: </span>
                                <span className="font-medium text-yellow-600">{plan.thresholds.min_residual} mg/L</span>
                              </div>
                            )}
                            {plan.thresholds.max_residual && (
                              <div className="bg-red-500/10 rounded px-2 py-1">
                                <span className="text-muted-foreground">Max: </span>
                                <span className="font-medium text-red-600">{plan.thresholds.max_residual} mg/L</span>
                              </div>
                            )}
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
                {stocks?.data.map((stock: any) => (
                  <Card key={stock.id} className="bg-card text-card-foreground">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4" />
                          <div>
                            <CardTitle className="text-base text-foreground capitalize">
                              {(stock.chemical || 'Unknown').replace('_', ' ')}
                            </CardTitle>
                            <CardDescription>
                              {stock.scheme?.name}
                              {stock.facility?.name && ` - ${stock.facility.name}`}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isLowStock(stock) && (
                            <Badge variant="destructive" className="animate-pulse">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Low Stock
                            </Badge>
                          )}
                          {stock.as_of && (
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">As of</div>
                              <div className="text-sm font-medium text-foreground">
                                {format(new Date(stock.as_of), 'PP')}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLowStock(stock) && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Stock level is at or below reorder point. Please reorder immediately.
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Quantity on Hand</div>
                          <div className={`text-2xl font-bold ${isLowStock(stock) ? 'text-red-600' : 'text-foreground'}`}>
                            {(stock.qty_on_hand_kg ?? 0).toLocaleString()} kg
                          </div>
                        </div>
                        {stock.reorder_level_kg != null && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Reorder Level</div>
                            <div className="text-2xl font-bold text-muted-foreground">
                              {(stock.reorder_level_kg ?? 0).toLocaleString()} kg
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Stock Level</div>
                          <div className="w-full bg-muted rounded-full h-3 mt-2">
                            <div 
                              className={`h-3 rounded-full transition-all ${
                                getStockPercentage(stock) < 25 ? 'bg-red-500' :
                                getStockPercentage(stock) < 50 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${getStockPercentage(stock)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-end">
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-1" />
                            Update Stock
                          </Button>
                        </div>
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
                    <Button onClick={() => setStockDialogOpen(true)}>Record Stock Level</Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="changelog" className="mt-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Dose Change Log</CardTitle>
              <CardDescription>History of dosing parameter changes with before/after values</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Field Changed</TableHead>
                    <TableHead>Before → After</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doseChangeLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {format(new Date(log.changed_at), 'PP p')}
                      </TableCell>
                      <TableCell className="font-medium">{log.plan}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.field.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-red-600 line-through">{log.before}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-green-600 font-medium">{log.after}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.changed_by}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {log.reason}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
