import { useQuery } from '@tanstack/react-query';
import { pipelineService } from '../../services/pipeline.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { RequirePerm } from '../../components/RequirePerm';

export function PipelinesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => pipelineService.getAll({ per_page: 50 }),
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pipelines</h1>
          <p className="text-muted-foreground">Manage water distribution pipelines</p>
        </div>
        <RequirePerm permission="create pipelines">
          <Button>Create Pipeline</Button>
        </RequirePerm>
      </div>

      {isLoading && !data ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg text-muted-foreground">Loading pipelines...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-2">Error loading pipelines</p>
            <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
          </div>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.data.map((pipeline) => (
          <Card key={pipeline.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{pipeline.code}</CardTitle>
              <CardDescription>{pipeline.material}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diameter:</span>
                  <span className="font-medium">{pipeline.diameter_mm} mm</span>
                </div>
                {pipeline.install_year && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Installed:</span>
                    <span className="font-medium">{pipeline.install_year}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium capitalize ${
                    pipeline.status === 'active' ? 'text-green-600' : 
                    pipeline.status === 'leak' ? 'text-red-600' : 
                    pipeline.status === 'rehab' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {pipeline.status}
                  </span>
                </div>
                {pipeline.scheme && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheme:</span>
                    <span className="font-medium text-xs">{pipeline.scheme.name}</span>
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
            <p className="text-lg text-muted-foreground mb-4">No pipelines found</p>
            <RequirePerm permission="create pipelines">
              <Button>Create Your First Pipeline</Button>
            </RequirePerm>
          </CardContent>
        </Card>
      )}
        </>
      )}
    </div>
  );
}
