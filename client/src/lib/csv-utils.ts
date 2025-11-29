// CSV utility functions for import/export

export interface UserCSVRow {
  name: string;
  email: string;
  role: string;
  tenant_id?: string;
}

export function parseCSV(csvContent: string): UserCSVRow[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must contain header and at least one row');

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredHeaders = ['name', 'email', 'role'];
  
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  return lines.slice(1)
    .filter(line => line.trim())
    .map((line, idx) => {
      const values = line.split(',').map(v => v.trim());
      const row: UserCSVRow = {
        name: values[headers.indexOf('name')] || '',
        email: values[headers.indexOf('email')] || '',
        role: values[headers.indexOf('role')] || '',
      };
      
      const tenantIdx = headers.indexOf('tenant_id');
      if (tenantIdx !== -1 && values[tenantIdx]) {
        row.tenant_id = values[tenantIdx];
      }

      if (!row.name || !row.email || !row.role) {
        throw new Error(`Row ${idx + 2}: missing required fields`);
      }

      return row;
    });
}

export function generateCSV(users: Array<{ id?: number; name: string; email: string; role: string; tenant_id?: string }>): string {
  const headers = ['name', 'email', 'role', 'tenant_id'];
  const rows = users.map(user => [
    user.name,
    user.email,
    user.role,
    user.tenant_id || '1',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

export function downloadCSV(csvContent: string, filename: string = 'users.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateTemplateCSV(): string {
  const headers = ['name', 'email', 'role', 'tenant_id'];
  const sampleRows = [
    ['John Doe', 'john.doe@example.com', 'admin', '1'],
    ['Jane Smith', 'jane.smith@example.com', 'manager', '1'],
    ['Bob Johnson', 'bob.johnson@example.com', 'user', '1'],
  ];

  const csvContent = [
    headers.join(','),
    ...sampleRows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}
