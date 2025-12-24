// src/pages/admin/AuditLogs.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Search, Download, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { listAuditLogs, deleteAuditLog } from '@/services/adminApi';

// ✅ Define and export the component
export function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    listAuditLogs()
      .then((data) => {
        setLogs(Array.isArray(data) ? data : data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteLog = async (id: string) => {
    if (!window.confirm('Delete this audit log?')) return;
    await deleteAuditLog(id);
    setLogs(logs.filter((l) => l.id !== id));
  };

  // ✅ return is now INSIDE the function
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all system actions, changes, and user activity
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by actor, action, entity..." className="pl-10" />
        </div>
        <Button variant="outline">Date Range</Button>
        <Button variant="outline">Filters</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>All actions with before/after diffs</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading…</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No audit logs found.</p>
            </div>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="p-2 text-left">Actor</th>
                  <th className="p-2 text-left">Action</th>
                  <th className="p-2 text-left">Entity</th>
                  <th className="p-2 text-left">Timestamp</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="p-2">{l.actor}</td>
                    <td className="p-2">{l.action}</td>
                    <td className="p-2">{l.entity}</td>
                    <td className="p-2">
                      {l.timestamp ? new Date(l.timestamp).toLocaleString() : '—'}
                    </td>
                    <td className="p-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => handleDeleteLog(l.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}