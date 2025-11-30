import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar, Users, CheckCircle, AlertCircle } from 'lucide-react';
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

export function BulkEngagementScheduler() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    type: 'meeting',
    date: '',
    time: '',
    subject: '',
    notes: '',
  });
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    apiClient.get<{ data: Stakeholder[] }>('/community/stakeholders')
      .then(res => {
        const data = res.data || res;
        setStakeholders(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleSelection = (id: number) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const selectAll = () => {
    if (selectedIds.size === stakeholders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(stakeholders.map(s => s.id)));
    }
  };

  const selectByCategory = (category: string) => {
    const categoryIds = stakeholders.filter(s => s.category === category).map(s => s.id);
    const newSelection = new Set(selectedIds);
    categoryIds.forEach(id => newSelection.add(id));
    setSelectedIds(newSelection);
  };

  const selectHighInfluence = () => {
    const highInfluenceIds = stakeholders.filter(s => s.influence >= 4).map(s => s.id);
    const newSelection = new Set(selectedIds);
    highInfluenceIds.forEach(id => newSelection.add(id));
    setSelectedIds(newSelection);
  };

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

  const handleSchedule = async () => {
    if (selectedIds.size === 0) return;
    
    setScheduling(true);
    try {
      const selectedStakeholders = stakeholders.filter(s => selectedIds.has(s.id));
      console.log('Scheduling engagement for:', selectedStakeholders, scheduleData);
      
      alert(`Engagement scheduled for ${selectedIds.size} stakeholders on ${scheduleData.date} at ${scheduleData.time}`);
      
      setShowScheduleDialog(false);
      setSelectedIds(new Set());
      setScheduleData({
        type: 'meeting',
        date: '',
        time: '',
        subject: '',
        notes: '',
      });
    } finally {
      setScheduling(false);
    }
  };

  if (loading) return <div className="p-4">Loading stakeholders...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Bulk Engagement Scheduler</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{selectedIds.size} selected</Badge>
          <Button
            size="sm"
            disabled={selectedIds.size === 0}
            onClick={() => setShowScheduleDialog(true)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Engagement
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={selectAll}>
          {selectedIds.size === stakeholders.length ? 'Deselect All' : 'Select All'}
        </Button>
        <Button size="sm" variant="outline" onClick={selectHighInfluence}>
          High Influence
        </Button>
        <Button size="sm" variant="outline" onClick={() => selectByCategory('Government')}>
          Government
        </Button>
        <Button size="sm" variant="outline" onClick={() => selectByCategory('Community')}>
          Community
        </Button>
        <Button size="sm" variant="outline" onClick={() => selectByCategory('Vulnerable')}>
          Vulnerable Groups
        </Button>
      </div>

      <div className="space-y-2">
        {stakeholders.map(s => (
          <Card
            key={s.id}
            className={`cursor-pointer transition-colors ${selectedIds.has(s.id) ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => toggleSelection(s.id)}
          >
            <CardContent className="py-3">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedIds.has(s.id)}
                  onCheckedChange={() => toggleSelection(s.id)}
                />
                <div className="flex-1">
                  <h3 className="font-medium">{s.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <Badge className={getCategoryColor(s.category)}>{s.category}</Badge>
                    <Badge variant="outline">Influence: {s.influence}/5</Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>Last: {new Date(s.lastEngagement).toLocaleDateString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Bulk Engagement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">{selectedIds.size} stakeholders selected</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Engagement Type</Label>
                <Select
                  value={scheduleData.type}
                  onValueChange={value => setScheduleData({ ...scheduleData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="focus_group">Focus Group</SelectItem>
                    <SelectItem value="phone_call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="site_visit">Site Visit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={scheduleData.date}
                  onChange={e => setScheduleData({ ...scheduleData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={scheduleData.time}
                  onChange={e => setScheduleData({ ...scheduleData, time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={scheduleData.subject}
                  onChange={e => setScheduleData({ ...scheduleData, subject: e.target.value })}
                  placeholder="Meeting subject..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={scheduleData.notes}
                onChange={e => setScheduleData({ ...scheduleData, notes: e.target.value })}
                placeholder="Additional notes or agenda..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSchedule}
              disabled={scheduling || !scheduleData.date || !scheduleData.type}
            >
              {scheduling ? 'Scheduling...' : 'Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
