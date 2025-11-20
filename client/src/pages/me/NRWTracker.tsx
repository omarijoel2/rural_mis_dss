import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Droplet, TrendingDown, DollarSign } from 'lucide-react';

export function NRWTracker() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">NRW Program Tracker</h1>
        <p className="text-muted-foreground mt-1">Non-Revenue Water initiatives and savings tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current NRW %</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32.8%</div>
            <p className="text-xs text-muted-foreground">Down from 37% baseline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Saved</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,850 m³/day</div>
            <p className="text-xs text-muted-foreground">Cumulative savings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investment ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">185%</div>
            <p className="text-xs text-muted-foreground">Payback in 8 months</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Initiatives</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">NRW initiative tracking and management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
