import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Webhook } from 'lucide-react';

export function WebhookManager() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhook Manager</h1>
          <p className="text-muted-foreground">
            Configure webhooks for event notifications and callbacks
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Webhook
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Webhooks</CardTitle>
          <CardDescription>Event subscriptions and delivery logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Webhook className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No webhooks configured. Create your first webhook above.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
