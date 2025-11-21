import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { crmService, type Interaction } from '../../services/crm.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Search, Plus, Phone, Mail, MessageSquare, Globe, MapPin, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

const channelOptions = ['phone', 'email', 'sms', 'web_portal', 'walk_in', 'field_visit'] as const;
const channelIcons = {
  phone: Phone,
  email: Mail,
  sms: Smartphone,
  web_portal: Globe,
  walk_in: MapPin,
  field_visit: MapPin,
};

export function InteractionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<typeof channelOptions[number] | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    account_no: '',
    channel: 'phone' as typeof channelOptions[number],
    subject: '',
    message: '',
  });

  const { data: interactionsData, isLoading } = useQuery({
    queryKey: ['interactions', search, channelFilter],
    queryFn: () => {
      const filters: any = { per_page: 100 };
      if (search) filters.search = search;
      if (channelFilter !== 'all') filters.channel = channelFilter;
      return crmService.getInteractions(filters);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => crmService.createInteraction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
      setIsDialogOpen(false);
      setFormData({ account_no: '', channel: 'phone', subject: '', message: '' });
      toast.success('Interaction logged successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to log interaction');
    },
  });

  const interactions = interactionsData?.data || [];

  const getChannelIcon = (channel: string) => {
    const Icon = channelIcons[channel as keyof typeof channelIcons] || MessageSquare;
    return <Icon className="h-4 w-4" />;
  };

  const getChannelColor = (channel: string) => {
    const colors: Record<string, string> = {
      phone: 'bg-blue-100 text-blue-800',
      email: 'bg-purple-100 text-purple-800',
      sms: 'bg-green-100 text-green-800',
      web_portal: 'bg-orange-100 text-orange-800',
      walk_in: 'bg-yellow-100 text-yellow-800',
      field_visit: 'bg-red-100 text-red-800',
    };
    return colors[channel] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Interactions</h1>
          <p className="text-muted-foreground">Log and track all customer touchpoints</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Interaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Interaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input
                  placeholder="e.g., ACC-12345"
                  value={formData.account_no}
                  onChange={(e) => setFormData({ ...formData, account_no: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={formData.channel} onValueChange={(val: any) => setFormData({ ...formData, channel: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {channelOptions.map((ch) => (
                      <SelectItem key={ch} value={ch}>
                        {ch.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Brief subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Interaction details"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.account_no || !formData.subject || !formData.message || createMutation.isPending}
              >
                {createMutation.isPending ? 'Logging...' : 'Log Interaction'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by account number or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={channelFilter} onValueChange={(val: any) => setChannelFilter(val)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                {channelOptions.map((ch) => (
                  <SelectItem key={ch} value={ch}>
                    {ch.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading interactions...</div>
          ) : interactions.length > 0 ? (
            <div className="space-y-3">
              {interactions.map((interaction: Interaction) => (
                <div key={interaction.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getChannelColor(interaction.channel)}`}>
                          {getChannelIcon(interaction.channel)}
                        </div>
                        <div>
                          <Link
                            to={`/crm/accounts/${interaction.account_no}`}
                            className="font-semibold hover:underline text-blue-600"
                          >
                            {interaction.account_no}
                          </Link>
                          <p className="text-sm text-muted-foreground">{interaction.subject}</p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{interaction.message}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {interaction.channel.replace('_', ' ')}
                        </Badge>
                        <span>{new Date(interaction.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No interactions found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {channelOptions.map((ch) => (
          <Card key={ch}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-2">
                <div className={`p-3 rounded-lg ${getChannelColor(ch)}`}>
                  {getChannelIcon(ch)}
                </div>
                <p className="text-sm font-medium capitalize">{ch.replace('_', ' ')}</p>
                <p className="text-2xl font-bold">
                  {interactions.filter(i => i.channel === ch).length}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
