import { useQuery } from '@tanstack/react-query';
import { schemeService } from '../../services/scheme.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export function SchemesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['schemes'],
    queryFn: () => schemeService.getAll({ per_page: 50 }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading schemes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">Error loading schemes: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Water Supply Schemes</h1>
          <p className="text-muted-foreground">Manage water supply schemes and infrastructure</p>
        </div>
        <Button>Create Scheme</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.data.map((scheme) => (
          <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{scheme.name}</CardTitle>
              <CardDescription>Code: {scheme.code}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{scheme.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium capitalize ${
                    scheme.status === 'active' ? 'text-green-600' : 
                    scheme.status === 'planning' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {scheme.status}
                  </span>
                </div>
                {scheme.population_estimate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Population:</span>
                    <span className="font-medium">{scheme.population_estimate.toLocaleString()}</span>
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
            <p className="text-lg text-muted-foreground mb-4">No schemes found</p>
            <Button>Create Your First Scheme</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
