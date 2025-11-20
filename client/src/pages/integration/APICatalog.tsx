import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Database } from 'lucide-react';

export function APICatalog() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Catalog</h1>
          <p className="text-muted-foreground">
            REST & GraphQL endpoints registry with API keys and rate limits
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Register API
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Published APIs</CardTitle>
          <CardDescription>Internal and external API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No APIs registered yet. Run migrations to create integration tables.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
