import { useState } from 'react';
import { useHydrometSources, useDeleteSource } from '../../hooks/useHydromet';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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
import { Search, Plus, MoreVertical, MapPin, Droplets, Edit, Trash2, Map as MapIcon } from 'lucide-react';
import { toast } from 'sonner';
import { SourceFormDialog } from '../../components/hydromet/SourceFormDialog';
import { HydrometMap } from '../../components/hydromet/HydrometMap';
import type { Source } from '../../services/hydromet.service';

export function SourcesPage() {
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showMap, setShowMap] = useState(true);

  const { data: sourcesData, isLoading } = useHydrometSources({ search, per_page: 100 });
  const deleteMutation = useDeleteSource();

  const sources = sourcesData?.data || [];

  const handleCreate = () => {
    setSelectedSource(null);
    setIsCreating(true);
    setIsFormOpen(true);
  };

  const handleEdit = (source: Source) => {
    setSelectedSource(source);
    setIsCreating(false);
    setIsFormOpen(true);
  };

  const handleDelete = async (source: Source) => {
    if (!window.confirm(`Are you sure you want to delete source "${source.name}"?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(source.id);
      toast.success('Source deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete source');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedSource(null);
    setIsCreating(false);
  };

  const getStatusBadgeVariant = (status?: { name: string }) => {
    if (!status) return 'secondary';
    switch (status.name.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'abandoned':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getRiskBadgeVariant = (risk?: { name: string }) => {
    if (!risk) return 'secondary';
    switch (risk.name.toLowerCase()) {
      case 'low':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'high':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Water Sources Registry</h1>
          <p className="text-muted-foreground">Manage water sources and abstraction points</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Source
        </Button>
      </div>

      {showMap && sources.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sources Map</CardTitle>
          </CardHeader>
          <CardContent>
            <HydrometMap
              sources={sources}
              selectedId={selectedSource?.id}
              onSelect={(id) => {
                const source = sources.find(s => s.id === id);
                if (source) setSelectedSource(source);
              }}
              height="400px"
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sources by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMap(!showMap)}
            >
              <MapIcon className="mr-2 h-4 w-4" />
              {showMap ? 'Hide' : 'Show'} Map
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading sources...</p>
          ) : sources.length === 0 ? (
            <div className="text-center py-12">
              <Droplets className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No sources found</p>
              <Button onClick={handleCreate} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add your first source
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
                  <TableHead>Catchment</TableHead>
                  <TableHead>Capacity (m³/day)</TableHead>
                  <TableHead>Quality Risk</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="font-medium">{source.code}</TableCell>
                    <TableCell>{source.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{source.kind?.name || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(source.status)}>
                        {source.status?.name || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {source.catchment || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {source.capacity_m3_per_day?.toLocaleString() || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {source.quality_risk ? (
                        <Badge variant={getRiskBadgeVariant(source.quality_risk)}>
                          {source.quality_risk.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {source.location ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {source.location.coordinates[1].toFixed(4)}, {source.location.coordinates[0].toFixed(4)}
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
                          <DropdownMenuItem onClick={() => handleEdit(source)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(source)}
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

      <SourceFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        source={selectedSource}
        isCreating={isCreating}
      />
    </div>
  );
}
