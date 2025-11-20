import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Briefcase, Plus, TrendingUp, Calendar, DollarSign } from 'lucide-react';

export function ProjectsHome() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Capital Projects</h1>
          <p className="text-muted-foreground mt-2">
            Infrastructure development and capital investment tracking
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES 45.2M</div>
            <p className="text-xs text-muted-foreground">
              Across all active projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68.4%</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Project milestones
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Module 9: Projects & Capital Planning</CardTitle>
          <CardDescription>
            Comprehensive capital project management and financial tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This module will provide complete infrastructure project lifecycle management including:
          </p>
          <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
            <li>Project registry with status tracking and milestone management</li>
            <li>Budget planning and allocation with Module 11 integration</li>
            <li>Procurement tracking and contract management</li>
            <li>Progress monitoring with financial and physical completion metrics</li>
            <li>Risk management and issue tracking</li>
            <li>Document repository and stakeholder communications</li>
            <li>Geographic project mapping with GIS integration</li>
          </ul>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">Status: Planning Phase</p>
            <p className="text-xs text-muted-foreground mt-1">
              Module 9 integration with Module 11 (Costing) database schema is ready. 
              Frontend pages and API endpoints are scheduled for implementation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
