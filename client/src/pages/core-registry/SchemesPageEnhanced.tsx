import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { schemesAPI } from '@/lib/api';
import { SchemeForm } from '@/components/forms/SchemeForm';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function SchemesPageEnhanced() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [deletedSuccess, setDeletedSuccess] = useState<string | null>(null);

  const { data: schemes, isLoading, refetch } = useQuery({
    queryKey: ['schemes', page],
    queryFn: async () => {
      const laravel = await schemesAPI.list({ page, per_page: perPage });
      if (laravel) return laravel;
      return { data: [] };
    },
  });

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setServerErrors({});
    try {
      // Ensure code is uppercase to satisfy server regex
      if (data.code) data.code = String(data.code).toUpperCase();

      if (editingId) {
        const result = await schemesAPI.update(editingId, data);
        if (result) {
          toast.success('Record updated successfully');
        } else {
          throw new Error('Failed to update scheme');
        }
      } else {
        const result = await schemesAPI.create(data);
        if (result) {
          toast.success('Record created successfully');
        } else {
          throw new Error('Failed to create scheme');
        }
      }
      setIsCreating(false);
      setEditingId(null);
      refetch();
    } catch (error: any) {
      // Try to show more helpful server error details when available
      const msg = error?.message || 'Error saving scheme';
      toast.error(msg);

      // If validation errors are present, map them to the form
      if (error?.payload?.errors) {
        setServerErrors(error.payload.errors);
        const firstField = Object.keys(error.payload.errors)[0];
        // Scroll to first field if present
        setTimeout(() => {
          const el = document.querySelector(`[name="${firstField}"]`);
          if (el && (el as HTMLElement).scrollIntoView) {
            (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
            (el as any).focus?.();
          }
        }, 200);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const result = await schemesAPI.delete(deleteId);
      if (result !== undefined || result === null) {
        // Treat null (204 No Content) and payloads as success
        setDeletedSuccess(schemeToDelete?.name || 'Scheme');
        toast.success('Record deleted successfully');
        refetch();
      } else {
        throw new Error('Failed to delete scheme');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error deleting scheme');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
  };

  const schemeToDelete = schemes?.data?.find((s: any) => s.id === deleteId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Water Schemes Registry</h1>
          <p className="text-muted-foreground">Manage water supply schemes and infrastructure</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Scheme
        </Button>
      </div>

      {(isCreating || editingId) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingId ? 'Edit Scheme' : 'Create New Scheme'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <SchemeForm
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
              externalErrors={serverErrors}
              defaultValues={
                editingId && schemes?.data
                  ? schemes.data.find((s: any) => s.id === editingId)
                  : undefined
              }
            />
          </CardContent>
        </Card>
      )}

      {/** Pagination controls **/}
      <div className="flex items-center justify-center gap-4 mt-4">
        <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
        <div className="text-sm text-muted-foreground">Page {page}</div>
        <Button
          onClick={() => setPage((p) => p + 1)}
          disabled={schemes?.meta ? page >= schemes.meta.last_page : (schemes?.data?.length || 0) < perPage}
        >
          Next
        </Button>
      </div>
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading schemes...</div>
      ) : (
        <div className="max-h-[60vh] overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemes?.data?.map((scheme: any) => (
              <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{scheme.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingId(scheme.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(scheme.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm"><span className="font-semibold">Code:</span> {scheme.code}</div>
                <div className="text-sm"><span className="font-semibold">Type:</span> {scheme.type}</div>
                <div className="text-sm">
                  <span className="font-semibold">Status:</span>{' '}
                  <Badge className={scheme.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                    {scheme.status || 'pending'}
                  </Badge>
                </div>
                <div className="text-sm"><span className="font-semibold">County:</span> {scheme.county}</div>
                <div className="text-sm"><span className="font-semibold">Pop. Served:</span> {scheme.population_estimate ? scheme.population_estimate.toLocaleString() : '-'}</div>
                <div className="text-sm"><span className="font-semibold">Connections:</span> {scheme.connections?.toLocaleString() || '-'}</div>
              </CardContent>
            </Card>
          ))}
          {schemes?.data?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No schemes found. Click "New Scheme" to create one.
            </div>
          )}
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scheme</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{schemeToDelete?.name}"? This action cannot be undone.
              All associated assets, DMAs, and connections may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success popup for delete */}
      <AlertDialog open={!!deletedSuccess} onOpenChange={(open) => !open && setDeletedSuccess(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deleted</AlertDialogTitle>
            <AlertDialogDescription>
              {deletedSuccess ? `"${deletedSuccess}" was deleted successfully.` : 'Item deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setDeletedSuccess(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
