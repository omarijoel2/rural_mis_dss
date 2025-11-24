import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Zap } from 'lucide-react';
import { predictionsAPI } from '@/lib/api';

export function PredictionsConnector() {
  const { data: failures } = useQuery({
    queryKey: ['predictions-failures'],
    queryFn: predictionsAPI.assetFailures,
    staleTime: 5 * 60 * 1000,
  });

  const { data: anomalies } = useQuery({
    queryKey: ['predictions-anomalies'],
    queryFn: predictionsAPI.nrwAnomalies,
    staleTime: 5 * 60 * 1000,
  });

  if (!failures?.data && !anomalies?.data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {failures?.data?.map((pred: any) => (
        <Card key={pred.assetId} className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Asset Failure Risk
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{pred.assetId}</span>
              <Badge variant={pred.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                {pred.failureProbability}% risk
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Failure in {pred.daysToFailure} days (Confidence: {(pred.confidence * 100).toFixed(0)}%)
            </div>
            <div className="text-xs">{pred.recommendedAction.replace(/_/g, ' ')}</div>
          </CardContent>
        </Card>
      ))}

      {anomalies?.data?.map((anom: any) => (
        <Card key={anom.dmaId} className="border-orange-500/30 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              NRW Anomaly
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{anom.dmaId}</span>
              <Badge className="bg-orange-500/30 text-orange-700">{anom.nrwPercentage}% NRW</Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Loss: ₦{(anom.estimatedLossMc / 1000).toFixed(1)}K m³/day | Cost: ₦{(anom.estimatedCostPerDay / 1000).toFixed(0)}K
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
