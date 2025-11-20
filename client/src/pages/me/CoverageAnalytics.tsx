import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Globe, Users, Droplet } from 'lucide-react';

export function CoverageAnalytics() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Coverage & Equity Analytics</h1>
        <p className="text-muted-foreground mt-1">Water and sanitation coverage by area and demographic</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Population</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245,800</div>
            <p className="text-xs text-muted-foreground">Across all wards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Population Served</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">193,100</div>
            <p className="text-xs text-muted-foreground">With piped connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage Rate</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5%</div>
            <p className="text-xs text-muted-foreground">Overall water coverage</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coverage by Ward</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Ward-level coverage breakdown and maps coming soon...</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equity Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Gender and income quintile disaggregation coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
