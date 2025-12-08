import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { ParameterFormDialog } from '@/components/water-quality/ParameterFormDialog';
import { toast } from 'sonner';

export function ParametersPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<any>(undefined);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['water-quality-parameters', page],
    queryFn: async () => {
      return apiClient.get<any>('/water-quality/parameters', { page, per_page: 20 });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/water-quality/parameters/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-quality-parameters'] });
      toast.success('Parameter deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete parameter');
    },
  });

  const handleEdit = (parameter: any) => {
    setEditingParameter(parameter);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this parameter?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingParameter(undefined);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Water Quality Parameters</h2>
          <p className="text-muted-foreground">
            Manage physical, chemical, and biological parameters for water quality testing
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Parameter
        </Button>
      </div>

      <ParameterFormDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        parameter={editingParameter}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading parameters...</span>
        </div>
      ) : data?.data?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No parameters found</p>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Parameter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-280px)] pr-4">
          <div className="grid gap-4 pb-4">
            {data?.data?.map((param: any) => (
              <Card key={param.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{param.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">{param.category || 'physical'}</Badge>
                        <Badge variant="secondary">{param.unit}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(param)}
                        disabled={deleteMutation.isPending}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(param.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">WHO Limit:</span>
                      <p className="font-medium">
                        {param.who_limit ? `${param.who_limit} ${param.unit}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">WASREB Limit:</span>
                      <p className="font-medium">
                        {param.wasreb_limit ? `${param.wasreb_limit} ${param.unit}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Local Limit:</span>
                      <p className="font-medium">
                        {param.local_limit ? `${param.local_limit} ${param.unit}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">LOD:</span>
                      <p className="font-medium">
                        {param.lod ? `${param.lod} ${param.unit}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {data?.meta && data.meta.total > 0 && (
        <div className="flex items-center justify-between border-t pt-4 bg-background sticky bottom-0">
          <p className="text-sm text-muted-foreground">
            Showing {data.meta.from || 1} to {data.meta.to || data.data?.length} of {data.meta.total} parameters
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {page} of {data.meta.last_page || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= (data.meta.last_page || 1)}
              onClick={() => setPage(p => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
