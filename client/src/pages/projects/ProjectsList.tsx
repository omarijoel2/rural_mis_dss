import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Plus, Search, Briefcase, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { projectsService, type Project } from '../../services/projects.service';

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-gray-100 text-gray-800',
  tendering: 'bg-blue-100 text-blue-800',
  execution: 'bg-green-100 text-green-800',
  suspended: 'bg-orange-100 text-orange-800',
  completed: 'bg-purple-100 text-purple-800',
  closed: 'bg-slate-100 text-slate-800',
};

export function ProjectsList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    baseline_budget: '',
    baseline_start_date: '',
    baseline_end_date: '',
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['projects-dashboard'],
    queryFn: () => projectsService.getProjectDashboard(),
  });

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsService.getProjects(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => projectsService.createProject(data),
    onSuccess: () => {
      toast.success('Project created successfully');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-dashboard'] });
      setIsCreateOpen(false);
      setNewProject({ title: '', description: '', baseline_budget: '', baseline_start_date: '', baseline_end_date: '' });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create project'),
  });

  const projects = (projectsData as any) || [];
  const dashboard = dashboardData || { active_projects: 0, total_budget: 0, avg_physical_progress: 0, delayed_projects: 0 };

  const filteredProjects = projects.filter((p: Project) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects Registry</h1>
          <p className="text-muted-foreground">Manage capital projects and track progress</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Title *</label>
                <Input
                  placeholder="e.g., Pipeline Extension Phase 2"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Brief project description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Baseline Budget (KES) *</label>
                <Input
                  type="number"
                  placeholder="15000000"
                  value={newProject.baseline_budget}
                  onChange={(e) => setNewProject({ ...newProject, baseline_budget: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={newProject.baseline_start_date}
                    onChange={(e) => setNewProject({ ...newProject, baseline_start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={newProject.baseline_end_date}
                    onChange={(e) => setNewProject({ ...newProject, baseline_end_date: e.target.value })}
                  />
                </div>
              </div>
              <Button
                onClick={() => createMutation.mutate({
                  title: newProject.title,
                  description: newProject.description,
                  baseline_budget: parseInt(newProject.baseline_budget),
                  baseline_start_date: newProject.baseline_start_date,
                  baseline_end_date: newProject.baseline_end_date,
                })}
                disabled={!newProject.title || !newProject.baseline_budget || createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.active_projects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KES {(dashboard.total_budget / 1000000).toFixed(1)}M</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Physical Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.avg_physical_progress}%</div>
            <Progress value={dashboard.avg_physical_progress} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" /> Delayed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{dashboard.delayed_projects}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Projects</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading projects...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Physical %</TableHead>
                  <TableHead>Financial %</TableHead>
                  <TableHead>Timeline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No projects found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project: Project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-mono text-sm">{project.code}</TableCell>
                      <TableCell className="font-medium max-w-xs truncate">{project.title}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[project.status]}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>KES {(project.baseline_budget / 1000000).toFixed(1)}M</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={project.physical_progress} className="w-16 h-2" />
                          <span className="text-sm">{project.physical_progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={project.financial_progress} className="w-16 h-2" />
                          <span className="text-sm">{project.financial_progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {project.baseline_start_date} → {project.baseline_end_date}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
