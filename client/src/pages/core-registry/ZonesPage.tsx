import { useQuery } from '@tanstack/react-query';
import { zoneService } from '../../services/zone.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { RequirePerm } from '../../components/RequirePerm';

export function ZonesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['zones'],
    queryFn: () => zoneService.getAll({ per_page: 50 }),
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Zones</h1>
          <p className="text-muted-foreground">Manage geographical zones</p>
        </div>
        <RequirePerm permission="create zones">
          <Button>Create Zone</Button>
        </RequirePerm>
      </div>

      {isLoading && !data ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg text-muted-foreground">Loading zones...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-2">Error loading zones</p>
            <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
          </div>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.data.map((zone) => (
          <Card key={zone.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{zone.name}</CardTitle>
              <CardDescription>Code: {zone.code}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{zone.type}</span>
                </div>
                {zone.scheme && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheme:</span>
                    <span className="font-medium text-xs">{zone.scheme.name}</span>
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
            <p className="text-lg text-muted-foreground mb-4">No zones found</p>
            <RequirePerm permission="create zones">
              <Button>Create Your First Zone</Button>
            </RequirePerm>
          </CardContent>
        </Card>
      )}
        </>
      )}
    </div>
  );
}
