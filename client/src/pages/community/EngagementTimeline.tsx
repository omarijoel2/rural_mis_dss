import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '../../lib/api-client';
import { Calendar, MessageSquare, Users, Phone, Mail, CheckCircle, XCircle, Clock } from 'lucide-react';

interface EngagementEvent {
  id: number;
  stakeholderId: number;
  stakeholderName?: string;
  type: string;
  date: string;
  outcome: string;
  notes: string;
}

export function EngagementTimeline() {
  const [events, setEvents] = useState<EngagementEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<{ data: EngagementEvent[] }>('/community/engagement-history')
      .then(res => {
        const data = res.data || res;
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'consultation': return <MessageSquare className="h-4 w-4" />;
      case 'focus_group': return <Users className="h-4 w-4" />;
      case 'phone_call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'negative': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <div className="p-4">Loading engagement history...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Engagement Timeline</h2>
      
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
        
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event.id} className="relative pl-10">
              <div className="absolute left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                {getTypeIcon(event.type)}
              </div>
              
              <Card>
                <CardContent className="py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{event.type.replace('_', ' ')}</span>
                        <Badge className={getOutcomeColor(event.outcome)}>
                          {getOutcomeIcon(event.outcome)}
                          <span className="ml-1 capitalize">{event.outcome}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.notes}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {events.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No engagement history yet
          </CardContent>
        </Card>
      )}
    </div>
  );
}
