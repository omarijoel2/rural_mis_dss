import { useQuery } from '@tanstack/react-query';
import { facilityService } from '../../services/facility.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export function FacilitiesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => facilityService.getAll({ per_page: 50 }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading facilities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">Error loading facilities: {(error as Error).message}</p>
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    source: 'bg-blue-500',
    treatment: 'bg-green-500',
    pumpstation: 'bg-purple-500',
    reservoir: 'bg-cyan-500',
    office: 'bg-gray-500',
    workshop: 'bg-yellow-500',
    warehouse: 'bg-orange-500',
    lab: 'bg-pink-500',
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Facilities</h1>
          <p className="text-muted-foreground">Manage water infrastructure facilities</p>
        </div>
        <Button>Create Facility</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.data.map((facility) => (
          <Card key={facility.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{facility.name}</CardTitle>
                  <CardDescription>Code: {facility.code}</CardDescription>
                </div>
                <Badge className={categoryColors[facility.category] || 'bg-gray-500'}>
                  {facility.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium capitalize ${
                    facility.status === 'active' ? 'text-green-600' : 
                    facility.status === 'standby' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {facility.status}
                  </span>
                </div>
                {facility.scheme && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheme:</span>
                    <span className="font-medium truncate ml-2">{facility.scheme.name}</span>
                  </div>
                )}
                {facility.commissioned_on && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commissioned:</span>
                    <span className="font-medium">{new Date(facility.commissioned_on).toLocaleDateString()}</span>
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
            <p className="text-lg text-muted-foreground mb-4">No facilities found</p>
            <Button>Create Your First Facility</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
