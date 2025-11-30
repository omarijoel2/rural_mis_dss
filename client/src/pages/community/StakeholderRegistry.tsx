import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Zap, Heart, Calendar } from 'lucide-react';
import { apiClient } from '../../lib/api-client';

interface Stakeholder {
  id: number;
  name: string;
  category: string;
  influence: number;
  interest: number;
  engagement: string;
  lastEngagement: string;
  status: string;
}

export function StakeholderRegistry() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<{ data: Stakeholder[] }>('/community/stakeholders')
      .then(res => setStakeholders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
      <h2 className="text-xl font-semibold">Stakeholder Directory</h2>
      <div className="space-y-2">
        {stakeholders.map(s => (
          <Card key={s.id} className="cursor-pointer hover:bg-muted/50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{s.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getCategoryColor(s.category)}>{s.category}</Badge>
                    <Badge variant="outline">Influence: {s.influence}/5</Badge>
                    <Badge variant="outline">Interest: {s.interest}/5</Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{getEngagementIcon(s.engagement)} {s.engagement}</div>
                  <div className="text-xs mt-1">{new Date(s.lastEngagement).toLocaleDateString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
