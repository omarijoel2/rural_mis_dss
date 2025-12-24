// src/pages/admin/rbac/PermissionMatrix.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Edit, Trash2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; // ⚠️ You were missing this import!
import { listPermissions, createPermission, updatePermission, deletePermission } from '@/services/adminApi';

// ✅ Define the component
export function PermissionMatrix() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listPermissions()
      .then((data) => {
        setPermissions(Array.isArray(data) ? data : data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddPermission = () => {
    setForm({});
    setEditId(null);
    setShowForm(true);
  };

  const handleEditPermission = (perm: any) => {
    setForm(perm);
    setEditId(perm.id);
    setShowForm(true);
  };

  const handleDeletePermission = async (id: string) => {
    if (!window.confirm('Delete this permission?')) return;
    await deletePermission(id);
    setPermissions(permissions.filter((p) => p.id !== id));
  };

  const handleFormSubmit = async (e: any) => {
    e.preventDefault();
    if (editId) {
      const updated = await updatePermission(editId, form);
      setPermissions(permissions.map((p) => (p.id === editId ? updated : p)));
    } else {
      const created = await createPermission(form);
      setPermissions([...permissions, created]);
    }
    setShowForm(false);
  };

  // ✅ All JSX must be inside return, with a single root
  return (
    <div className="p-6 space-y-6"> {/* ← Single root wrapper */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permission Matrix</h1>
        <p className="text-muted-foreground">
          Grid view of roles × permissions with bulk operations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>Manage permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading…</div>
          ) : permissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Settings className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No permissions found.</p>
            </div>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">{p.description}</td>
                    <td className="p-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditPermission(p)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => handleDeletePermission(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Button className="mt-4" onClick={handleAddPermission}>
            Add Permission
          </Button>
          {showForm && (
            <form className="mt-6 space-y-4" onSubmit={handleFormSubmit}>
              <h3 className="font-semibold text-lg mb-2">
                {editId ? 'Edit Permission' : 'Add Permission'}
              </h3>
              <input
                className="border p-2 rounded w-full"
                placeholder="Name"
                value={form.name || ''}
                onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                className="border p-2 rounded w-full"
                placeholder="Description"
                value={form.description || ''}
                onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))}
                required
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editId ? 'Update' : 'Add'}</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}