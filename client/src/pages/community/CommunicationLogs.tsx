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

export function CommunicationLogs() {
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  
  // Map an incoming grievance/ticket (server) to the CommunicationLog shape used here
  const mapTicketToLog = (t: any): CommunicationLog => ({
    id: Number(t.id),
    stakeholderId: 0,
    stakeholderName: t.location || t.ticketNumber || 'Unknown',
    type: 'other',
    direction: 'inbound',
    subject: t.ticketNumber || t.category || t.subject || 'Communication',
    summary: t.details || t.message || '',
    date: t.createdAt || t.date || new Date().toISOString().split('T')[0],
    duration: undefined,
    outcome: t.status === 'resolved' ? 'positive' : (t.status === 'in-progress' || t.status === 'assigned' ? 'pending' : 'neutral'),
    followUpRequired: false,
    followUpDate: undefined,
    createdBy: t.createdBy || t.sender || 'System',
  });

  useEffect(() => {
    // Fetch communication-like tickets from CRM (server)
    apiClient.get<{ data: any[] }>('/api/crm/tickets')
      .then(res => {
        const data = (res && (res as any).data) || res || [];
        if (Array.isArray(data)) {
          setLogs(data.map(mapTicketToLog));
        }
      })
      .catch(err => console.error('Failed to load communication logs:', err));
  }, []);
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
    // Try community route, then fallback to v1 datasets if not available
    apiClient.get<{ data: Stakeholder[] }>('/community/stakeholders')
      .catch(() => apiClient.get<{ data: Stakeholder[] }>('/api/v1/datasets/stakeholders'))
      .then(res => {
        const data = (res && (res as any).data) || res || [];
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

    const payload = {
      category: 'communication',
      details: newLog.summary,
      location: stakeholder?.name,
      subject: newLog.subject,
      status: 'new',
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Post to CRM tickets endpoint (used here as a communication store)
    apiClient.post('/api/crm/tickets', payload)
      .then((res: any) => {
        const created = (res && res.data) || res || payload;
        const mapped = mapTicketToLog(created);
        setLogs(prev => [mapped, ...prev]);
        setShowAddDialog(false);
        setNewLog({
          type: 'phone',
          direction: 'outbound',
          outcome: 'neutral',
          followUpRequired: false,
        });
      })
      .catch(err => {
        console.error('Failed to create communication log:', err);
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
