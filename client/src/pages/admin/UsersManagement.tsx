import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Plus, Shield, Key, Download, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { parseCSV, generateCSV, downloadCSV, generateTemplateCSV } from '@/lib/csv-utils';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  tenant_id: string;
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      // Fetch users from API
      const response = await fetch('/api/v1/admin/users');
      const data = await response.json();
      const fetchedUsers = data.data || [];
      
      const csvContent = generateCSV(fetchedUsers);
      downloadCSV(csvContent, `users-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success(`Exported ${fetchedUsers.length} users`);
    } catch (error) {
      toast.error('Failed to export users');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const content = await file.text();
      const parsedUsers = parseCSV(content);

      // Send to API for bulk import
      const response = await fetch('/api/v1/admin/users/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: parsedUsers }),
      });

      if (!response.ok) throw new Error('Import failed');
      
      const result = await response.json();
      setUsers(result.data || []);
      toast.success(`Successfully imported ${parsedUsers.length} users`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import users');
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      const csvContent = generateTemplateCSV();
      downloadCSV(csvContent, 'users-template.csv');
      toast.success('Template downloaded successfully');
    } catch (error) {
      toast.error('Failed to download template');
      console.error(error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users & Sessions</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, 2FA, and active sessions
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users by name, email..." className="pl-10" />
        </div>
        <Button variant="outline">Filters</Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button 
          variant="outline"
          onClick={handleDownloadTemplate}
          title="Download CSV template with correct column format"
        >
          <FileText className="mr-2 h-4 w-4" />
          Template
        </Button>
        <Button 
          variant="outline" 
          onClick={handleImportClick}
          disabled={isImporting}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isImporting ? 'Importing...' : 'Import'}
        </Button>
        <Button 
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Across all tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Currently logged in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">2FA Enabled</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">Security coverage</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>View and manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No users found. Run database migrations to create tables.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
