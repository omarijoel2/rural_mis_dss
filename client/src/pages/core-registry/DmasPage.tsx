import { useQuery } from '@tanstack/react-query';
import { dmaService } from '../../services/dma.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { RequirePerm } from '../../components/RequirePerm';

export function DmasPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dmas'],
    queryFn: () => dmaService.getAll({ per_page: 50 }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading DMAs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">Error loading DMAs: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">District Metered Areas (DMAs)</h1>
          <p className="text-muted-foreground">Manage water distribution network DMAs</p>
        </div>
        <RequirePerm permission="create dmas">
          <Button>Create DMA</Button>
        </RequirePerm>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.data.map((dma) => (
          <Card key={dma.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{dma.name}</CardTitle>
              <CardDescription>Code: {dma.code}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium capitalize ${
                    dma.status === 'active' ? 'text-green-600' : 
                    dma.status === 'planned' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {dma.status}
                  </span>
                </div>
                {dma.nightline_threshold_m3h && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nightline:</span>
                    <span className="font-medium">{dma.nightline_threshold_m3h} m³/h</span>
                  </div>
                )}
                {dma.pressure_target_bar && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pressure:</span>
                    <span className="font-medium">{dma.pressure_target_bar} bar</span>
                  </div>
                )}
                {dma.scheme && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheme:</span>
                    <span className="font-medium text-xs">{dma.scheme.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <p className="text-lg text-muted-foreground mb-4">No DMAs found</p>
            <RequirePerm permission="create dmas">
              <Button>Create Your First DMA</Button>
            </RequirePerm>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
