import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Users, Calendar, MessageSquare, Phone, Mail, Plus, Copy, Trash2 } from 'lucide-react';

interface EngagementTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  activities: EngagementActivity[];
  frequency: string;
}

interface EngagementActivity {
  id: number;
  type: string;
  description: string;
  daysFromStart: number;
}

const defaultTemplates: EngagementTemplate[] = [
  {
    id: 1,
    name: 'Community Consultation',
    description: 'Standard community consultation process for major projects',
    category: 'Community',
    frequency: 'per-project',
    activities: [
      { id: 1, type: 'meeting', description: 'Initial stakeholder identification meeting', daysFromStart: 0 },
      { id: 2, type: 'consultation', description: 'Public notice and information session', daysFromStart: 7 },
      { id: 3, type: 'focus_group', description: 'Focus group discussions with affected groups', daysFromStart: 14 },
      { id: 4, type: 'meeting', description: 'Feedback consolidation meeting', daysFromStart: 21 },
      { id: 5, type: 'email', description: 'Share consultation report with stakeholders', daysFromStart: 28 },
    ]
  },
  {
    id: 2,
    name: 'Vulnerable Group Outreach',
    description: 'Special engagement plan for vulnerable community members',
    category: 'Vulnerable',
    frequency: 'quarterly',
    activities: [
      { id: 1, type: 'phone_call', description: 'Check-in call to verify water access', daysFromStart: 0 },
      { id: 2, type: 'meeting', description: 'Home visit for special needs assessment', daysFromStart: 7 },
      { id: 3, type: 'email', description: 'Share support resources and assistance programs', daysFromStart: 14 },
    ]
  },
  {
    id: 3,
    name: 'Government Liaison',
    description: 'Regular engagement with government stakeholders',
    category: 'Government',
    frequency: 'monthly',
    activities: [
      { id: 1, type: 'email', description: 'Monthly progress report', daysFromStart: 0 },
      { id: 2, type: 'meeting', description: 'Quarterly review meeting', daysFromStart: 30 },
    ]
  },
  {
    id: 4,
    name: 'NGO Partnership',
    description: 'Coordination with NGO partners',
    category: 'NGO',
    frequency: 'bi-weekly',
    activities: [
      { id: 1, type: 'meeting', description: 'Coordination call', daysFromStart: 0 },
      { id: 2, type: 'email', description: 'Share field activity updates', daysFromStart: 7 },
    ]
  },
];

export function EngagementPlanTemplates() {
  const [templates, setTemplates] = useState<EngagementTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EngagementTemplate | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applyDate, setApplyDate] = useState('');

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

  const handleApplyTemplate = () => {
    if (!selectedTemplate || !applyDate) return;
    
    const startDate = new Date(applyDate);
    const scheduledActivities = selectedTemplate.activities.map(activity => {
      const activityDate = new Date(startDate);
      activityDate.setDate(activityDate.getDate() + activity.daysFromStart);
      return {
        ...activity,
        scheduledDate: activityDate.toISOString().split('T')[0],
      };
    });

    console.log('Scheduled activities:', scheduledActivities);
    alert(`Template "${selectedTemplate.name}" applied! ${scheduledActivities.length} activities scheduled starting ${applyDate}`);
    setShowApplyDialog(false);
    setSelectedTemplate(null);
    setApplyDate('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Engagement Plan Templates</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <Card key={template.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="mt-1">{template.description}</CardDescription>
                </div>
                <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="capitalize">{template.frequency.replace('-', ' ')}</span>
                  <span>•</span>
                  <span>{template.activities.length} activities</span>
                </div>

                <div className="space-y-1">
                  {template.activities.slice(0, 3).map(activity => (
                    <div key={activity.id} className="flex items-center gap-2 text-sm">
                      {getTypeIcon(activity.type)}
                      <span className="truncate">{activity.description}</span>
                      <span className="text-muted-foreground ml-auto text-xs">Day {activity.daysFromStart}</span>
                    </div>
                  ))}
                  {template.activities.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{template.activities.length - 3} more activities</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowApplyDialog(true);
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Apply
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Engagement Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Applying template: <strong>{selectedTemplate?.name}</strong>
            </p>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={applyDate}
                onChange={e => setApplyDate(e.target.value)}
              />
            </div>
            {selectedTemplate && applyDate && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Scheduled Activities:</p>
                <div className="space-y-1 text-sm">
                  {selectedTemplate.activities.map(activity => {
                    const startDate = new Date(applyDate);
                    startDate.setDate(startDate.getDate() + activity.daysFromStart);
                    return (
                      <div key={activity.id} className="flex justify-between">
                        <span>{activity.description}</span>
                        <span className="text-muted-foreground">{startDate.toLocaleDateString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>Cancel</Button>
            <Button onClick={handleApplyTemplate} disabled={!applyDate}>Apply Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
