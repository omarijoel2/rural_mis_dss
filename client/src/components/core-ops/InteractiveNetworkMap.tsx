import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Zap, AlertCircle } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import { topologyAPI } from '@/lib/api';
import 'maplibre-gl/dist/maplibre-gl.css';

interface InteractiveNetworkMapProps {
  schemeId: number;
}

export function InteractiveNetworkMap({ schemeId }: InteractiveNetworkMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const { data: nodes } = useQuery({
    queryKey: ['network-nodes', schemeId],
    queryFn: () => topologyAPI.nodes(schemeId),
  });

  const { data: edges } = useQuery({
    queryKey: ['network-edges', schemeId],
    queryFn: () => topologyAPI.edges(schemeId),
  });

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with default center (approximate Kenya)
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [34.7669, -0.6850],
      zoom: 10,
    });

    // Add layers for nodes and edges
    map.current.on('load', () => {
      if (!map.current) return;

      // Add edges layer (pipelines)
      map.current.addSource('edges', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: (edges?.data || []).map((edge: any) => ({
            type: 'Feature',
            properties: edge,
            geometry: {
              type: 'LineString',
              coordinates: [
                [edge.from_lon || 34.7669, edge.from_lat || -0.6850],
                [edge.to_lon || 34.7669, edge.to_lat || -0.6850],
              ],
            },
          })),
        },
      });

      map.current.addLayer({
        id: 'edges-layer',
        type: 'line',
        source: 'edges',
        paint: {
          'line-color': '#3b82f6',
          'line-width': 3,
          'line-opacity': 0.8,
        },
      });

      // Add nodes layer
      map.current.addSource('nodes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: (nodes?.data || []).map((node: any) => {
            const colors: Record<string, string> = {
              source: '#3b82f6',
              reservoir: '#06b6d4',
              junction: '#9ca3af',
              treatment: '#10b981',
              pump_station: '#f97316',
            };
            return {
              type: 'Feature',
              properties: node,
              geometry: {
                type: 'Point',
                coordinates: [parseFloat(node.longitude) || 34.7669, parseFloat(node.latitude) || -0.6850],
              },
            };
          }),
        },
      });

      map.current.addLayer({
        id: 'nodes-layer',
        type: 'circle',
        source: 'nodes',
        paint: {
          'circle-radius': 8,
          'circle-color': [
            'match',
            ['get', 'node_type'],
            'source', '#3b82f6',
            'reservoir', '#06b6d4',
            'junction', '#9ca3af',
            'treatment', '#10b981',
            'pump_station', '#f97316',
            '#999',
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Interactive features
      map.current.on('click', 'nodes-layer', (e) => {
        const node = e.features?.[0]?.properties;
        if (node) setSelectedNode(node);
      });

      map.current.on('mouseenter', 'nodes-layer', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'nodes-layer', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    });

    return () => {
      if (map.current) map.current.remove();
    };
  }, [nodes, edges]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Network Topology Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={mapContainer}
            className="w-full h-96 rounded-lg border border-gray-700 overflow-hidden"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-xs">Sources</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-full" />
              <span className="text-xs">Reservoirs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-xs">Treatment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-xs">Pumps</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedNode && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-sm">{selectedNode.name || selectedNode.code}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Type:</span>
              <Badge>{selectedNode.node_type?.replace(/_/g, ' ')}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              <div>Code: {selectedNode.code}</div>
              {selectedNode.latitude && selectedNode.longitude && (
                <div>Location: {selectedNode.latitude}, {selectedNode.longitude}</div>
              )}
              {selectedNode.elevation && (
                <div>Elevation: {selectedNode.elevation}m</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
