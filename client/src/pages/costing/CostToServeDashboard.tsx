import { useState, useMemo } from 'react';
import { Card } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { TrendingUp, TrendingDown, Droplet, DollarSign, Loader2 } from 'lucide-react';
import { useDmaLeague, useCostToServeSummary, useCostToServeMetrics } from '../../hooks/useCosting';

export function CostToServeDashboard() {
  const [period, setPeriod] = useState('2025-01');

  const { data: dmaData, isLoading: dmaLoading, error: dmaError } = useDmaLeague(period);
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useCostToServeSummary({ period_from: period, period_to: period });
  const { data: metricsData, isLoading: metricsLoading } = useCostToServeMetrics({ period_from: period, period_to: period });

  const dmaLeague = dmaData?.data || [];
  const summary = summaryData?.data;
  const metrics = metricsData?.data || [];

  const totalCost = useMemo(() => {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => {
      return sum + (m.opex_cost || 0) + (m.capex_depr || 0) + (m.energy_cost || 0) + (m.chemical_cost || 0) + (m.other_cost || 0);
    }, 0);
  }, [metrics]);

  const classMetrics = useMemo(() => {
    const classSummary: Record<string, { class: string; connections: number; volume_m3: number; revenue: number; cost: number; margin: number }> = {};
    
    metrics.forEach(m => {
      const cls = m.class || 'Unclassified';
      if (!classSummary[cls]) {
        classSummary[cls] = { class: cls, connections: 0, volume_m3: 0, revenue: 0, cost: 0, margin: 0 };
      }
      classSummary[cls].volume_m3 += m.production_m3 || 0;
      const revenue = (m.revenue_per_m3 || 0) * (m.billed_m3 || 0);
      const cost = (m.opex_cost || 0) + (m.capex_depr || 0) + (m.energy_cost || 0) + (m.chemical_cost || 0) + (m.other_cost || 0);
      classSummary[cls].revenue += revenue;
      classSummary[cls].cost += cost;
    });

    return Object.values(classSummary).map(c => ({
      ...c,
      margin: c.revenue > 0 ? Math.round(((c.revenue - c.cost) / c.revenue) * 100) : 0
    }));
  }, [metrics]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge variant="default" className="bg-green-600">🥇 Best</Badge>;
    if (rank <= 3) return <Badge variant="outline">#{rank}</Badge>;
    return <Badge variant="secondary">#{rank}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cost-to-Serve Analytics</h1>
          <p className="text-muted-foreground mt-1">
            DMA profitability, customer class analysis, and cost trends
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border rounded-md bg-background"
        >
          <option value="2025-01">January 2025</option>
          <option value="2024-12">December 2024</option>
          <option value="2024-11">November 2024</option>
        </select>
      </div>

      {summaryError && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4">
          Error loading summary: {summaryError instanceof Error ? summaryError.message : 'Unknown error'}
        </div>
      )}

      {summaryLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : summary ? (
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Droplet className="h-4 w-4" />
              Total Volume
            </div>
            <div className="text-3xl font-bold mt-2">
              {`${(summary.total_production_m3 / 1000).toFixed(0)}K m³`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Produced this period</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Total Cost
            </div>
            <div className="text-3xl font-bold mt-2">
              ${(totalCost / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground mt-1">All cost categories</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-green-600" />
              Avg Cost/m³
            </div>
            <div className="text-3xl font-bold mt-2">
              ${summary.avg_cost_per_m3.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Blended rate</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Non-Revenue Water
            </div>
            <div className="text-3xl font-bold mt-2">
              {summary.nrw_percentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">System losses</p>
          </Card>
        </div>
      ) : null}

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">DMA Cost-to-Serve League Table</h3>
        {dmaError && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4">
            Error loading DMA data: {dmaError instanceof Error ? dmaError.message : 'Unknown error'}
          </div>
        )}
        {dmaLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : dmaLeague.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No DMA data available for {period}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>DMA</TableHead>
                <TableHead className="text-right">Volume (m³)</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead className="text-right">Cost per m³</TableHead>
                <TableHead>Efficiency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dmaLeague.map((dma, index) => (
                <TableRow key={dma.dma_id || index}>
                  <TableCell>{getRankBadge(index + 1)}</TableCell>
                  <TableCell className="font-medium">DMA-{dma.dma_id}</TableCell>
                  <TableCell className="text-right font-mono">{(dma.production_m3 || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">
                    ${((dma.cost_per_m3 || 0) * (dma.production_m3 || 0)).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">${(dma.cost_per_m3 || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {(dma.cost_per_m3 || 0) < 0.20 ? 'Excellent' : (dma.cost_per_m3 || 0) < 0.30 ? 'Good' : 'Review'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Customer Class Profitability</h3>
        {metricsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : classMetrics.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No customer class data available for {period}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Class</TableHead>
                <TableHead className="text-right">Volume (m³)</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Margin %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classMetrics.map((cls) => (
                <TableRow key={cls.class}>
                  <TableCell className="font-medium">{cls.class}</TableCell>
                  <TableCell className="text-right font-mono">{cls.volume_m3.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">${cls.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">${cls.cost.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={cls.margin >= 70 ? 'default' : cls.margin >= 60 ? 'outline' : 'secondary'}>
                      {cls.margin}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
