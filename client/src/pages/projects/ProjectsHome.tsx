import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Briefcase, Plus, TrendingUp, Calendar, DollarSign, Map, Database, Package, ArrowRight } from 'lucide-react';
import { projectsService } from '../../services/projects.service';

export function ProjectsHome() {
  const { data: dashboardData } = useQuery({
    queryKey: ['projects-dashboard'],
    queryFn: () => projectsService.getProjectDashboard(),
  });

  const dashboard = dashboardData || {
    active_projects: 0,
    total_budget: 0,
    avg_physical_progress: 0,
    delayed_projects: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Capital Projects</h1>
          <p className="text-muted-foreground mt-2">
            Infrastructure development and capital investment tracking
          </p>
        </div>
        <Link to="/projects/list">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.active_projects}</div>
            <p className="text-xs text-muted-foreground">
              In execution phase
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {(dashboard.total_budget / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              Across all active projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.avg_physical_progress}%</div>
            <p className="text-xs text-muted-foreground">
              Physical completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{dashboard.delayed_projects}</div>
            <p className="text-xs text-muted-foreground">
              Behind schedule
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Projects Registry
            </CardTitle>
            <CardDescription>
              Manage capital projects with progress tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/projects/list">
              <Button variant="outline" className="w-full gap-2">
                View Projects <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Investment Pipelines
            </CardTitle>
            <CardDescription>
              Prioritize and appraise capital investments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/projects/pipelines">
              <Button variant="outline" className="w-full gap-2">
                View Pipelines <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Land Administration
            </CardTitle>
            <CardDescription>
              Parcels, wayleaves, and compensation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/projects/land">
              <Button variant="outline" className="w-full gap-2">
                View Land <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Hydraulic Models
            </CardTitle>
            <CardDescription>
              EPANET/InfoWater model library
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/projects/models">
              <Button variant="outline" className="w-full gap-2">
                View Models <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Asset Handover
            </CardTitle>
            <CardDescription>
              Capitalization and warranty tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/projects/handover">
              <Button variant="outline" className="w-full gap-2">
                View Handovers <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
