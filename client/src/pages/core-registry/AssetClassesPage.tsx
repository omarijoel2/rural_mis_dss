import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Layers, Info } from 'lucide-react';
import { toast } from 'sonner';

interface AssetClass {
  id: number;
  code: string;
  name: string;
  parent_id: number | null;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  attributes_schema: string | null;
  assets_count?: number;
  created_at: string;
  updated_at: string;
}

interface AssetClassFormData {
  code: string;
  name: string;
  parent_id: number | null;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  attributes_schema: Record<string, string>;
}

const CRITICALITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
];

const ATTRIBUTE_TYPES = ['string', 'number', 'boolean', 'date'];

export function AssetClassesPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role_names?.includes('Super Admin') ?? false;
  
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<AssetClass | null>(null);
  const [deletingClass, setDeletingClass] = useState<AssetClass | null>(null);
  const [formData, setFormData] = useState<AssetClassFormData>({
    code: '',
    name: '',
    parent_id: null,
    criticality: 'medium',
    attributes_schema: {},
  });
  const [newAttributeKey, setNewAttributeKey] = useState('');
  const [newAttributeType, setNewAttributeType] = useState('string');

  const queryClient = useQueryClient();

  const { data: classes, isLoading, error } = useQuery({
    queryKey: ['asset-classes', search],
    queryFn: () => apiClient.get<AssetClass[]>('/api/asset-classes', search ? { search } : {}),
  });

  const createMutation = useMutation({
    mutationFn: (data: AssetClassFormData) => apiClient.post<AssetClass>('/api/asset-classes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-classes'] });
      toast.success('Record created successfully');
      handleCloseDialog();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create asset class');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AssetClassFormData> }) =>
      apiClient.put<AssetClass>(`/api/asset-classes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-classes'] });
      toast.success('Record updated successfully');
      handleCloseDialog();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update asset class');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/asset-classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-classes'] });
      toast.success('Record deleted successfully');
      setDeleteDialogOpen(false);
      setDeletingClass(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete asset class');
    },
  });

  const handleOpenDialog = (assetClass?: AssetClass) => {
    if (assetClass) {
      setEditingClass(assetClass);
      let schema: Record<string, string> = {};
      if (assetClass.attributes_schema) {
        try {
          schema = typeof assetClass.attributes_schema === 'string' 
            ? JSON.parse(assetClass.attributes_schema) 
            : assetClass.attributes_schema;
        } catch {
          schema = {};
        }
      }
      setFormData({
        code: assetClass.code,
        name: assetClass.name,
        parent_id: assetClass.parent_id,
        criticality: assetClass.criticality,
        attributes_schema: schema,
      });
    } else {
      setEditingClass(null);
      setFormData({
        code: '',
        name: '',
        parent_id: null,
        criticality: 'medium',
        attributes_schema: {},
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingClass(null);
    setFormData({
      code: '',
      name: '',
      parent_id: null,
      criticality: 'medium',
      attributes_schema: {},
    });
    setNewAttributeKey('');
    setNewAttributeType('string');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      updateMutation.mutate({ id: editingClass.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleAddAttribute = () => {
    if (newAttributeKey && !formData.attributes_schema[newAttributeKey]) {
      setFormData({
        ...formData,
        attributes_schema: {
          ...formData.attributes_schema,
          [newAttributeKey]: newAttributeType,
        },
      });
      setNewAttributeKey('');
      setNewAttributeType('string');
    }
  };

  const handleRemoveAttribute = (key: string) => {
    const { [key]: _, ...rest } = formData.attributes_schema;
    setFormData({ ...formData, attributes_schema: rest });
  };

  const handleDeleteClick = (assetClass: AssetClass) => {
    setDeletingClass(assetClass);
    setDeleteDialogOpen(true);
  };

  const getCriticalityBadge = (criticality: string) => {
    const option = CRITICALITY_OPTIONS.find(o => o.value === criticality);
    return (
      <Badge className={option?.color || 'bg-gray-100 text-gray-800'}>
        {option?.label || criticality}
      </Badge>
    );
  };

  const getParentName = (parentId: number | null) => {
    if (!parentId || !classes) return '-';
    const parent = classes.find(c => c.id === parentId);
    return parent?.name || '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Asset Classes</h1>
          <p className="text-muted-foreground">Define and manage asset classification hierarchy</p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Asset Class
          </Button>
        )}
      </div>

      {!isSuperAdmin && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Asset classes are shared configuration across all counties. Only Super Admins can create, edit, or delete asset classes.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by code or name..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-lg text-muted-foreground">Loading asset classes...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-lg text-destructive">Error loading asset classes</p>
            </div>
          ) : !classes?.length ? (
            <div className="text-center py-12">
              <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No asset classes found</h3>
              <p className="mt-2 text-muted-foreground">
                {isSuperAdmin 
                  ? 'Create your first asset class to start categorizing assets.'
                  : 'No asset classes have been configured yet. Please contact a Super Admin.'}
              </p>
              {isSuperAdmin && (
                <Button className="mt-4" onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Asset Class
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Criticality</TableHead>
                  <TableHead>Attributes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((assetClass) => {
                  let attrCount = 0;
                  if (assetClass.attributes_schema) {
                    try {
                      const schema = typeof assetClass.attributes_schema === 'string'
                        ? JSON.parse(assetClass.attributes_schema)
                        : assetClass.attributes_schema;
                      attrCount = Object.keys(schema).length;
                    } catch {
                      attrCount = 0;
                    }
                  }
                  return (
                    <TableRow key={assetClass.id}>
                      <TableCell className="font-mono font-medium">{assetClass.code}</TableCell>
                      <TableCell>{assetClass.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {getParentName(assetClass.parent_id)}
                      </TableCell>
                      <TableCell>{getCriticalityBadge(assetClass.criticality)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{attrCount} attributes</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isSuperAdmin ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(assetClass)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(assetClass)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">View only</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingClass ? 'Edit Asset Class' : 'Create Asset Class'}
            </DialogTitle>
            <DialogDescription>
              {editingClass
                ? 'Update the asset class details below.'
                : 'Define a new asset class for categorizing assets.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    placeholder="e.g., PUMP, VALVE"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Pumps, Valves"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parent">Parent Class (Optional)</Label>
                  <Select
                    value={formData.parent_id?.toString() || 'none'}
                    onValueChange={(v) => setFormData({ ...formData, parent_id: v === 'none' ? null : Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No parent</SelectItem>
                      {classes?.filter(c => c.id !== editingClass?.id).map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="criticality">Criticality</Label>
                  <Select
                    value={formData.criticality}
                    onValueChange={(v) => setFormData({ ...formData, criticality: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CRITICALITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Custom Attributes Schema</Label>
                <Card className="p-4">
                  <div className="space-y-3">
                    {Object.entries(formData.attributes_schema).map(([key, type]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex-1 justify-start">
                          <span className="font-mono">{key}</span>
                          <span className="ml-2 text-muted-foreground">({type})</span>
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveAttribute(key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <div className="flex gap-2 pt-2 border-t">
                      <Input
                        placeholder="Attribute name (e.g., rated_power_kw)"
                        value={newAttributeKey}
                        onChange={(e) => setNewAttributeKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                        className="flex-1"
                      />
                      <Select value={newAttributeType} onValueChange={setNewAttributeType}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ATTRIBUTE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddAttribute}
                        disabled={!newAttributeKey}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </Card>
                <p className="text-xs text-muted-foreground">
                  Define custom attributes that assets of this class should have.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingClass
                  ? 'Update'
                  : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingClass?.name}"? This action cannot be undone.
              {deletingClass?.assets_count && deletingClass.assets_count > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Warning: This class has {deletingClass.assets_count} assets assigned to it.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingClass && deleteMutation.mutate(deletingClass.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
