import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface EngagementEvent {
  id?: number;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  description: string;
  expectedAttendance: number;
  stakeholderGroups: string[];
}

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EngagementEvent | null;
  onSave: (event: EngagementEvent) => void;
}

const eventTypes = [
  { value: 'baraza', label: 'Community Baraza' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'focus_group', label: 'Focus Group' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'training', label: 'Training Session' },
];

const stakeholderGroupOptions = [
  'Government',
  'Community',
  'NGO',
  'Private',
  'Users',
  'Vulnerable',
];

export function EventDialog({ open, onOpenChange, event, onSave }: EventDialogProps) {
  const [formData, setFormData] = useState<EngagementEvent>({
    title: '',
    type: 'meeting',
    date: '',
    time: '10:00',
    location: '',
    description: '',
    expectedAttendance: 0,
    stakeholderGroups: [],
  });

  useEffect(() => {
    if (event) {
      setFormData(event);
    } else {
      setFormData({
        title: '',
        type: 'meeting',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        location: '',
        description: '',
        expectedAttendance: 0,
        stakeholderGroups: [],
      });
    }
  }, [event, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const toggleStakeholderGroup = (group: string) => {
    setFormData(prev => ({
      ...prev,
      stakeholderGroups: prev.stakeholderGroups.includes(group)
        ? prev.stakeholderGroups.filter(g => g !== group)
        : [...prev.stakeholderGroups, group],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Create New Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Community Baraza - Water Quality Update"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Event Type</Label>
              <Select value={formData.type} onValueChange={v => setFormData(prev => ({ ...prev, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedAttendance">Expected Attendance</Label>
              <Input
                id="expectedAttendance"
                type="number"
                min={1}
                value={formData.expectedAttendance}
                onChange={e => setFormData(prev => ({ ...prev, expectedAttendance: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Elwak Community Hall"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the event objectives..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Stakeholder Groups</Label>
            <div className="flex flex-wrap gap-3">
              {stakeholderGroupOptions.map(group => (
                <div key={group} className="flex items-center space-x-2">
                  <Checkbox
                    id={`group-${group}`}
                    checked={formData.stakeholderGroups.includes(group)}
                    onCheckedChange={() => toggleStakeholderGroup(group)}
                  />
                  <label htmlFor={`group-${group}`} className="text-sm cursor-pointer">{group}</label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{event ? 'Save Changes' : 'Create Event'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
