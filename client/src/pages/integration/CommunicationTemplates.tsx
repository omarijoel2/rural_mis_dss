import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Mail } from 'lucide-react';

export function CommunicationTemplates() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communication Templates</h1>
          <p className="text-muted-foreground">
            SMS, Email, WhatsApp templates with i18n support
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['SMS', 'Email', 'WhatsApp', 'USSD'].map((channel) => (
          <Card key={channel}>
            <CardHeader>
              <CardTitle className="text-base">{channel}</CardTitle>
              <CardDescription>0 templates</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline" className="w-full">
                New Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Library</CardTitle>
          <CardDescription>All communication templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No templates created yet. Create templates for customer notifications.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
