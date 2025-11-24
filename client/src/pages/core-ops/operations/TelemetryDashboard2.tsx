import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function TelemetryDashboard2() {
  const { data: measurements, isLoading } = useQuery({
    queryKey: ['telemetry'],
    queryFn: async () => {
      const res = await fetch('/api/core/telemetry/measurements');
      return res.json();
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Real-Time Telemetry</h1>
        <p className="text-muted-foreground">SCADA monitoring and live measurements</p>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {measurements?.data?.map((m: any) => (
            <Card key={m.id}>
              <CardHeader>
                <CardTitle className="text-lg">{m.tag}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><span className="font-semibold">Value:</span> {m.value}</div>
                <div><span className="font-semibold">Timestamp:</span> {m.timestamp}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
