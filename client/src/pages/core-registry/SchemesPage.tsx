import { useQuery } from '@tanstack/react-query';
import { schemeService } from '../../services/scheme.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { ImportGeoJSONDialog } from '../../components/gis/ImportGeoJSONDialog';
import { Download, Upload } from 'lucide-react';

export function SchemesPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['schemes'],
    queryFn: () => schemeService.getAll({ per_page: 50 }),
  });

  const handleExport = async () => {
    try {
      const response = await fetch('/api/v1/gis/schemes/export', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `schemes-${new Date().toISOString().split('T')[0]}.geojson`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Water Supply Schemes</h1>
          <p className="text-muted-foreground">Manage water supply schemes and infrastructure</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export GeoJSON
          </Button>
          <ImportGeoJSONDialog onImportComplete={() => refetch()} />
          <Button>Create Scheme</Button>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Loading schemes...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-lg text-destructive">Error loading schemes: {(error as Error).message}</p>
        </div>
      ) : (
        <>
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

          {!data?.data?.length && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <p className="text-lg text-muted-foreground mb-4">No schemes found</p>
                <Button>Create Your First Scheme</Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
