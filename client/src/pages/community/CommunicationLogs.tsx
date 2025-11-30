import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, Phone, Mail, MessageSquare, Users, FileText, Calendar, User } from 'lucide-react';
import { apiClient } from '../../lib/api-client';

interface CommunicationLog {
  id: number;
  stakeholderId: number;
  stakeholderName: string;
  type: 'phone' | 'email' | 'meeting' | 'letter' | 'sms' | 'other';
  direction: 'inbound' | 'outbound';
  subject: string;
  summary: string;
  date: string;
  duration?: number;
  outcome: 'positive' | 'neutral' | 'negative' | 'pending';
  followUpRequired: boolean;
  followUpDate?: string;
  createdBy: string;
}

interface Stakeholder {
  id: number;
  name: string;
  category: string;
}

const mockLogs: CommunicationLog[] = [
  {
    id: 1,
    stakeholderId: 1,
    stakeholderName: 'County Water Director',
    type: 'meeting',
    direction: 'outbound',
    subject: 'Quarterly Review Meeting',
    summary: 'Discussed water quality improvements and budget allocation for Q1 2026. Director expressed satisfaction with recent progress.',
    date: '2025-11-20',
    duration: 60,
    outcome: 'positive',
    followUpRequired: true,
    followUpDate: '2025-12-15',
    createdBy: 'John Operator',
  },
  {
    id: 2,
    stakeholderId: 2,
    stakeholderName: 'Community Chairperson',
    type: 'phone',
    direction: 'inbound',
    subject: 'Tariff Concern',
    summary: 'Chairperson called to express community concerns about proposed tariff increase. Requested a community meeting.',
    date: '2025-11-18',
    duration: 25,
    outcome: 'neutral',
    followUpRequired: true,
    followUpDate: '2025-11-25',
    createdBy: 'Mary Supervisor',
  },
  {
    id: 3,
    stakeholderId: 5,
    stakeholderName: 'Women Vendors Group',
    type: 'email',
    direction: 'outbound',
    subject: 'Water Access Program Update',
    summary: 'Sent monthly update on the women vendors water access program. Included schedule for next training session.',
    date: '2025-11-15',
    outcome: 'positive',
    followUpRequired: false,
    createdBy: 'John Operator',
  },
];

export function CommunicationLogs() {
  const [logs, setLogs] = useState<CommunicationLog[]>(mockLogs);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newLog, setNewLog] = useState<Partial<CommunicationLog>>({
    type: 'phone',
    direction: 'outbound',
    outcome: 'neutral',
    followUpRequired: false,
  });

  useEffect(() => {
    apiClient.get<{ data: Stakeholder[] }>('/community/stakeholders')
      .then(res => {
        const data = res.data || res;
        setStakeholders(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err));
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'letter': return <FileText className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.stakeholderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddLog = () => {
    if (!newLog.stakeholderId || !newLog.subject || !newLog.summary) return;
    
    const stakeholder = stakeholders.find(s => s.id === newLog.stakeholderId);
    const log: CommunicationLog = {
      id: logs.length + 1,
      stakeholderId: newLog.stakeholderId!,
      stakeholderName: stakeholder?.name || 'Unknown',
      type: newLog.type as CommunicationLog['type'],
      direction: newLog.direction as CommunicationLog['direction'],
      subject: newLog.subject!,
      summary: newLog.summary!,
      date: new Date().toISOString().split('T')[0],
      duration: newLog.duration,
      outcome: newLog.outcome as CommunicationLog['outcome'],
      followUpRequired: newLog.followUpRequired || false,
      followUpDate: newLog.followUpDate,
      createdBy: 'Current User',
    };
    
    setLogs([log, ...logs]);
    setShowAddDialog(false);
    setNewLog({
      type: 'phone',
      direction: 'outbound',
      outcome: 'neutral',
      followUpRequired: false,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Communication Logs</h2>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Communication
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by stakeholder or subject..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="letter">Letter</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {filteredLogs.map(log => (
            <Card key={log.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    {getTypeIcon(log.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{log.subject}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <User className="h-3 w-3" />
                          <span>{log.stakeholderName}</span>
                          <span>•</span>
                          <span className="capitalize">{log.type}</span>
                          <span>•</span>
                          <span className="capitalize">{log.direction}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getOutcomeColor(log.outcome)}>{log.outcome}</Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(log.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm mt-2 text-muted-foreground">{log.summary}</p>
                    {log.followUpRequired && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-orange-600">
                        <Calendar className="h-4 w-4" />
                        <span>Follow-up: {log.followUpDate ? new Date(log.followUpDate).toLocaleDateString() : 'Required'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Communication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Stakeholder</Label>
              <Select
                value={newLog.stakeholderId?.toString()}
                onValueChange={value => setNewLog({ ...newLog, stakeholderId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stakeholder..." />
                </SelectTrigger>
                <SelectContent>
                  {stakeholders.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newLog.type}
                  onValueChange={value => setNewLog({ ...newLog, type: value as CommunicationLog['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Direction</Label>
                <Select
                  value={newLog.direction}
                  onValueChange={value => setNewLog({ ...newLog, direction: value as CommunicationLog['direction'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={newLog.subject || ''}
                onChange={e => setNewLog({ ...newLog, subject: e.target.value })}
                placeholder="Communication subject..."
              />
            </div>

            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea
                value={newLog.summary || ''}
                onChange={e => setNewLog({ ...newLog, summary: e.target.value })}
                placeholder="Brief summary of the communication..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Outcome</Label>
                <Select
                  value={newLog.outcome}
                  onValueChange={value => setNewLog({ ...newLog, outcome: value as CommunicationLog['outcome'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={newLog.duration || ''}
                  onChange={e => setNewLog({ ...newLog, duration: parseInt(e.target.value) || undefined })}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button
              onClick={handleAddLog}
              disabled={!newLog.stakeholderId || !newLog.subject || !newLog.summary}
            >
              Log Communication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
