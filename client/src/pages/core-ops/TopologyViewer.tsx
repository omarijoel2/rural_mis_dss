import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Network, GitBranch, Circle } from 'lucide-react';

export function TopologyViewer() {
  const [activeTab, setActiveTab] = useState<'nodes' | 'edges'>('nodes');
  const [nodeTypeFilter, setNodeTypeFilter] = useState<string>('');

  const { data: nodes, isLoading: nodesLoading } = useQuery({
    queryKey: ['topology-nodes', nodeTypeFilter],
    queryFn: () => coreOpsService.topology.getNodes({
      node_type: nodeTypeFilter || undefined,
      per_page: 50,
    }),
    enabled: activeTab === 'nodes',
  });

  const { data: edges, isLoading: edgesLoading } = useQuery({
    queryKey: ['topology-edges'],
    queryFn: () => coreOpsService.topology.getEdges({ per_page: 50 }),
    enabled: activeTab === 'edges',
  });

  const getNodeTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      source: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      reservoir: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      treatment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      pump_station: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      junction: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      customer: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      prv: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      valve: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      meter: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="container mx-auto p-6 space-y-6 bg-background">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Network Topology</h1>
          <p className="text-muted-foreground">Visualize and manage water network infrastructure</p>
        </div>
        <Button>
          <Network className="mr-2 h-4 w-4" />
          Add Node
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="bg-muted">
          <TabsTrigger value="nodes">Nodes</TabsTrigger>
          <TabsTrigger value="edges">Edges</TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="mt-6 space-y-4">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-foreground">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground mb-2 block">Node Type</label>
                  <Input
                    placeholder="Filter by type (source, reservoir, pump_station, etc.)"
                    value={nodeTypeFilter}
                    onChange={(e) => setNodeTypeFilter(e.target.value)}
                    className="bg-background text-foreground"
                  />
                </div>
                <Button variant="outline" onClick={() => setNodeTypeFilter('')}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {nodesLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-lg text-muted-foreground">Loading network nodes...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nodes?.data.map((node) => (
                  <Card key={node.id} className="bg-card text-card-foreground hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Circle className="h-4 w-4" />
                          <div>
                            <CardTitle className="text-base text-foreground">{node.name}</CardTitle>
                            <CardDescription className="mt-1">{node.code}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getNodeTypeColor(node.node_type)}>
                          {node.node_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {node.attributes && Object.keys(node.attributes).length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-foreground">Attributes</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(node.attributes).slice(0, 4).map(([key, value]) => (
                              <div key={key} className="flex flex-col">
                                <span className="text-muted-foreground capitalize">{key}:</span>
                                <span className="font-medium text-foreground truncate">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {nodes?.data.length === 0 && (
                <Card className="bg-card text-card-foreground">
                  <CardContent className="flex flex-col items-center justify-center p-12">
                    <Circle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground mb-4">No network nodes found</p>
                    <Button>Add First Node</Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="edges" className="mt-6">
          {edgesLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-lg text-muted-foreground">Loading network edges...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {edges?.data.map((edge) => (
                  <Card key={edge.id} className="bg-card text-card-foreground hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <GitBranch className="h-4 w-4" />
                          <div>
                            <CardTitle className="text-base text-foreground">
                              {edge.code || `Edge ${String(edge.id).slice(0, 8)}`}
                            </CardTitle>
                            <CardDescription className="mt-1 capitalize">
                              {(edge.edge_type || 'unknown').replace('_', ' ')}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">{edge.edge_type || 'unknown'}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {edge.diameter_mm && (
                          <div>
                            <div className="text-xs text-muted-foreground">Diameter</div>
                            <div className="font-medium text-foreground">{edge.diameter_mm} mm</div>
                          </div>
                        )}
                        {edge.length_m && (
                          <div>
                            <div className="text-xs text-muted-foreground">Length</div>
                            <div className="font-medium text-foreground">{edge.length_m.toLocaleString()} m</div>
                          </div>
                        )}
                        {edge.material && (
                          <div>
                            <div className="text-xs text-muted-foreground">Material</div>
                            <div className="font-medium text-foreground capitalize">{edge.material}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {edges?.data.length === 0 && (
                <Card className="bg-card text-card-foreground">
                  <CardContent className="flex flex-col items-center justify-center p-12">
                    <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground mb-4">No network edges found</p>
                    <Button>Add First Edge</Button>
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
