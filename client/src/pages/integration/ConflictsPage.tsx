import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSyncConflicts } from '@/services/integrationApi';
import { Link } from 'react-router-dom';

export function ConflictsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['integration', 'conflicts'],
    queryFn: async () => {
      const res = await getSyncConflicts();
      return res.data || res;
    },
  });

  if (isLoading) return <div>Loading conflicts…</div>;
  if (error) return <div>Error loading conflicts</div>;

  const items = data?.data ?? data ?? [];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Sync Conflicts</h2>
      <div className="overflow-auto border rounded">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Resource</th>
              <th className="p-2 text-left">Resource ID</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c: any) => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.id}</td>
                <td className="p-2">{c.resource_type}</td>
                <td className="p-2">{c.resource_id}</td>
                <td className="p-2">{new Date(c.created_at).toLocaleString()}</td>
                <td className="p-2">
                  <Link to={`/integration/conflicts/${c.id}`} state={{ conflict: c }} className="btn btn-sm">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ConflictsPage;
