import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertTriangle, Plus, BookOpen, Zap } from 'lucide-react';

interface PlaybookStep {
  title: string;
  description: string;
  type?: 'manual' | 'automated' | 'decision';
  duration_minutes?: number;
}

interface Playbook {
  id: string;
  name: string;
  for_category?: string;
  for_severity?: 'critical' | 'high' | 'medium' | 'low';
  steps: PlaybookStep[];
}

export function PlaybooksPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['playbooks'],
    queryFn: () => coreOpsService.playbooks.list({ per_page: 50 }),
  });

  const playbooks = data?.data || [];

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'outline';
    }
  };

  const getStepTypeIcon = (type?: string) => {
    switch (type) {
      case 'automated':
        return <Zap className="h-4 w-4" />;
      case 'decision':
        return <BookOpen className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Playbooks</h1>
          <p className="text-muted-foreground mt-1">Event response automation and runbooks</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Playbook
        </Button>
      </div>

      {/* Loading & Error States */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Loading playbooks...
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading playbooks: {(error as Error).message}
          </AlertDescription>
        </Alert>
      ) : playbooks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No playbooks found. Create one to automate event responses!
          </CardContent>
        </Card>
      ) : (
        /* Playbooks Grid */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {playbooks.map((playbook: Playbook) => (
            <Card key={playbook.id} className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{playbook.name}</CardTitle>
                    {playbook.for_category && (
                      <CardDescription className="text-xs mt-1">
                        For: {playbook.for_category}
                      </CardDescription>
                    )}
                  </div>
                  {playbook.for_severity && (
                    <Badge className={getSeverityColor(playbook.for_severity) as any}>
                      {playbook.for_severity}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 pb-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">
                    {playbook.steps?.length || 0} steps
                  </p>

                  {/* Steps Preview */}
                  <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
                    {playbook.steps?.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-1.5 bg-muted/50 rounded">
                        <span className="text-muted-foreground font-semibold min-w-6">
                          {idx + 1}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{step.title}</div>
                          {step.type && (
                            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                              {getStepTypeIcon(step.type)}
                              <span>{step.type}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>

              <div className="flex gap-2 border-t pt-3">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button size="sm" className="flex-1">
                  Test
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
