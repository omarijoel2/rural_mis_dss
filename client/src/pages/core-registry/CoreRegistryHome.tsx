import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Droplets, Gauge, Settings, Plus } from 'lucide-react';

export function CoreRegistryHome() {
  const { data: stats } = useQuery({
    queryKey: ['registry-stats'],
    queryFn: async () => ({
      schemes: 2,
      assets: 3,
      dmas: 2,
      meters: 2,
    }),
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Core Registry</h1>
          <p className="text-muted-foreground">Phase 1-2: Water Infrastructure Foundation</p>
        </div>

        <div className="flex gap-2">
          <RequirePerm permission="create dmas">
            <Button asChild>
              <Link to="/core/dmas">
                <Plus className="mr-2 h-4 w-4" />New DMA
              </Link>
            </Button>
          </RequirePerm>

          <RequirePerm permission="create zones">
            <Button asChild>
              <Link to="/core/zones">
                <Plus className="mr-2 h-4 w-4" />New Zone
              </Link>
            </Button>
          </RequirePerm>

          <RequirePerm permission="create pipelines">
            <Button asChild>
              <Link to="/core/pipelines">
                <Plus className="mr-2 h-4 w-4" />New Pipeline
              </Link>
            </Button>
          </RequirePerm>

          <RequirePerm permission="create meters">
            <Button asChild>
              <Link to="/core/meters">
                <Plus className="mr-2 h-4 w-4" />New Meter
              </Link>
            </Button>
          </RequirePerm>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Schemes</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.schemes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DMAs</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.dmas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets</CardTitle>
            <Settings className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.assets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meters</CardTitle>
            <Gauge className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.meters}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
