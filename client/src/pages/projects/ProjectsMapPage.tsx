import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { MapPin, Layers, Filter, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api-client';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const STATUS_COLORS: Record<string, string> = {
  planning: '#6B7280',
  tendering: '#3B82F6',
  execution: '#22C55E',
  suspended: '#F97316',
  completed: '#8B5CF6',
  closed: '#64748B',
};

const STATUS_BADGES: Record<string, string> = {
  planning: 'bg-gray-100 text-gray-800',
  tendering: 'bg-blue-100 text-blue-800',
  execution: 'bg-green-100 text-green-800',
  suspended: 'bg-orange-100 text-orange-800',
  completed: 'bg-purple-100 text-purple-800',
  closed: 'bg-slate-100 text-slate-800',
};

export function ProjectsMapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data: projectsWithLocations, isLoading } = useQuery({
    queryKey: ['projects-map'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: any[] }>('/projects/map/all');
      return response.data;
    },
  });

  const projects = projectsWithLocations || [];

  const filteredProjects = projects.filter((p: any) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current!,
        style: 'https://demotiles.maplibre.org/style.json',
        center: [37.0, -1.0],
        zoom: 6,
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoaded(true);
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded || !projects.length) return;

    const existingMarkers = document.querySelectorAll('.maplibregl-marker');
    existingMarkers.forEach(marker => marker.remove());

    projects.forEach((project: any) => {
      if (project.locations && project.locations.length > 0) {
        project.locations.forEach((location: any) => {
          const el = document.createElement('div');
          el.className = 'project-marker';
          el.style.cssText = `
            width: 24px;
            height: 24px;
            background-color: ${STATUS_COLORS[project.status] || '#6B7280'};
            border: 3px solid white;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          `;

          el.addEventListener('click', () => {
            setSelectedProject(project);
          });

          new maplibregl.Marker({ element: el })
            .setLngLat([location.lng, location.lat])
            .addTo(map.current);
        });
      }
    });
  }, [projects, mapLoaded]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
  };

  const flyToProject = (project: any) => {
    if (project.locations && project.locations.length > 0 && map.current) {
      const location = project.locations[0];
      map.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 12,
        duration: 1500,
      });
      setSelectedProject(project);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects Map</h1>
          <p className="text-muted-foreground">Geographic view of capital projects and infrastructure</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Layers className="h-4 w-4 mr-2" />
            Layers
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div ref={mapContainer} className="h-[600px] w-full" />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Project List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="tendering">Tendering</SelectItem>
                  <SelectItem value="execution">Execution</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="max-h-[400px] overflow-auto">
            <CardContent className="pt-4 space-y-2">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-4">Loading projects...</p>
              ) : filteredProjects.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No projects with locations</p>
              ) : (
                filteredProjects.map((project: any) => (
                  <div
                    key={project.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedProject?.id === project.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => flyToProject(project)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <MapPin
                          className="h-4 w-4 mt-1"
                          style={{ color: STATUS_COLORS[project.status] }}
                        />
                        <div>
                          <p className="font-medium text-sm">{project.title}</p>
                          <p className="text-xs text-muted-foreground">{project.code}</p>
                        </div>
                      </div>
                      <Badge className={`${STATUS_BADGES[project.status]} text-xs`}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {selectedProject && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Selected Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{selectedProject.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedProject.code}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={STATUS_BADGES[selectedProject.status]}>{selectedProject.status}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-medium">{formatCurrency(selectedProject.baseline_budget)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{selectedProject.physical_progress}%</span>
                </div>
                {selectedProject.locations && selectedProject.locations.length > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Locations:</span>
                    <ul className="mt-1 space-y-1">
                      {selectedProject.locations.map((loc: any, idx: number) => (
                        <li key={idx} className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{loc.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Link to={`/projects/${selectedProject.id}`}>
                  <Button className="w-full mt-2" size="sm">
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Map Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm capitalize">{status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
