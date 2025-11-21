import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Plus, Trash2, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";

interface EWSRule {
  id: string;
  name: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  signals: Array<{
    tag: string;
    operator: string;
    threshold: number;
  }>;
  actions: {
    channels: string[];
    escalation_chain: string[];
  };
}

interface EWSAlert {
  id: string;
  ews_rule_id: string;
  rule_name: string;
  status: 'new' | 'acknowledged' | 'resolved' | 'escalated';
  trigger_values: Record<string, number>;
  acknowledged_by?: string;
  acknowledged_at?: string;
  response_time_minutes?: number;
  created_at: string;
}

export default function EWSConsolePage() {
  const [activeTab, setActiveTab] = useState<'rules' | 'alerts'>('alerts');
  const [ruleFormData, setRuleFormData] = useState({
    name: '',
    description: '',
    priority: 'medium' as const,
    enabled: true,
    signals: [{ tag: '', operator: '>', threshold: 0 }],
    channels: [] as string[],
    quiet_hours_start: null as number | null,
    quiet_hours_end: null as number | null,
  });

  const { data: rules, refetch: refetchRules } = useQuery({
    queryKey: ['ews-rules'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/dsa/ews/rules');
      return (res as any).data.data as EWSRule[];
    },
  });

  const { data: alerts, refetch: refetchAlerts } = useQuery({
    queryKey: ['ews-alerts'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/dsa/ews/alerts');
      return (res as any).data.data as EWSAlert[];
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: async (data: typeof ruleFormData) => {
      const res = await apiClient.post('/api/v1/dsa/ews/rules', data);
      return (res as any).data;
    },
    onSuccess: () => {
      toast.success('EWS rule created successfully');
      refetchRules();
      // Reset form
      setRuleFormData({
        name: '',
        description: '',
        priority: 'medium',
        enabled: true,
        signals: [{ tag: '', operator: '>', threshold: 0 }],
        channels: [],
        quiet_hours_start: null,
        quiet_hours_end: null,
      });
    },
    onError: () => {
      toast.error('Failed to create EWS rule');
    },
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const res = await apiClient.post(`/api/v1/dsa/ews/alerts/${alertId}/acknowledge`);
      return (res as any).data;
    },
    onSuccess: () => {
      toast.success('Alert acknowledged');
      refetchAlerts();
    },
  });

  const addSignal = () => {
    setRuleFormData({
      ...ruleFormData,
      signals: [...ruleFormData.signals, { tag: '', operator: '>', threshold: 0 }],
    });
  };

  const updateSignal = (index: number, field: string, value: any) => {
    const signals = [...ruleFormData.signals];
    signals[index] = { ...signals[index], [field]: value };
    setRuleFormData({ ...ruleFormData, signals });
  };

  const removeSignal = (index: number) => {
    setRuleFormData({
      ...ruleFormData,
      signals: ruleFormData.signals.filter((_, i) => i !== index),
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Early Warning System</h1>
        <p className="text-muted-foreground">Configure threshold rules and manage alerts</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList>
          <TabsTrigger value="alerts">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
            {alerts && alerts.filter(a => a.status === 'new').length > 0 && (
              <Badge className="ml-2" variant="destructive">
                {alerts.filter(a => a.status === 'new').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rules">Rules Builder</TabsTrigger>
        </TabsList>

        {/* Alerts Feed Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>Real-time early warning notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Triggered</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts?.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.rule_name}</TableCell>
                      <TableCell>
                        <Badge variant={
                          alert.status === 'new' ? 'destructive' :
                          alert.status === 'acknowledged' ? 'secondary' :
                          alert.status === 'resolved' ? 'default' : 'outline'
                        }>
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(alert.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {alert.response_time_minutes ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">{alert.response_time_minutes}m</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                          disabled={alert.status !== 'new'}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {(!alerts || alerts.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No active alerts</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alert Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">New Alerts</p>
                    <p className="text-2xl font-bold">{alerts?.filter(a => a.status === 'new').length || 0}</p>
                  </div>
                  <Badge variant="destructive" className="h-8 w-8 rounded-full flex items-center justify-center">
                    !
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Acknowledged</p>
                    <p className="text-2xl font-bold">{alerts?.filter(a => a.status === 'acknowledged').length || 0}</p>
                  </div>
                  <Badge variant="secondary" className="h-8 w-8 rounded-full flex items-center justify-center">
                    ⏱
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold">{alerts?.filter(a => a.status === 'resolved').length || 0}</p>
                  </div>
                  <Badge variant="default" className="h-8 w-8 rounded-full flex items-center justify-center">
                    ✓
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response</p>
                    <p className="text-2xl font-bold">
                      {alerts && alerts.filter(a => a.response_time_minutes).length > 0
                        ? Math.round(
                            alerts.filter(a => a.response_time_minutes).reduce((sum, a) => sum + (a.response_time_minutes || 0), 0) /
                            alerts.filter(a => a.response_time_minutes).length
                          )
                        : 0}m
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rules Builder Tab */}
        <TabsContent value="rules" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Rule</CardTitle>
                <CardDescription>Define threshold-based alert rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Rule Name</Label>
                  <Input
                    value={ruleFormData.name}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                    placeholder="e.g., Critical Pressure Drop"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={ruleFormData.description}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                    placeholder="Describe when this rule should trigger..."
                  />
                </div>

                <div>
                  <Label>Priority</Label>
                  <Select value={ruleFormData.priority} onValueChange={(v: any) => setRuleFormData({ ...ruleFormData, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Signal Conditions</Label>
                  <div className="space-y-2 mt-2">
                    {ruleFormData.signals.map((signal, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Input
                            placeholder="Tag name"
                            value={signal.tag}
                            onChange={(e) => updateSignal(index, 'tag', e.target.value)}
                          />
                        </div>
                        <Select value={signal.operator} onValueChange={(v) => updateSignal(index, 'operator', v)}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value=">">&gt;</SelectItem>
                            <SelectItem value="<">&lt;</SelectItem>
                            <SelectItem value=">=">&gt;=</SelectItem>
                            <SelectItem value="<=">&lt;=</SelectItem>
                            <SelectItem value="=">=</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          className="w-24"
                          placeholder="Value"
                          value={signal.threshold}
                          onChange={(e) => updateSignal(index, 'threshold', parseFloat(e.target.value))}
                        />
                        {ruleFormData.signals.length > 1 && (
                          <Button size="sm" variant="ghost" onClick={() => removeSignal(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button size="sm" variant="outline" onClick={addSignal} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Signal
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Enabled</Label>
                  <Switch
                    checked={ruleFormData.enabled}
                    onCheckedChange={(v) => setRuleFormData({ ...ruleFormData, enabled: v })}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => createRuleMutation.mutate(ruleFormData)}
                  disabled={!ruleFormData.name || ruleFormData.signals.length === 0 || createRuleMutation.isPending}
                >
                  Create Rule
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Configured Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Signals</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules?.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(rule.priority) as any}>
                            {rule.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {rule.signals.length} condition{rule.signals.length > 1 ? 's' : ''}
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.enabled ? 'default' : 'outline'}>
                            {rule.enabled ? 'Active' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">Edit</Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
