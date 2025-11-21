import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, CheckCircle2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface Anomaly {
  id: string;
  source_type: string;
  source_id: string;
  signal: string;
  ts: string;
  score: number;
  pattern: string;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';
  triage?: {
    suspected_cause: string;
    suggested_action: string;
  };
}

export default function AnomaliesInboxPage() {
  const [filters, setFilters] = useState({
    signal: 'all',
    scheme_id: '',
    score_min: 0.5,
    status: 'new',
  });

  const [selectedAnomalies, setSelectedAnomalies] = useState<Set<string>>(new Set());
  const [selectedAnomaly, setSelectedAnomaly] = useState<string | null>(null);

  const { data: anomalies, refetch } = useQuery({
    queryKey: ['anomalies', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.signal !== 'all') params.append('signal', filters.signal);
      if (filters.scheme_id) params.append('scheme_id', filters.scheme_id);
      params.append('score_min', filters.score_min.toString());
      if (filters.status !== 'all') params.append('status', filters.status);
      
      const res = await apiClient.get(`/api/v1/dsa/anomalies?${params}`);
      return (res as any).data.data as Anomaly[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[], status: string }) => {
      const res = await apiClient.post('/api/v1/dsa/anomalies/bulk-update', { ids, status });
      return (res as any).data;
    },
    onSuccess: () => {
      toast.success('Anomalies updated successfully');
      setSelectedAnomalies(new Set());
      refetch();
    },
  });

  const createWorkOrderMutation = useMutation({
    mutationFn: async (anomalyId: string) => {
      const res = await apiClient.post(`/api/v1/dsa/anomalies/${anomalyId}/create-work-order`);
      return (res as any).data;
    },
    onSuccess: () => {
      toast.success('Work order created successfully');
      refetch();
    },
  });

  const toggleAnomaly = (id: string) => {
    const newSet = new Set(selectedAnomalies);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedAnomalies(newSet);
  };

  const handleBulkAction = (status: string) => {
    updateStatusMutation.mutate({
      ids: Array.from(selectedAnomalies),
      status,
    });
  };

  // Sample signal data for visualization
  const selectedAnomalyData = anomalies?.find(a => a.id === selectedAnomaly);
  const signalData = selectedAnomalyData ? [
    { ts: '00:00', value: 120, threshold: 150 },
    { ts: '04:00', value: 125, threshold: 150 },
    { ts: '08:00', value: 280, threshold: 150 }, // Anomaly
    { ts: '12:00', value: 130, threshold: 150 },
    { ts: '16:00', value: 135, threshold: 150 },
    { ts: '20:00', value: 128, threshold: 150 },
  ] : [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Anomalies Inbox</h1>
        <p className="text-muted-foreground">ML-powered anomaly detection and triage</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filters.signal} onValueChange={(v) => setFilters({ ...filters, signal: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Signal type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Signals</SelectItem>
                <SelectItem value="flow">Flow</SelectItem>
                <SelectItem value="pressure">Pressure</SelectItem>
                <SelectItem value="consumption">Consumption</SelectItem>
                <SelectItem value="quality">Quality</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="false_positive">False Positive</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Min score (0-1)"
              value={filters.score_min}
              onChange={(e) => setFilters({ ...filters, score_min: parseFloat(e.target.value) })}
              step="0.1"
              min="0"
              max="1"
            />

            {selectedAnomalies.size > 0 && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('acknowledged')}>
                  Acknowledge ({selectedAnomalies.size})
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('false_positive')}>
                  Mark False
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detected Anomalies</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Signal</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Pattern</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anomalies?.map((anomaly) => (
                  <TableRow
                    key={anomaly.id}
                    className={selectedAnomaly === anomaly.id ? 'bg-muted' : ''}
                    onClick={() => setSelectedAnomaly(anomaly.id)}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedAnomalies.has(anomaly.id)}
                        onCheckedChange={() => toggleAnomaly(anomaly.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="text-sm">{new Date(anomaly.ts).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{anomaly.signal}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={anomaly.score > 0.8 ? 'destructive' : anomaly.score > 0.6 ? 'default' : 'secondary'}>
                        {anomaly.score.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{anomaly.pattern}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          createWorkOrderMutation.mutate(anomaly.id);
                        }}
                      >
                        <Wrench className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selectedAnomalyData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Signal Explorer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={signalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="ts" />
                        <YAxis />
                        <Tooltip />
                        <ReferenceLine y={150} stroke="red" strokeDasharray="3 3" label="Threshold" />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Triage Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Suspected Cause</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAnomalyData.triage?.suspected_cause || 'Analyzing...'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Suggested Action</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAnomalyData.triage?.suggested_action || 'No recommendation'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatusMutation.mutate({ ids: [selectedAnomalyData.id], status: 'acknowledged' })}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => createWorkOrderMutation.mutate(selectedAnomalyData.id)}
                    >
                      Create Work Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
