import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Database, Share2, TrendingUp, AlertCircle, RefreshCw, Plus } from 'lucide-react';

export function DataWarehousePage() {
  const [dwTables] = useState([
    { id: 1, name: 'customers_raw', schema: 'raw', rows: 45230, lastRefresh: '2025-11-24T10:30:00Z', quality: 94 },
    { id: 2, name: 'billing_transactions', schema: 'staging', rows: 128456, lastRefresh: '2025-11-24T12:00:00Z', quality: 97 },
    { id: 3, name: 'customer_mart', schema: 'mart', rows: 45230, lastRefresh: '2025-11-24T14:15:00Z', quality: 99 },
    { id: 4, name: 'asset_registry', schema: 'raw', rows: 8923, lastRefresh: '2025-11-23T16:00:00Z', quality: 91 },
  ]);

  const [lineageFlow] = useState([
    { id: 1, source: 'customers_raw', target: 'customer_mart', type: 'aggregate' },
    { id: 2, source: 'billing_transactions', target: 'customer_mart', type: 'join' },
    { id: 3, source: 'asset_registry', target: 'operations_mart', type: 'filter' },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Warehouse & Lineage</h1>
        <p className="text-muted-foreground">Monitor data flows, transformations, and quality metrics</p>
      </div>

      <Tabs defaultValue="tables" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Tables</span>
          </TabsTrigger>
          <TabsTrigger value="lineage" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Lineage</span>
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Quality</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Data Warehouse Tables</h2>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dwTables.map(table => (
              <Card key={table.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{table.name}</CardTitle>
                      <CardDescription className="mt-1">{table.schema} schema</CardDescription>
                    </div>
                    <Badge variant="outline">{table.schema}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">ROWS</p>
                      <p className="font-bold">{table.rows.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">QUALITY SCORE</p>
                      <div className="flex items-center gap-1">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: `${table.quality}%` }}
                          />
                        </div>
                        <span className="font-bold text-sm">{table.quality}%</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last Refreshed: {new Date(table.lastRefresh).toLocaleString()}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">Profile</Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lineage" className="space-y-4">
          <h2 className="text-lg font-semibold">Data Lineage & Transformations</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {lineageFlow.map((flow, idx) => (
                  <div key={flow.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="font-mono text-sm font-medium">{flow.source}</div>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1 h-0.5 bg-gray-300" />
                      <Badge variant="outline" className="flex-shrink-0">{flow.type}</Badge>
                      <div className="flex-1 h-0.5 bg-gray-300" />
                    </div>
                    <div className="font-mono text-sm font-medium">{flow.target}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 text-base">Lineage Analysis</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p>• Track data dependencies across all tables</p>
              <p>• Identify transformation bottlenecks</p>
              <p>• Impact analysis for schema changes</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <h2 className="text-lg font-semibold">Data Quality Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">COMPLETENESS</p>
                <p className="text-3xl font-bold mt-1">99.2%</p>
                <Badge className="mt-2 bg-green-100 text-green-800">Excellent</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">ACCURACY</p>
                <p className="text-3xl font-bold mt-1">98.7%</p>
                <Badge className="mt-2 bg-green-100 text-green-800">Excellent</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">CONSISTENCY</p>
                <p className="text-3xl font-bold mt-1">97.1%</p>
                <Badge className="mt-2 bg-yellow-100 text-yellow-800">Good</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">TIMELINESS</p>
                <p className="text-3xl font-bold mt-1">100%</p>
                <Badge className="mt-2 bg-green-100 text-green-800">Excellent</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
