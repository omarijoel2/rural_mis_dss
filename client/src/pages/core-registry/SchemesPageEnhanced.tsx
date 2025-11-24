import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit2 } from 'lucide-react';
import { schemesAPI } from '@/lib/api';
import { SchemeForm } from '@/components/forms/SchemeForm';

export function SchemesPageEnhanced() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: schemes, isLoading, refetch } = useQuery({
    queryKey: ['schemes'],
    queryFn: async () => {
      const laravel = await schemesAPI.list();
      if (laravel) return laravel;
      // Fallback to mock - Single county per tenant (Multi-tenancy: Tenant can only see schemes from their assigned county)
      return {
        data: [
          { id: 1, code: 'TRK_LOD_001', name: 'Lodwar Water Supply Scheme', type: 'piped', status: 'active', county: 'Turkana', populationServed: 28000, connections: 5600 },
        ],
      };
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      if (editingId) {
        await schemesAPI.update(editingId, data);
      } else {
        await schemesAPI.create(data);
      }
      setIsCreating(false);
      setEditingId(null);
      refetch();
    } catch (error) {
      console.error('Error saving scheme:', error);
    }
  };

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
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Scheme' : 'Create New Scheme'}</CardTitle>
          </CardHeader>
          <CardContent>
            <SchemeForm
              onSubmit={handleSubmit}
              isLoading={false}
              defaultValues={
                editingId && schemes?.data
                  ? schemes.data.find((s: any) => s.id === editingId)
                  : undefined
              }
            />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading schemes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schemes?.data?.map((scheme: any) => (
            <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{scheme.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(scheme.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm"><span className="font-semibold">Code:</span> {scheme.code}</div>
                <div className="text-sm"><span className="font-semibold">Type:</span> {scheme.type}</div>
                <div className="text-sm">
                  <span className="font-semibold">Status:</span>{' '}
                  <Badge className={scheme.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                    {scheme.status}
                  </Badge>
                </div>
                <div className="text-sm"><span className="font-semibold">County:</span> {scheme.county}</div>
                <div className="text-sm"><span className="font-semibold">Pop. Served:</span> {scheme.populationServed?.toLocaleString()}</div>
                <div className="text-sm"><span className="font-semibold">Connections:</span> {scheme.connections?.toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
