import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, CheckCircle, Plus, MapPin, Clock, QrCode, Edit, Eye } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { EventDialog } from './EventDialog';
import { AttendanceSheet } from './AttendanceSheet';

interface EngagementEvent {
  id: number;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  description: string;
  expectedAttendance: number;
  actualAttendance: number | null;
  status: string;
  stakeholderGroups: string[];
  qrCode: string;
}

export function EngagementPlanner() {
  const [events, setEvents] = useState<EngagementEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EngagementEvent | null>(null);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EngagementEvent | null>(null);

  useEffect(() => {
    apiClient.get<{ data: EngagementEvent[] }>('/community/events')
      .then(res => {
        const data = res.data || res;
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const pastEvents = events.filter(e => e.status === 'completed');
  const totalAttendance = pastEvents.reduce((sum, e) => sum + (e.actualAttendance || 0), 0);

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setDialogOpen(true);
  };

  const handleEditEvent = (event: EngagementEvent) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const fetchEvents = () => {
    apiClient.get<{ data: EngagementEvent[] }>('/community/events')
      .then(res => {
        const data = res.data || res;
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err));
  };

  const handleSaveEvent = async (eventData: any) => {
    try {
      if (editingEvent) {
        await apiClient.put(`/community/events/${editingEvent.id}`, eventData);
      } else {
        await apiClient.post('/community/events', eventData);
      }
      fetchEvents();
    } catch (err) {
      console.error('Error saving event:', err);
    }
  };

  const handleViewAttendance = (event: EngagementEvent) => {
    setSelectedEvent(event);
    setAttendanceOpen(true);
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      baraza: 'bg-purple-100 text-purple-800',
      meeting: 'bg-blue-100 text-blue-800',
      consultation: 'bg-green-100 text-green-800',
      workshop: 'bg-orange-100 text-orange-800',
      focus_group: 'bg-pink-100 text-pink-800',
      presentation: 'bg-indigo-100 text-indigo-800',
      training: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      baraza: 'Baraza',
      meeting: 'Meeting',
      consultation: 'Consultation',
      workshop: 'Workshop',
      focus_group: 'Focus Group',
      presentation: 'Presentation',
      training: 'Training',
    };
    return labels[type] || type;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const EventCard = ({ event, showAttendance = false }: { event: EngagementEvent; showAttendance?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getEventTypeColor(event.type)}>{getEventTypeLabel(event.type)}</Badge>
              {event.status === 'completed' && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg">{event.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
            
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(event.date)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {event.time}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {event.location}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {showAttendance && event.actualAttendance !== null
                  ? `${event.actualAttendance}/${event.expectedAttendance}`
                  : `${event.expectedAttendance} expected`}
              </div>
            </div>

            {event.stakeholderGroups.length > 0 && (
              <div className="flex gap-1 mt-3">
                {event.stakeholderGroups.map(group => (
                  <Badge key={group} variant="outline" className="text-xs">{group}</Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 ml-4">
            <Button size="sm" variant="outline" onClick={() => handleViewAttendance(event)}>
              <QrCode className="h-4 w-4 mr-1" />
              Attendance
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleEditEvent(event)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stakeholder Engagement Planner</h1>
          <p className="text-muted-foreground mt-1">Plan and track community meetings, barazas, and consultations</p>
        </div>
        <Button onClick={handleCreateEvent}>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttendance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastEvents.length}</div>
            <p className="text-xs text-muted-foreground">Events this year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Turnout</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pastEvents.length > 0
                ? Math.round(
                    pastEvents.reduce((sum, e) => 
                      sum + ((e.actualAttendance || 0) / e.expectedAttendance) * 100, 0
                    ) / pastEvents.length
                  )
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">vs expected</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="upcoming">
                <Calendar className="h-4 w-4 mr-2" />
                Upcoming ({upcomingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                <CheckCircle className="h-4 w-4 mr-2" />
                Past Events ({pastEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading events...</p>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No upcoming events scheduled</p>
                  <Button className="mt-4" onClick={handleCreateEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Your First Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No past events</p>
              ) : (
                <div className="space-y-4">
                  {pastEvents
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(event => (
                      <EventCard key={event.id} event={event} showAttendance />
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editingEvent}
        onSave={handleSaveEvent}
      />

      <AttendanceSheet
        open={attendanceOpen}
        onOpenChange={setAttendanceOpen}
        event={selectedEvent}
      />
    </div>
  );
}
