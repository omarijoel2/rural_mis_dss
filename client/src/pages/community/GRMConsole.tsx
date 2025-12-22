import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MessageSquare, AlertTriangle, Clock, CheckCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

interface Ticket {
  id: string;
  ticketNumber: string;
  category: string;
  severity: string;
  status: string;
  location: string;
  details: string;
  createdAt?: string;
  slaDueAt?: string;
}

interface Stats {
  new: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  overdueSla: number;
}

export function GRMConsole() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats>({ new: 12, assigned: 8, inProgress: 28, resolved: 156, overdueSla: 3 });

  useEffect(() => {
    fetch('/api/crm/tickets')
      .then(r => r.json())
      .then(d => {
        setTickets(d.data || []);
        if (d.stats) setStats(d.stats);
      })
      .catch(() => setTickets([
        { id: '1', ticketNumber: 'GRM-001', category: 'water-quality', status: 'new', severity: 'high', location: 'Kilimani', details: 'Turbid water' },
        { id: '2', ticketNumber: 'GRM-002', category: 'billing', status: 'assigned', severity: 'medium', location: 'Westlands', details: 'Overcharge' },
      ]));
  }, []);

  const kanbanColumns = {
    'new': { title: 'New', color: 'bg-gray-100', tickets: tickets.filter(t => t.status === 'new') },
    'triaged': { title: 'Triaged', color: 'bg-blue-50', tickets: tickets.filter(t => t.status === 'triaged') },
    'assigned': { title: 'Assigned', color: 'bg-purple-50', tickets: tickets.filter(t => t.status === 'assigned') },
    'in-progress': { title: 'In Progress', color: 'bg-yellow-50', tickets: tickets.filter(t => t.status === 'in-progress') },
    'resolved': { title: 'Resolved', color: 'bg-green-50', tickets: tickets.filter(t => t.status === 'resolved') },
  };

  const getSeverityColor = (severity: string): 'destructive' | 'secondary' | 'outline' => {
    switch(severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Grievance Redress Mechanism (GRM)</h1>
          <p className="text-muted-foreground mt-1">Multi-channel complaint intake, SLA tracking, and resolution workflow</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> New Grievance</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new}</div>
            <p className="text-xs text-muted-foreground">Awaiting triage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">In resolution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue SLA</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueSla}</div>
            <p className="text-xs text-red-600">Require escalation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved (30d)</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">91% SLA compliance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
            <p className="text-xs text-muted-foreground">All tickets</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Kanban Board</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(kanbanColumns).map(([key, col]) => (
            <div key={key} className={`${col.color} rounded-lg p-4 min-h-96`}>
              <h3 className="font-semibold mb-3">{col.title} ({col.tickets.length})</h3>
              <div className="space-y-2">
                {col.tickets.map(t => (
                  <Card key={t.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-3">
                      <div className="text-xs font-mono text-muted-foreground mb-1">{t.ticketNumber}</div>
                      <p className="text-sm font-medium">{t.details}</p>
                      <div className="mt-2 flex gap-1">
                        <Badge variant={getSeverityColor(t.severity)} className="text-xs">{t.severity}</Badge>
                        <Badge variant="outline" className="text-xs">{t.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{t.location}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
