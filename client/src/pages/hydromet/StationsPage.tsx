import { useState } from 'react';
import { useHydrometStations, useDeleteStation, useActivateStation, useDeactivateStation } from '../../hooks/useHydromet';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Search, Plus, MoreVertical, MapPin, Radio, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { StationFormDialog } from '../../components/hydromet/StationFormDialog';
import { SensorManagementDialog } from '../../components/hydromet/SensorManagementDialog';
import type { HydrometStation } from '../../services/hydromet.service';

export function StationsPage() {
  const [search, setSearch] = useState('');
  const [selectedStation, setSelectedStation] = useState<HydrometStation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [sensorManagementStation, setSensorManagementStation] = useState<HydrometStation | null>(null);

  const { data: stationsData, isLoading } = useHydrometStations({ search, per_page: 100 });
  const deleteMutation = useDeleteStation();
  const activateMutation = useActivateStation();
  const deactivateMutation = useDeactivateStation();

  const stations = stationsData?.data || [];

  const handleCreate = () => {
    setSelectedStation(null);
    setIsCreating(true);
    setIsFormOpen(true);
  };

  const handleEdit = (station: HydrometStation) => {
    setSelectedStation(station);
    setIsCreating(false);
    setIsFormOpen(true);
  };

  const handleDelete = async (station: HydrometStation) => {
    if (!window.confirm(`Are you sure you want to delete station "${station.name}"?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(station.id);
      toast.success('Station deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete station');
    }
  };

  const handleActivate = async (station: HydrometStation) => {
    try {
      await activateMutation.mutateAsync(station.id);
      toast.success('Station activated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate station');
    }
  };

  const handleDeactivate = async (station: HydrometStation) => {
    try {
      await deactivateMutation.mutateAsync(station.id);
      toast.success('Station deactivated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to deactivate station');
    }
  };

  const handleManageSensors = (station: HydrometStation) => {
    setSensorManagementStation(station);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedStation(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hydro-Met Stations Registry</h1>
          <p className="text-muted-foreground">Manage monitoring stations and sensor networks</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Station
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stations by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading stations...</p>
          ) : stations.length === 0 ? (
            <div className="text-center py-12">
              <Radio className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No stations found</p>
              <Button onClick={handleCreate} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add your first station
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Elevation (m)</TableHead>
                  <TableHead>Sensors</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stations.map((station) => (
                  <TableRow key={station.id}>
                    <TableCell className="font-medium">{station.code}</TableCell>
                    <TableCell>{station.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{station.station_type?.name || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={station.active ? 'default' : 'secondary'}>
                        {station.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {station.elevation_m?.toFixed(1) || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleManageSensors(station)}
                      >
                        {station.sensors?.length || 0} sensors
                      </Button>
                    </TableCell>
                    <TableCell>
                      {station.location ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {station.location.coordinates[1].toFixed(4)}, {station.location.coordinates[0].toFixed(4)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(station)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleManageSensors(station)}>
                            <Radio className="mr-2 h-4 w-4" />
                            Manage Sensors
                          </DropdownMenuItem>
                          {station.active ? (
                            <DropdownMenuItem onClick={() => handleDeactivate(station)}>
                              <PowerOff className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleActivate(station)}>
                              <Power className="mr-2 h-4 w-4" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(station)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <StationFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        station={selectedStation}
        isCreating={isCreating}
      />

      <SensorManagementDialog
        station={sensorManagementStation}
        onClose={() => setSensorManagementStation(null)}
      />
    </div>
  );
}
