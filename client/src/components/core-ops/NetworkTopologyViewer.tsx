import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, MapPin } from 'lucide-react';
import { topologyAPI } from '@/lib/api';

interface NetworkTopologyViewerProps {
  schemeId: number;
}

export function NetworkTopologyViewer({ schemeId }: NetworkTopologyViewerProps) {
  const { data: nodes, isLoading: nodesLoading } = useQuery({
    queryKey: ['network-nodes', schemeId],
    queryFn: () => topologyAPI.nodes(schemeId),
  });

  const { data: edges, isLoading: edgesLoading } = useQuery({
    queryKey: ['network-edges', schemeId],
    queryFn: () => topologyAPI.edges(schemeId),
  });

  const nodeTypeColors: Record<string, string> = {
    source: 'bg-blue-500',
    reservoir: 'bg-cyan-500',
    junction: 'bg-gray-500',
    treatment: 'bg-green-500',
    pump_station: 'bg-orange-500',
  };

  if (nodesLoading || edgesLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading topology...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Network Topology
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-sm mb-3">Nodes ({nodes?.data?.length || 0})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {nodes?.data?.map((node: any) => (
                <div key={node.id} className="flex items-center gap-2 p-2 bg-gray-800 rounded text-sm">
                  <div className={`w-2 h-2 rounded-full ${nodeTypeColors[node.node_type] || 'bg-gray-400'}`} />
                  <div className="flex-1">
                    <div className="font-medium">{node.name || node.code}</div>
                    <div className="text-xs text-muted-foreground">{node.node_type}</div>
                  </div>
                  {node.latitude && node.longitude && (
                    <MapPin className="h-3 w-3 text-gray-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Connections ({edges?.data?.length || 0})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {edges?.data?.map((edge: any) => (
                <div key={edge.id} className="flex items-center gap-2 p-2 bg-gray-800 rounded text-xs">
                  <div className="flex-1">
                    <div>Node {edge.from_node_id} → Node {edge.to_node_id}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
          PostGIS geometry integration: Spatial analysis for leak detection and pressure management coming soon.
        </div>
      </CardContent>
    </Card>
  );
}
