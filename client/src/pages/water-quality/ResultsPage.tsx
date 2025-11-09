import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Upload, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { CsvImportDialog } from '@/components/water-quality/CsvImportDialog';

export function ResultsPage() {
  const [page, setPage] = useState(1);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['water-quality-results', page],
    queryFn: async () => {
      return apiClient.get<any>('/v1/water-quality/results', { page, per_page: 20 });
    }
  });

  const flagColors: Record<string, string> = {
    below_lod: 'bg-gray-100 text-gray-800',
    exceeds_who_limit: 'bg-orange-100 text-orange-800',
    exceeds_wasreb_limit: 'bg-red-100 text-red-800',
    exceeds_local_limit: 'bg-red-100 text-red-800',
    high_uncertainty: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lab Results</h2>
          <p className="text-muted-foreground">
            Enter and review lab analysis results with automatic QC flagging
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Result
          </Button>
        </div>
      </div>

      <CsvImportDialog 
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />

      {isLoading ? (
        <div className="text-center py-12">Loading results...</div>
      ) : (
        <div className="grid gap-4">
          {data?.data?.map((result: any) => {
            const hasFlags = result.qc_flags && result.qc_flags.length > 0;
            const isCritical = result.qc_flags?.some((f: string) => 
              f.includes('exceeds_wasreb') || f.includes('exceeds_local')
            );
            
            return (
              <Card key={result.id} className={isCritical ? 'border-red-200' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {result.sample_param?.parameter?.name || 'Unknown Parameter'}
                        </CardTitle>
                        {hasFlags && (
                          <AlertTriangle className={`h-5 w-5 ${isCritical ? 'text-red-500' : 'text-yellow-500'}`} />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sample: {result.sample_param?.sample?.barcode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {result.value_qualifier && <span className="text-muted-foreground">{result.value_qualifier}</span>}
                        {result.value?.toFixed(2)} {result.sample_param?.parameter?.unit}
                      </p>
                      {result.uncertainty && (
                        <p className="text-sm text-muted-foreground">
                          ± {result.uncertainty} {result.sample_param?.parameter?.unit}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hasFlags && (
                    <div className="flex flex-wrap gap-2">
                      {result.qc_flags.map((flag: string) => (
                        <Badge key={flag} className={flagColors[flag] || 'bg-gray-100'}>
                          {flag.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Analyzed:</span>
                      <p className="font-medium">
                        {result.analyzed_at ? format(new Date(result.analyzed_at), 'PP') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Method:</span>
                      <p className="font-medium">{result.method || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">LOD:</span>
                      <p className="font-medium">
                        {result.lod ? `${result.lod} ${result.sample_param?.parameter?.unit}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Analyst:</span>
                      <p className="font-medium">{result.analyst || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {result.remarks && (
                    <p className="text-sm text-muted-foreground italic">{result.remarks}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {data?.meta && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {data.meta.from} to {data.meta.to} of {data.meta.total} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.meta.last_page}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
