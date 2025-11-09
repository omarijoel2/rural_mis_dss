import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Droplet, Search, FlaskConical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { CollectSampleDialog } from '@/components/water-quality/CollectSampleDialog';
import { ReceiveSampleDialog } from '@/components/water-quality/ReceiveSampleDialog';

export function SamplesPage() {
  const [page, setPage] = useState(1);
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [collectDialogOpen, setCollectDialogOpen] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['water-quality-samples', page],
    queryFn: async () => {
      return apiClient.get<any>('/v1/water-quality/samples', { page, per_page: 20 });
    }
  });

  const custodyStateColors: Record<string, string> = {
    scheduled: 'bg-gray-100 text-gray-800',
    collected: 'bg-blue-100 text-blue-800',
    received_lab: 'bg-purple-100 text-purple-800',
    in_analysis: 'bg-yellow-100 text-yellow-800',
    reported: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const handleReceiveInLab = (sample: any) => {
    setSelectedSample(sample);
    setReceiveDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Samples</h2>
          <p className="text-muted-foreground">
            Track water samples from field collection to lab reporting
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Sample
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search by Barcode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter barcode (e.g., WQ20240101-ABC123)"
              value={barcodeSearch}
              onChange={(e) => setBarcodeSearch(e.target.value)}
            />
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">Loading samples...</div>
      ) : (
        <div className="grid gap-4">
          {data?.data?.map((sample: any) => (
            <Card key={sample.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Droplet className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-lg">
                        {sample.sampling_point?.name || 'Unknown Point'}
                      </CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{sample.barcode}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={custodyStateColors[sample.custody_state] || 'bg-gray-100'}>
                      {sample.custody_state?.replace('_', ' ') || 'scheduled'}
                    </Badge>
                    {sample.custody_state === 'collected' && (
                      <Button size="sm" variant="outline" onClick={() => handleReceiveInLab(sample)}>
                        <FlaskConical className="h-4 w-4 mr-1" />
                        Receive in Lab
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Scheduled:</span>
                    <p className="font-medium">
                      {sample.scheduled_at ? format(new Date(sample.scheduled_at), 'PP') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Collected:</span>
                    <p className="font-medium">
                      {sample.collected_at ? format(new Date(sample.collected_at), 'PP') : 'Pending'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Parameters:</span>
                    <p className="font-medium">{sample.parameters_count || 0} tests</p>
                  </div>
                </div>
                
                {sample.collected_by && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Collected by:</span> {sample.collected_by}
                  </p>
                )}
                
                {sample.custody_chain && sample.custody_chain.length > 0 && (
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Custody Chain:</p>
                    <div className="bg-muted p-2 rounded text-xs font-mono">
                      {sample.custody_chain.length} transfer(s) recorded
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data?.meta && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {data.meta.from} to {data.meta.to} of {data.meta.total} samples
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

      {selectedSample && (
        <>
          <CollectSampleDialog 
            open={collectDialogOpen}
            onOpenChange={setCollectDialogOpen}
            sample={selectedSample}
          />
          <ReceiveSampleDialog 
            open={receiveDialogOpen}
            onOpenChange={setReceiveDialogOpen}
            sample={selectedSample}
          />
        </>
      )}
    </div>
  );
}
