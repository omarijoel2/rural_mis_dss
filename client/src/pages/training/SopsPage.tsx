import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, FileText, CheckCircle, AlertCircle, Eye } from 'lucide-react';

interface Sop {
  id: number;
  code: string;
  title: string;
  category: string;
  version: number;
  status: string;
  published_at?: string;
  next_review_due?: string;
  attestations?: Array<{ user_id: number; read_at: string }>;
}

async function fetchSops(search?: string) {
  const params = new URLSearchParams({ status: 'published' });
  if (search) params.append('search', search);

  const response = await fetch(`/api/v1/training/sops?${params}`, {
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch SOPs');
  return response.json();
}

async function attestSop(sopId: number) {
  const response = await fetch(`/api/v1/training/sops/${sopId}/attest`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to attest SOP');
  return response.json();
}

export default function SopsPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['sops', search],
    queryFn: () => fetchSops(search),
    staleTime: 60000,
  });

  const attestMutation = useMutation({
    mutationFn: attestSop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sops'] });
    },
  });

  const sops: Sop[] = data?.data || [];

  const isAttested = (sop: Sop, userId: number) => {
    return sop.attestations?.some((a) => a.user_id === userId) || false;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Standard Operating Procedures</h1>
        <p className="text-muted-foreground">
          Access and attest to organizational SOPs
        </p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search SOPs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading SOPs...</div>
      ) : sops.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">No SOPs found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search terms
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sops.map((sop) => {
            const isDueReview = sop.next_review_due && new Date(sop.next_review_due) < new Date();

            return (
              <Card key={sop.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <CardTitle className="text-lg">{sop.title}</CardTitle>
                      <CardDescription className="mt-1">{sop.code}</CardDescription>
                    </div>
                    <Badge variant="outline">v{sop.version}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{sop.category}</Badge>
                    {isDueReview && (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Review Due
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sop.published_at && (
                      <p className="text-sm text-muted-foreground">
                        Published: {new Date(sop.published_at).toLocaleDateString()}
                      </p>
                    )}
                    {sop.next_review_due && (
                      <p className="text-sm text-muted-foreground">
                        Next Review: {new Date(sop.next_review_due).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View SOP
                      </Button>
                      {!isAttested(sop, 1) && (
                        <Button
                          size="sm"
                          onClick={() => attestMutation.mutate(sop.id)}
                          disabled={attestMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Attest
                        </Button>
                      )}
                      {isAttested(sop, 1) && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Attested
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
