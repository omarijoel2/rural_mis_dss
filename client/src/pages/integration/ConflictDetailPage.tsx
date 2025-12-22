import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function ConflictDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const conflictFromState = (location.state as any)?.conflict;

  const [resolution, setResolution] = useState<string>('keep_server');
  const [notes, setNotes] = useState<string>('');

  const queryClient = useQueryClient();

  const { user } = useAuth();

  const { data: conflictData, isLoading, error, refetch } = useQuery({
    queryKey: ['conflict', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/mobile/conflicts/${id}`);
      return res.data ?? res;
    },
    enabled: !!id,
    initialData: conflictFromState ?? undefined,
  });

  const conflict = conflictData;

  useEffect(() => {
    // Subscribe to Echo notifications for this user (if Echo is configured)
    try {
      const Echo = (window as any).Echo;
      if (Echo && user?.id) {
        const channelName = `private-App.Models.User.${user.id}`;
        const channel = Echo.private(`App.Models.User.${user.id}`);
        channel.notification((payload: any) => {
          if (payload?.type === 'conflict.created' && String(payload?.conflict_id) === String(id)) {
            toast('Conflict updated — refreshing');
            refetch();
          }
        });

        return () => {
          try { Echo.leave(channelName); } catch (e) { /* ignore */ }
        };
      }
    } catch (e) {
      // ignore Echo errors
    }
  }, [user?.id, id, refetch]);

  const resolveMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post(`/api/v1/mobile/conflicts/${id}/resolve`, payload);
    },
    onSuccess: () => {
      toast.success('Conflict resolved');
      queryClient.invalidateQueries(['integration', 'conflicts']);
      queryClient.invalidateQueries(['conflict', id]);
      navigate('/integration/conflicts');
    },
    onError: (err: any) => {
      toast.error('Failed to resolve conflict');
      console.error(err);
    }
  });

  const handleResolve = async () => {
    resolveMutation.mutate({ resolution, notes });
  };

  if (!conflict) {
    return <div className="p-4">No conflict data available. Please open from the list.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Conflict {conflict.id}</h2>

      <div className="mb-4">
        <strong>Resource:</strong> {conflict.resource_type} — {conflict.resource_id}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border p-2">
          <h3 className="font-medium">Server Payload</h3>
          <pre className="text-xs max-h-48 overflow-auto">{JSON.stringify(conflict.server_payload, null, 2)}</pre>
        </div>
        <div className="border p-2">
          <h3 className="font-medium">Client Payload</h3>
          <pre className="text-xs max-h-48 overflow-auto">{JSON.stringify(conflict.client_payload, null, 2)}</pre>
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-2">Resolution</label>
        <div className="space-y-2">
          <label><input type="radio" name="res" value="keep_server" checked={resolution==='keep_server'} onChange={() => setResolution('keep_server')} /> Keep server version</label>
          <label><input type="radio" name="res" value="apply_client" checked={resolution==='apply_client'} onChange={() => setResolution('apply_client')} /> Apply client changes</label>
          <label><input type="radio" name="res" value="merge" checked={resolution==='merge'} onChange={() => setResolution('merge')} /> Merge (manual)</label>
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-2">Notes</label>
        <textarea className="w-full border p-2" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex items-center gap-2">
        <button className="btn btn-primary" onClick={handleResolve} disabled={resolveMutation.isLoading}>Resolve</button>
        <button className="btn" onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
}

export default ConflictDetailPage;
