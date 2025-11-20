import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Database } from 'lucide-react';

export function ETLJobs() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ETL Jobs</h1>
          <p className="text-muted-foreground">
            Extract, Transform, Load jobs for data integration
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create ETL Job
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Jobs</CardTitle>
          <CardDescription>Import, export, and transformation pipelines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No ETL jobs defined. Create your first job to start data integration.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
