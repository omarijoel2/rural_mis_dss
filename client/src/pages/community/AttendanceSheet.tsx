import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, UserPlus, Users, Clock, CheckCircle, Download } from 'lucide-react';
import { apiClient } from '../../lib/api-client';

interface Attendee {
  id: number;
  name: string;
  organization: string;
  phone: string;
  checkedIn: boolean;
  checkinTime: string | null;
}

interface EngagementEvent {
  id: number;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  qrCode: string;
  expectedAttendance: number;
  actualAttendance: number | null;
  status: string;
}

interface AttendanceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EngagementEvent | null;
}

export function AttendanceSheet({ open, onOpenChange, event }: AttendanceSheetProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkinForm, setCheckinForm] = useState({ name: '', organization: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (event && open) {
      setLoading(true);
      apiClient.get<{ data: Attendee[] }>(`/community/events/${event.id}/attendance`)
        .then(res => {
          const data = res.data || res;
          setAttendees(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [event, open]);

  const fetchAttendance = () => {
    if (!event) return;
    apiClient.get<{ data: Attendee[] }>(`/community/events/${event.id}/attendance`)
      .then(res => {
        const data = res.data || res;
        setAttendees(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err));
  };

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setSubmitting(true);
    try {
      await apiClient.post(`/community/events/${event.id}/checkin`, checkinForm);
      setCheckinForm({ name: '', organization: '', phone: '' });
      fetchAttendance();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const exportAttendance = () => {
    if (!event) return;
    const headers = ['Name', 'Organization', 'Phone', 'Check-in Time'];
    const csvContent = [
      headers.join(','),
      ...attendees.map(a => [
        `"${a.name}"`,
        `"${a.organization}"`,
        a.phone,
        a.checkinTime || 'N/A',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${event.qrCode}_${event.date}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Attendance - {event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold">{attendees.length}</div>
              <div className="text-xs text-muted-foreground">Checked In</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold">{event.expectedAttendance}</div>
              <div className="text-xs text-muted-foreground">Expected</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold">
                {Math.round((attendees.length / event.expectedAttendance) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Turnout</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="checkin" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="checkin">
              <UserPlus className="h-4 w-4 mr-1" />
              Check-In
            </TabsTrigger>
            <TabsTrigger value="qr">
              <QrCode className="h-4 w-4 mr-1" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="list">
              <Users className="h-4 w-4 mr-1" />
              Attendees
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checkin" className="mt-4">
            <form onSubmit={handleCheckin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={checkinForm.name}
                  onChange={e => setCheckinForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter attendee name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={checkinForm.organization}
                  onChange={e => setCheckinForm(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="e.g., Elwak Community, County Water Dept"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={checkinForm.phone}
                  onChange={e => setCheckinForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+254..."
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                <CheckCircle className="h-4 w-4 mr-2" />
                {submitting ? 'Checking In...' : 'Check In Attendee'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="qr" className="mt-4">
            <div className="text-center space-y-4">
              <div className="bg-white p-8 rounded-lg border-2 border-dashed inline-block">
                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
                  <div className="text-center">
                    <QrCode className="h-24 w-24 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm font-mono text-gray-600">{event.qrCode}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Scan this QR code for self-service check-in
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download QR
                </Button>
                <Button variant="outline" size="sm">
                  Print Sign-In Sheet
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Attendee List ({attendees.length})</h4>
              <Button size="sm" variant="outline" onClick={exportAttendance}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
            {loading ? (
              <p className="text-center text-muted-foreground py-4">Loading...</p>
            ) : attendees.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No attendees checked in yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {attendees.map(attendee => (
                  <div key={attendee.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{attendee.name}</p>
                      <p className="text-sm text-muted-foreground">{attendee.organization}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <Clock className="h-3 w-3 mr-1" />
                        {attendee.checkinTime}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
