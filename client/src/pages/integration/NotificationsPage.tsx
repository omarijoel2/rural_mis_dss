import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Bell, Mail, MessageSquare, Webhook, Plus, Edit, Trash2, Send } from 'lucide-react';

export function NotificationsPage() {
  const [channels] = useState([
    { id: 1, name: 'Email Notifications', type: 'email', status: 'active', config: 'SendGrid' },
    { id: 2, name: 'SMS Alerts', type: 'sms', status: 'active', config: 'Twilio' },
    { id: 3, name: 'Slack Integration', type: 'slack', status: 'active', config: 'Webhook' },
  ]);

  const [templates] = useState([
    { id: 1, key: 'alert_system_down', name: 'System Alert', subject: 'System Downtime Alert', vars: 4 },
    { id: 2, key: 'report_generated', name: 'Report Ready', subject: 'Your Report is Ready', vars: 3 },
    { id: 3, key: 'payment_received', name: 'Payment Confirmation', subject: 'Payment Received', vars: 5 },
  ]);

  const [queue] = useState([
    { id: 1, template: 'alert_system_down', recipient: 'admin@example.com', status: 'sent', channel: 'email' },
    { id: 2, template: 'report_generated', recipient: '+254712345678', status: 'pending', channel: 'sms', retry: 2 },
    { id: 3, template: 'payment_received', recipient: 'ops-team', status: 'sent', channel: 'slack' },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Notifications</h1>
        <p className="text-muted-foreground">Multi-channel notification management with templates and delivery tracking</p>
      </div>

      <Tabs defaultValue="channels" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Notification Channels</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Channel
            </Button>
          </div>

          <div className="space-y-2">
            {channels.map(channel => (
              <Card key={channel.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div className="flex items-center gap-3">
                      {channel.type === 'email' && <Mail className="h-5 w-5 text-blue-500" />}
                      {channel.type === 'sms' && <MessageSquare className="h-5 w-5 text-green-500" />}
                      {channel.type === 'slack' && <Webhook className="h-5 w-5 text-purple-500" />}
                      <div>
                        <p className="font-medium">{channel.name}</p>
                        <p className="text-xs text-muted-foreground">{channel.type.toUpperCase()}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">SERVICE</p>
                      <p className="text-sm font-medium mt-1">{channel.config}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">STATUS</p>
                      <Badge className="mt-1 bg-green-100 text-green-800">{channel.status}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">MESSAGES/DAY</p>
                      <p className="text-sm font-medium mt-1">1,245</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Notification Templates</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="font-mono text-xs">{template.key}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Subject Line:</p>
                    <p className="text-sm bg-gray-50 p-2 rounded">{template.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Variables: {template.vars}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1"><Edit className="h-3 w-3 mr-1" />Edit</Button>
                    <Button size="sm" variant="outline" className="flex-1"><Send className="h-3 w-3 mr-1" />Test</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <h2 className="text-lg font-semibold">Delivery Queue</h2>

          <div className="space-y-2">
            {queue.map(item => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <p className="text-sm font-medium">{item.template}</p>
                      <p className="text-xs text-muted-foreground">{item.recipient}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">CHANNEL</p>
                      <Badge variant="outline" className="mt-1">{item.channel}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">STATUS</p>
                      <Badge 
                        className={`mt-1 ${item.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    {item.retry && (
                      <div>
                        <p className="text-xs text-muted-foreground">RETRIES</p>
                        <p className="text-sm font-medium mt-1">{item.retry}/3</p>
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      {item.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline">Retry</Button>
                          <Button size="sm" variant="outline" className="text-red-500">Cancel</Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 text-base">Queue Stats</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-1">
              <p>• Total Sent Today: 3,421</p>
              <p>• Pending: 8</p>
              <p>• Failed (24h): 2</p>
              <p>• Delivery Rate: 99.94%</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
