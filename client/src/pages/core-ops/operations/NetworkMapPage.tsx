import { InteractiveNetworkMap } from '@/components/core-ops/InteractiveNetworkMap';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { schemesAPI } from '@/lib/api';

export function NetworkMapPage() {
  const [selectedSchemeId, setSelectedSchemeId] = useState<number>(1);

  const { data: schemes } = useQuery({
    queryKey: ['schemes-for-map'],
    queryFn: async () => {
      const laravel = await schemesAPI.list();
      if (laravel) return laravel;
      return {
        data: [
          { id: 1, code: 'TRK_LOD_001', name: 'Lodwar Water Supply Scheme' },
          { id: 2, code: 'MRB_TN_001', name: 'Marsabit Town Water Scheme' },
        ],
      };
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Network Topology Map</h1>
        <p className="text-muted-foreground">Interactive PostGIS-based network visualization with spatial queries</p>
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

      <InteractiveNetworkMap schemeId={selectedSchemeId} />
    </div>
  );
}
