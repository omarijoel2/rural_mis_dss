import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, MapPin, Map } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';

export function SamplingPointsPage() {
  const [page, setPage] = useState(1);
  const [showMap, setShowMap] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['water-quality-sampling-points', page],
    queryFn: async () => {
      return apiClient.get<any>('/v1/water-quality/sampling-points', { page, per_page: 20 });
    }
  });

  const kindColors: Record<string, string> = {
    source: 'bg-blue-100 text-blue-800',
    treatment: 'bg-purple-100 text-purple-800',
    reservoir: 'bg-green-100 text-green-800',
    distribution: 'bg-yellow-100 text-yellow-800',
    kiosk: 'bg-orange-100 text-orange-800',
    household: 'bg-pink-100 text-pink-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sampling Points</h2>
          <p className="text-muted-foreground">
            Geographic locations where water samples are collected
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowMap(!showMap)}>
            <Map className="h-4 w-4 mr-2" />
            {showMap ? 'Hide Map' : 'Show Map'}
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Sampling Point
          </Button>
        </div>
      </div>

      {showMap && (
        <Card>
          <CardContent className="p-0 h-96 bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">Map view will be implemented with MapLibre GL</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">Loading sampling points...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.data?.map((point: any) => (
            <Card key={point.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{point.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Code: {point.code}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className={kindColors[point.kind] || 'bg-gray-100 text-gray-800'}>
                    {point.kind}
                  </Badge>
                  {!point.is_active && <Badge variant="destructive">Inactive</Badge>}
                </div>
                
                {point.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {point.location.coordinates?.[1]?.toFixed(4)}, {point.location.coordinates?.[0]?.toFixed(4)}
                    </span>
                  </div>
                )}
                
                {point.elevation_m && (
                  <p className="text-sm text-muted-foreground">
                    Elevation: {point.elevation_m}m
                  </p>
                )}
                
                {point.scheme && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Scheme:</span> {point.scheme.name}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data?.meta && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {data.meta.from} to {data.meta.to} of {data.meta.total} sampling points
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.meta.last_page}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
