import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NetworkTopologyViewer } from '@/components/core-ops/NetworkTopologyViewer';
import { schemesAPI } from '@/lib/api';

export function NetworkPage() {
  const [selectedSchemeId, setSelectedSchemeId] = useState<number>(1);

  const { data: schemes } = useQuery({
    queryKey: ['schemes-for-network'],
    queryFn: async () => {
      const laravel = await schemesAPI.list();
      if (laravel) return laravel;
      return {
        data: [
          { id: 1, code: 'KISII_001', name: 'Kisii Urban Scheme' },
          { id: 2, code: 'KERICHO_001', name: 'Kericho Town Scheme' },
        ],
      };
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Network Topology Viewer</h1>
        <p className="text-muted-foreground">View and manage water distribution networks with PostGIS spatial data</p>
      </div>

      <div className="max-w-md">
        <label className="text-sm font-medium mb-2 block">Select Scheme</label>
        <Select value={selectedSchemeId.toString()} onValueChange={(v) => setSelectedSchemeId(parseInt(v))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {schemes?.data?.map((scheme: any) => (
              <SelectItem key={scheme.id} value={scheme.id.toString()}>
                {scheme.name} ({scheme.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <NetworkTopologyViewer schemeId={selectedSchemeId} />
    </div>
  );
}
