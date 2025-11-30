import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Zap, Heart, Calendar, Plus, Download, Search, AlertTriangle, Edit } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { StakeholderDialog } from './StakeholderDialog';

interface Stakeholder {
  id: number;
  name: string;
  category: string;
  influence: number;
  interest: number;
  engagement: string;
  lastEngagement: string;
  status: string;
  isVulnerable?: boolean;
  vulnerableReason?: string;
  email?: string;
  phone?: string;
  organization?: string;
}

export function StakeholderRegistry() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | null>(null);

  const fetchStakeholders = () => {
    apiClient.get<{ data: Stakeholder[] }>('/community/stakeholders')
      .then(res => {
        const data = res.data || res;
        setStakeholders(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStakeholders();
  }, []);

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Influence', 'Interest', 'Engagement', 'Last Engagement', 'Status', 'Vulnerable', 'Email', 'Phone'];
    const csvContent = [
      headers.join(','),
      ...stakeholders.map(s => [
        s.id,
        `"${s.name}"`,
        s.category,
        s.influence,
        s.interest,
        s.engagement,
        s.lastEngagement,
        s.status,
        s.isVulnerable ? 'Yes' : 'No',
        s.email || '',
        s.phone || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stakeholders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSaveStakeholder = async (stakeholder: Stakeholder) => {
    if (stakeholder.id) {
      setStakeholders(prev => prev.map(s => s.id === stakeholder.id ? { ...s, ...stakeholder } : s));
    } else {
      const newStakeholder = { ...stakeholder, id: Date.now(), lastEngagement: new Date().toISOString().split('T')[0] };
      setStakeholders(prev => [...prev, newStakeholder]);
    }
    setEditingStakeholder(null);
  };

  const handleAddNew = () => {
    setEditingStakeholder(null);
    setDialogOpen(true);
  };

  const handleEdit = (stakeholder: Stakeholder) => {
    setEditingStakeholder(stakeholder);
    setDialogOpen(true);
  };

  const filteredStakeholders = stakeholders.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Government': 'bg-blue-100 text-blue-800',
      'Community': 'bg-green-100 text-green-800',
      'Users': 'bg-purple-100 text-purple-800',
      'NGO': 'bg-orange-100 text-orange-800',
      'Vulnerable': 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getEngagementIcon = (engagement: string) => {
    if (engagement === 'monthly') return '📅';
    if (engagement === 'bi-weekly') return '📆';
    if (engagement === 'quarterly') return '📊';
    return '📋';
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Stakeholder Directory</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button size="sm" onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Stakeholder
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search stakeholders..."
          className="pl-10"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {filteredStakeholders.map(s => (
          <Card key={s.id} className="cursor-pointer hover:bg-muted/50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{s.name}</h3>
                    {s.isVulnerable && (
                      <Badge className="bg-orange-100 text-orange-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Vulnerable
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getCategoryColor(s.category)}>{s.category}</Badge>
                    <Badge variant="outline">Influence: {s.influence}/5</Badge>
                    <Badge variant="outline">Interest: {s.interest}/5</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{getEngagementIcon(s.engagement)} {s.engagement}</div>
                    <div className="text-xs mt-1">{new Date(s.lastEngagement).toLocaleDateString()}</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(s)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <StakeholderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        stakeholder={editingStakeholder}
        onSave={handleSaveStakeholder}
      />
    </div>
  );
}
