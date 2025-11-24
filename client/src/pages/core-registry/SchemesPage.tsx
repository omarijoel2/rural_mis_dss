import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function SchemesPage() {
  const { data: schemes, isLoading } = useQuery({
    queryKey: ['schemes'],
    queryFn: async () => {
      const res = await fetch('/api/core/schemes');
      return res.json();
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Water Schemes Registry</h1>
        <p className="text-muted-foreground">Manage water supply schemes</p>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schemes?.data?.map((scheme: any) => (
            <Card key={scheme.id}>
              <CardHeader>
                <CardTitle className="text-lg">{scheme.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><span className="font-semibold">Code:</span> {scheme.code}</div>
                <div><span className="font-semibold">Type:</span> {scheme.type}</div>
                <div><span className="font-semibold">Status:</span> <Badge>{scheme.status}</Badge></div>
                <div><span className="font-semibold">County:</span> {scheme.county}</div>
                <div><span className="font-semibold">Connections:</span> {scheme.connections}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
