import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSyncBatches } from '@/services/integrationApi';

export default function SyncMonitor() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['integration', 'sync-batches'],
    queryFn: getSyncBatches,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Sync Monitor</h1>
      <p className="text-sm text-muted-foreground mt-2">Monitor mobile sync batches and recent activity.</p>

      <div className="mt-6 border rounded bg-card p-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="text-sm text-red-500">Error loading sync batches</p>}
        {data && Array.isArray(data) && data.length === 0 && (
          <p className="text-sm text-muted-foreground">No sync batches found.</p>
        )}
        {data && Array.isArray(data) && data.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left">Batch ID</th>
                <th className="p-2 text-left">Device</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Started</th>
                <th className="p-2 text-left">Completed</th>
              </tr>
            </thead>
            <tbody>
              {data.map((batch: any) => (
                <tr key={batch.id} className="border-t">
                  <td className="p-2">{batch.id}</td>
                  <td className="p-2">{batch.device_id || batch.device || '-'}</td>
                  <td className="p-2">{batch.status || '-'}</td>
                  <td className="p-2">{batch.started_at ? new Date(batch.started_at).toLocaleString() : '-'}</td>
                  <td className="p-2">{batch.completed_at ? new Date(batch.completed_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
