import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';

export function DataWarehouse() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Warehouse Catalog</h1>
        <p className="text-muted-foreground">
          Browse data zones (raw, refined, curated) and table schemas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Raw', 'Refined', 'Curated'].map((zone) => (
          <Card key={zone}>
            <CardHeader>
              <CardTitle className="text-base">{zone} Zone</CardTitle>
              <CardDescription>0 tables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {zone === 'Raw' && 'Immutable source data'}
                {zone === 'Refined' && 'Cleaned and standardized'}
                {zone === 'Curated' && 'Business-ready analytics'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Catalog</CardTitle>
          <CardDescription>Tables, schemas, and lineage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Data warehouse catalog will populate once ETL jobs create tables.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
