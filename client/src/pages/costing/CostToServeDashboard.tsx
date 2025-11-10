import { useState } from 'react';
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
import { TrendingUp, TrendingDown, Droplet, DollarSign } from 'lucide-react';

export function CostToServeDashboard() {
  const [period, setPeriod] = useState('2025-01');

  const dmaLeague = [
    { rank: 1, dma: 'DMA-001 Central Zone', volume_m3: 125000, total_cost: 18750, cost_per_m3: 0.15, trend: 'down' },
    { rank: 2, dma: 'DMA-003 Industrial Park', volume_m3: 98000, total_cost: 15680, cost_per_m3: 0.16, trend: 'up' },
    { rank: 3, dma: 'DMA-002 Residential North', volume_m3: 85000, total_cost: 14450, cost_per_m3: 0.17, trend: 'down' },
    { rank: 4, dma: 'DMA-005 Rural East', volume_m3: 45000, total_cost: 9450, cost_per_m3: 0.21, trend: 'up' },
    { rank: 5, dma: 'DMA-004 Commercial District', volume_m3: 52000, total_cost: 11960, cost_per_m3: 0.23, trend: 'up' },
  ];

  const classMetrics = [
    { class: 'Residential', connections: 12450, volume_m3: 285000, revenue: 142500, cost: 48450, margin: 66 },
    { class: 'Commercial', connections: 1280, volume_m3: 156000, revenue: 124800, cost: 26520, margin: 79 },
    { class: 'Industrial', connections: 45, volume_m3: 98000, revenue: 147000, cost: 15680, margin: 89 },
    { class: 'Government', connections: 180, volume_m3: 25000, revenue: 12500, cost: 5250, margin: 58 },
  ];

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

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Droplet className="h-4 w-4" />
            Total Volume
          </div>
          <div className="text-3xl font-bold mt-2">405K m³</div>
          <p className="text-xs text-muted-foreground mt-1">+2.3% from last month</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            Total Cost
          </div>
          <div className="text-3xl font-bold mt-2">$70.3K</div>
          <p className="text-xs text-muted-foreground mt-1">-1.2% from last month</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingDown className="h-4 w-4 text-green-600" />
            Avg Cost/m³
          </div>
          <div className="text-3xl font-bold mt-2">$0.17</div>
          <p className="text-xs text-green-600 mt-1">-3.1% improvement</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Avg Margin
          </div>
          <div className="text-3xl font-bold mt-2">73%</div>
          <p className="text-xs text-muted-foreground mt-1">Across all classes</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">DMA Cost-to-Serve League Table</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>DMA</TableHead>
              <TableHead className="text-right">Volume (m³)</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
              <TableHead className="text-right">Cost per m³</TableHead>
              <TableHead>Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dmaLeague.map((dma) => (
              <TableRow key={dma.rank}>
                <TableCell>{getRankBadge(dma.rank)}</TableCell>
                <TableCell className="font-medium">{dma.dma}</TableCell>
                <TableCell className="text-right font-mono">{dma.volume_m3.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">${dma.total_cost.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono font-bold">${dma.cost_per_m3.toFixed(2)}</TableCell>
                <TableCell>
                  {dma.trend === 'down' ? (
                    <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                      <TrendingDown className="h-3 w-3" />
                      Improving
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-orange-600 border-orange-600">
                      <TrendingUp className="h-3 w-3" />
                      Rising
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Customer Class Profitability</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Class</TableHead>
              <TableHead className="text-right">Connections</TableHead>
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
                <TableCell className="text-right font-mono">{cls.connections.toLocaleString()}</TableCell>
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
      </Card>
    </div>
  );
}
