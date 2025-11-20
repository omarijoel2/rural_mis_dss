import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Gauge, TrendingUp, TrendingDown } from 'lucide-react';

export function KPIDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">KPI Dashboard</h1>
        <p className="text-muted-foreground mt-1">WHO/JMP & WASREB aligned performance indicators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Coverage</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.3% from last quarter
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NRW %</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32.8%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -4.2% improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Efficiency</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2</div>
            <p className="text-xs text-muted-foreground">Connections per staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Efficiency</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91.2%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +1.5%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KPI Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">KPI management and data entry coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
