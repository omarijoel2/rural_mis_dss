import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface VectorLayer {
  id: string;
  name: string;
  description?: string;
  layer_type: 'fill' | 'line' | 'circle' | 'symbol';
  visibility: boolean;
  opacity: number;
  fill_color: string;
  stroke_color: string;
  stroke_width: number;
}

interface VectorLayerManagerProps {
  shapeFileId: string;
}

export function VectorLayerManager({ shapeFileId }: VectorLayerManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<VectorLayer | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    layer_type: 'fill' | 'line' | 'circle' | 'symbol';
    fill_color: string;
    stroke_color: string;
    stroke_width: number;
    opacity: number;
  }>({
    name: '',
    layer_type: 'fill',
    fill_color: '#3b82f6',
    stroke_color: '#1e40af',
    stroke_width: 2,
    opacity: 0.6,
  });
  const queryClient = useQueryClient();

  // Fetch vector layers
  const { data: layersData = [] } = useQuery({
    queryKey: ['vector-layers', shapeFileId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/gis/shape-files/${shapeFileId}/layers`
      ) as any;
      return response.data?.data || [];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post(
        `/gis/shape-files/${shapeFileId}/layers`,
        data
      ) as any;
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vector-layers', shapeFileId] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.put(
        `/gis/shape-files/${shapeFileId}/layers/${selectedLayer?.id}`,
        data
      ) as any;
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vector-layers', shapeFileId] });
      setIsDialogOpen(false);
      setSelectedLayer(null);
      resetForm();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/gis/shape-files/${shapeFileId}/layers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vector-layers', shapeFileId] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      layer_type: 'fill',
      fill_color: '#3b82f6',
      stroke_color: '#1e40af',
      stroke_width: 2,
      opacity: 0.6,
    });
  };

  const handleSubmit = () => {
    if (selectedLayer) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const openCreateDialog = () => {
    setSelectedLayer(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (layer: VectorLayer) => {
    setSelectedLayer(layer);
    setFormData({
      name: layer.name,
      layer_type: layer.layer_type,
      fill_color: layer.fill_color,
      stroke_color: layer.stroke_color,
      stroke_width: layer.stroke_width,
      opacity: layer.opacity,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">Vector Layers</h4>
        <Button size="sm" onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Layer
        </Button>
      </div>

      {layersData.length === 0 ? (
        <p className="text-sm text-gray-500">No layers created</p>
      ) : (
        <div className="space-y-2">
          {layersData.map((layer: VectorLayer) => (
            <Card key={layer.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{layer.name}</p>
                  <p className="text-sm text-gray-500">
                    {layer.layer_type} • Opacity: {Math.round(layer.opacity * 100)}%
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(layer)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => deleteMutation.mutate(layer.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLayer ? 'Edit Layer' : 'Create Vector Layer'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Layer Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Layer Type</Label>
              <Select value={formData.layer_type} onValueChange={(value: 'fill' | 'line' | 'circle' | 'symbol') =>
                setFormData({ ...formData, layer_type: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fill">Fill (Polygon)</SelectItem>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="circle">Circle (Point)</SelectItem>
                  <SelectItem value="symbol">Symbol</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fill Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.fill_color}
                  onChange={(e) => setFormData({ ...formData, fill_color: e.target.value })}
                />
                <Input
                  value={formData.fill_color}
                  onChange={(e) => setFormData({ ...formData, fill_color: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Stroke Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.stroke_color}
                  onChange={(e) => setFormData({ ...formData, stroke_color: e.target.value })}
                />
                <Input
                  value={formData.stroke_color}
                  onChange={(e) => setFormData({ ...formData, stroke_color: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Stroke Width</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={formData.stroke_width}
                onChange={(e) => setFormData({ ...formData, stroke_width: parseFloat(e.target.value) })}
              />
            </div>

            <div>
              <Label>Opacity</Label>
              <Input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.opacity}
                onChange={(e) => setFormData({ ...formData, opacity: parseFloat(e.target.value) })}
              />
              <p className="text-sm text-gray-500">{Math.round(formData.opacity * 100)}%</p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
              className="w-full"
            >
              {selectedLayer ? 'Update Layer' : 'Create Layer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
