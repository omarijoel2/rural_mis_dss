import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface Stakeholder {
  id?: number;
  name: string;
  category: string;
  influence: number;
  interest: number;
  engagement: string;
  email?: string;
  phone?: string;
  organization?: string;
  notes?: string;
  isVulnerable?: boolean;
  vulnerableReason?: string;
  status: string;
}

interface StakeholderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stakeholder?: Stakeholder | null;
  onSave: (stakeholder: Stakeholder) => void;
}

const defaultStakeholder: Stakeholder = {
  name: '',
  category: 'Community',
  influence: 3,
  interest: 3,
  engagement: 'monthly',
  email: '',
  phone: '',
  organization: '',
  notes: '',
  isVulnerable: false,
  vulnerableReason: '',
  status: 'active',
};

export function StakeholderDialog({ open, onOpenChange, stakeholder, onSave }: StakeholderDialogProps) {
  const [formData, setFormData] = useState<Stakeholder>(defaultStakeholder);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (stakeholder) {
      setFormData({ ...defaultStakeholder, ...stakeholder });
    } else {
      setFormData(defaultStakeholder);
    }
  }, [stakeholder, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{stakeholder?.id ? 'Edit Stakeholder' : 'Add New Stakeholder'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Stakeholder name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={e => setFormData({ ...formData, organization: e.target.value })}
                placeholder="Organization name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+254 XXX XXX XXX"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={value => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Community">Community</SelectItem>
                  <SelectItem value="Users">Users</SelectItem>
                  <SelectItem value="NGO">NGO</SelectItem>
                  <SelectItem value="Private">Private Sector</SelectItem>
                  <SelectItem value="Vulnerable">Vulnerable Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Influence Level (1-5)</Label>
              <Select
                value={String(formData.influence)}
                onValueChange={value => setFormData({ ...formData, influence: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Interest Level (1-5)</Label>
              <Select
                value={String(formData.interest)}
                onValueChange={value => setFormData({ ...formData, interest: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Engagement Frequency</Label>
              <Select
                value={formData.engagement}
                onValueChange={value => setFormData({ ...formData, engagement: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="as-needed">As Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={value => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-lg bg-orange-50/50">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="vulnerable" className="text-base font-medium">Vulnerable Group Flag</Label>
                <p className="text-sm text-muted-foreground">Mark this stakeholder as requiring special attention</p>
              </div>
              <Switch
                id="vulnerable"
                checked={formData.isVulnerable}
                onCheckedChange={checked => setFormData({ ...formData, isVulnerable: checked })}
              />
            </div>
            
            {formData.isVulnerable && (
              <div className="space-y-2">
                <Label htmlFor="vulnerableReason">Reason for Vulnerability</Label>
                <Input
                  id="vulnerableReason"
                  value={formData.vulnerableReason}
                  onChange={e => setFormData({ ...formData, vulnerableReason: e.target.value })}
                  placeholder="e.g., Elderly, disability, economic hardship, remote location..."
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this stakeholder..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !formData.name}>
            {saving ? 'Saving...' : (stakeholder?.id ? 'Update' : 'Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
