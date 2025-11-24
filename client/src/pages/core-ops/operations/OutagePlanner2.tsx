import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function OutagePlanner2() {
  const { data: outages, isLoading } = useQuery({
    queryKey: ['outages'],
    queryFn: async () => {
      const res = await fetch('/api/core/outages');
      return res.json();
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Outage Planner</h1>
        <p className="text-muted-foreground">Plan and manage water service outages</p>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {outages?.data?.map((outage: any) => (
            <Card key={outage.id}>
              <CardHeader>
                <CardTitle className="text-lg">{outage.reason}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><span className="font-semibold">Cause:</span> {outage.cause}</div>
                <div><span className="font-semibold">State:</span> <Badge>{outage.state}</Badge></div>
                <div><span className="font-semibold">Affected Population:</span> {outage.estimatedAffectedPopulation}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
