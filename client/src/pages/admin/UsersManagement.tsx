import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Plus, Shield, Key, Download, Upload, FileText, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { parseCSV, generateCSV, downloadCSV, generateTemplateCSV } from '@/lib/csv-utils';
import { listUsers, createUser, updateUser, deleteUser, listRoles } from '@/services/adminApi';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  tenant_id: string;
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [form, setForm] = useState<Partial<User>>({});
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [selected, setSelected] = useState<number[]>([]);
  const [editId, setEditId] = useState<number | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      listUsers().then(d => setUsers(Array.isArray(d) ? d : d.data || [])),
      listRoles().then(d => setRoles(Array.isArray(d) ? d : d.data || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/v1/admin/users');
      const data = await response.json();
      const fetchedUsers = data.data || [];

      const csvContent = generateCSV(fetchedUsers);
      downloadCSV(csvContent, `users-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success(`Exported ${fetchedUsers.length} users`);
    } catch (err) {
      toast.error('Failed to export users');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const content = await file.text();
      const parsedUsers = parseCSV(content);

      const response = await fetch('/api/v1/admin/users/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: parsedUsers }),
      });

      if (!response.ok) throw new Error('Import failed');

      const result = await response.json();
      setUsers(result.data || []);
      toast.success(`Successfully imported ${parsedUsers.length} users`);

      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to import users');
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      downloadCSV(generateTemplateCSV(), 'users-template.csv');
      toast.success('Template downloaded');
    } catch (err) {
      toast.error('Failed to download template');
      console.error(err);
    }
  };

  const handleAddUser = () => {
    setForm({});
    setEditId(null);
    setShowForm(true);
  };

  const handleEditUser = (user: User) => {
    setForm(user);
    setEditId(user.id);
    setShowForm(true);
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Delete this user?')) return;
    await deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success('User deleted');
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.length} users?`)) return;
    await Promise.all(selected.map(id => deleteUser(id)));
    setUsers(prev => prev.filter(u => !selected.includes(u.id)));
    setSelected([]);
    toast.success('Users deleted');
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!form.name || form.name.trim().length < 2) errors.name = 'Name is required';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Valid email required';
    if (!form.role) errors.role = 'Role is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editId) {
      const updated = await updateUser(editId, form);
      setUsers(prev => prev.map(u => (u.id === editId ? updated : u)));
      toast.success('User updated');
    } else {
      const created = await createUser(form);
      setUsers(prev => [...prev, created]);
      toast.success('User added');
    }

    setShowForm(false);
    setFormErrors({});
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>View and manage user accounts</CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading…</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No users found.</p>
            </div>
          ) : (
            <>
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className="p-2">
                      <input
                        type="checkbox"
                        checked={selected.length === users.length && users.length > 0}
                        onChange={e =>
                          setSelected(e.target.checked ? users.map(u => u.id) : [])
                        }
                      />
                    </th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Role</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selected.includes(u.id)}
                          onChange={e =>
                            setSelected(prev =>
                              e.target.checked
                                ? [...prev, u.id]
                                : prev.filter(id => id !== u.id)
                            )
                          }
                        />
                      </td>
                      <td className="p-2">{u.name}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{u.role}</td>
                      <td className="p-2 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditUser(u)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selected.length > 0 && (
                <div className="mt-3">
                  <Button variant="destructive" onClick={handleBulkDelete}>
                    Delete Selected ({selected.length})
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white rounded-lg p-6 w-96 space-y-4"
          >
            <h3 className="font-semibold text-lg">
              {editId ? 'Edit User' : 'Add User'}
            </h3>

            <Input
              placeholder="Name"
              value={form.name || ''}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}

            <Input
              placeholder="Email"
              value={form.email || ''}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}

            <select
              className="border p-2 rounded w-full"
              value={form.role || ''}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            >
              <option value="">Select role…</option>
              {roles.map((r: any) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
            {formErrors.role && <p className="text-xs text-red-500">{formErrors.role}</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">{editId ? 'Update' : 'Add'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
