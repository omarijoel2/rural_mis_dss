// src/pages/admin/SettingsPage.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { listSettings, createSetting, updateSetting, deleteSetting } from '@/services/adminApi';
import { Zap, Database, Shield, Activity } from 'lucide-react';

// ✅ Define and export the component
export function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listSettings()
      .then((data) => {
        setSettings(Array.isArray(data) ? data : data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddSetting = () => {
    setForm({});
    setEditId(null);
    setShowForm(true);
  };

  const handleEditSetting = (setting: any) => {
    setForm(setting);
    setEditId(setting.id);
    setShowForm(true);
  };

  const handleDeleteSetting = async (id: string) => {
    if (!window.confirm('Delete this setting?')) return;
    await deleteSetting(id);
    setSettings(settings.filter((s) => s.id !== id));
  };

  const handleFormSubmit = async (e: any) => {
    e.preventDefault();
    if (editId) {
      const updated = await updateSetting(editId, form);
      setSettings(settings.map((s) => (s.id === editId ? updated : s)));
    } else {
      const created = await createSetting(form);
      setSettings([...settings, created]);
    }
    setShowForm(false);
  };

  // ...existing code for module toggling can be adapted for settings if needed

  // ✅ return is now INSIDE the function
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure and manage system modules</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Manage system settings</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading…</div>
          ) : settings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No settings found.</p>
            </div>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="p-2 text-left">Key</th>
                  <th className="p-2 text-left">Value</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((s) => (
                  <tr key={s.id}>
                    <td className="p-2">{s.key}</td>
                    <td className="p-2">{s.value}</td>
                    <td className="p-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditSetting(s)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => handleDeleteSetting(s.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Button className="mt-4" onClick={handleAddSetting}>
            Add Setting
          </Button>
          {showForm && (
            <form className="mt-6 space-y-4" onSubmit={handleFormSubmit}>
              <h3 className="font-semibold text-lg mb-2">
                {editId ? 'Edit Setting' : 'Add Setting'}
              </h3>
              <input
                className="border p-2 rounded w-full"
                placeholder="Key"
                value={form.key || ''}
                onChange={(e) => setForm((f: any) => ({ ...f, key: e.target.value }))}
                required
              />
              <input
                className="border p-2 rounded w-full"
                placeholder="Value"
                value={form.value || ''}
                onChange={(e) => setForm((f: any) => ({ ...f, value: e.target.value }))}
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

      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium">Multi-Tenancy</p>
              <p className="text-2xl font-bold mt-2">Enabled</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium">RBAC</p>
              <p className="text-2xl font-bold mt-2">Active</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium">Audit Logging</p>
              <p className="text-2xl font-bold mt-2">On</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium">API Rate Limiting</p>
              <p className="text-2xl font-bold mt-2">1000/min</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}