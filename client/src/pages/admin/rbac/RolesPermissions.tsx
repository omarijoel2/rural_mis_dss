// src/pages/admin/rbac/RolesPermissions.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Shield, Users, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { listRoles, createRole, updateRole, deleteRole } from '@/services/adminApi';

// ✅ Define and export the component
export function RolesPermissions() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listRoles()
      .then((data) => setRoles(Array.isArray(data) ? data : data.data || []))
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAddRole = () => {
    setForm({});
    setEditId(null);
    setShowForm(true);
  };

  const handleEditRole = (role: any) => {
    setForm(role);
    setEditId(role.id);
    setShowForm(true);
  };

  const handleDeleteRole = async (id: string) => {
    if (!window.confirm('Delete this role?')) return;
    await deleteRole(id);
    setRoles(roles.filter((r) => r.id !== id));
  };

  const handleFormSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editId) {
        const updated = await updateRole(editId, form);
        setRoles(roles.map((r) => (r.id === editId ? updated : r)));
      } else {
        const created = await createRole(form);
        setRoles([...roles, created]);
      }
      setShowForm(false);
    } catch (err) {
      alert('Error saving role.');
    }
  };

  // ✅ return is now INSIDE the component function
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions Management</h1>
          <p className="text-muted-foreground">
            Manage system roles, permissions, and menu access control
          </p>
        </div>
        <Button onClick={handleAddRole}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="py-8 text-center">Loading…</div>
        ) : roles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No roles found.</p>
          </div>
        ) : (
          roles.map((role) => (
            <Card key={role.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`${role.color || 'bg-gray-500'} text-white p-3 rounded-lg`}>
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => handleDeleteRole(role.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">ACCESSIBLE MODULES:</p>
                  <div className="flex flex-wrap gap-1">
                    {(role.permissions || '')
                      .split(', ')
                      .map((perm: string) => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        {showForm && (
          <form className="mt-6 space-y-4" onSubmit={handleFormSubmit}>
            <h3 className="font-semibold text-lg mb-2">{editId ? 'Edit Role' : 'Create Role'}</h3>
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
            <input
              className="border p-2 rounded w-full"
              placeholder="Permissions (comma separated)"
              value={form.permissions || ''}
              onChange={(e) => setForm((f: any) => ({ ...f, permissions: e.target.value }))}
            />
            <input
              className="border p-2 rounded w-full"
              placeholder="Color"
              value={form.color || ''}
              onChange={(e) => setForm((f: any) => ({ ...f, color: e.target.value }))}
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Roles Overview
          </CardTitle>
          <CardDescription>
            Each role has specific module access and granular permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                <p className="text-3xl font-bold mt-2">5</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Users Assigned</p>
                <p className="text-3xl font-bold mt-2">24</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Permissions Configured</p>
                <p className="text-3xl font-bold mt-2">142</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              For detailed permission management and role hierarchy, see Roles & Permissions in the Admin menu.
              Use the "Role & Menu Access" option to control which modules each role can access.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}