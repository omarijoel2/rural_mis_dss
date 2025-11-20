import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';

interface LayerConfig {
  id: string;
  name: string;
  category: 'coverage' | 'infrastructure' | 'network';
  icon: string;
  defaultVisible: boolean;
}

const LAYERS: LayerConfig[] = [
  { id: 'schemes', name: 'Water Supply Schemes', category: 'coverage', icon: '🏞️', defaultVisible: true },
  { id: 'dmas', name: 'District Metered Areas', category: 'coverage', icon: '📊', defaultVisible: true },
  { id: 'facilities', name: 'Facilities', category: 'infrastructure', icon: '🏭', defaultVisible: true },
  { id: 'pipelines', name: 'Pipelines', category: 'network', icon: '🚰', defaultVisible: true },
  { id: 'network-nodes', name: 'Network Nodes', category: 'network', icon: '⚙️', defaultVisible: false },
];

interface NetworkLayersPanelProps {
  enabledLayers: Set<string>;
  onLayerToggle: (layerId: string) => void;
  onStatusFilterChange?: (status: string) => void;
  onCategoryFilterChange?: (category: string) => void;
  onOpacityChange?: (opacity: number) => void;
  className?: string;
}

export function NetworkLayersPanel({ 
  enabledLayers, 
  onLayerToggle,
  onStatusFilterChange,
  onCategoryFilterChange,
  onOpacityChange,
  className = '' 
}: NetworkLayersPanelProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [opacity, setOpacity] = useState([80]);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    onStatusFilterChange?.(status);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    onCategoryFilterChange?.(category);
  };

  const handleOpacityChange = (value: number[]) => {
    setOpacity(value);
    onOpacityChange?.(value[0]);
  };

  const filteredLayers = LAYERS.filter((layer) => {
    if (categoryFilter !== 'all' && layer.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'coverage', label: 'Coverage Areas' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'network', label: 'Network' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'planned', label: 'Planned' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'decommissioned', label: 'Decommissioned' },
  ];

  return (
    <Card className={`w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span>Network Layers</span>
          <Badge variant="outline" className="text-xs font-normal">
            {enabledLayers.size} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-gray-600 dark:text-gray-400">Category Filter</Label>
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-gray-600 dark:text-gray-400">Status Filter</Label>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {filteredLayers.map((layer) => (
            <div
              key={layer.id}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-lg">{layer.icon}</span>
                <div className="flex-1">
                  <Label
                    htmlFor={`layer-${layer.id}`}
                    className="text-sm cursor-pointer text-gray-700 dark:text-gray-300"
                  >
                    {layer.name}
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {layer.category}
                  </p>
                </div>
              </div>
              <Switch
                id={`layer-${layer.id}`}
                checked={enabledLayers.has(layer.id)}
                onCheckedChange={() => onLayerToggle(layer.id)}
              />
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-600 dark:text-gray-400">Layer Opacity</Label>
            <span className="text-xs text-gray-500 dark:text-gray-400">{opacity[0]}%</span>
          </div>
          <Slider
            value={opacity}
            onValueChange={handleOpacityChange}
            min={0}
            max={100}
            step={10}
            className="w-full"
          />
        </div>

        <div className="pt-2 text-xs text-gray-500 dark:text-gray-400">
          <p className="font-semibold mb-1">Legend</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span>Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span>Planned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500"></div>
              <span>Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-400"></div>
              <span>Decommissioned</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
