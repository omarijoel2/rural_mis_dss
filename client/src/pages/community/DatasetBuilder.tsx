import { useState, useMemo, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Settings, Database, Shield, Clock, Plus, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TransformationStep {
  id: string;
  type: 'filter' | 'group' | 'aggregate' | 'compute';
  label: string;
  config: Record<string, string>;
}

interface PreviewRow {
  [key: string]: string | number;
}

const SOURCE_TABLES = [
  { id: 'committees', name: 'Committees', columns: ['id', 'name', 'community', 'members', 'status', 'complianceScore'] },
  { id: 'vendors', name: 'Vendors', columns: ['id', 'companyName', 'status', 'kycStatus', 'rating'] },
  { id: 'grievances', name: 'Grievances', columns: ['id', 'category', 'severity', 'status', 'location'] },
  { id: 'meetings', name: 'Committee Meetings', columns: ['id', 'committeeId', 'attendance', 'status', 'date'] },
];

const AGGREGATE_FUNCTIONS = ['count', 'sum', 'avg', 'min', 'max'];
const OPERATORS = ['=', '!=', '>', '<', '>=', '<=', 'contains', 'startswith'];

export function DatasetBuilder() {
  const [selectedSource, setSelectedSource] = useState(SOURCE_TABLES[0].id);
  const [transformations, setTransformations] = useState<TransformationStep[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [aggregateOpen, setAggregateOpen] = useState(false);
  const [computeOpen, setComputeOpen] = useState(false);
  const [refreshSchedule, setRefreshSchedule] = useState('daily');
  const [datasetName, setDatasetName] = useState('');

  const currentSource = useMemo(() => SOURCE_TABLES.find(t => t.id === selectedSource), [selectedSource]);

  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);

  // Fetch preview rows from server based on source selection
  useEffect(() => {
    const fetchPreview = async () => {
      try {
        let res: any;
        if (selectedSource === 'committees') {
          res = await apiClient.get('/api/v1/datasets/committees');
        } else if (selectedSource === 'vendors') {
          res = await apiClient.get('/api/procurement/vendors');
        } else if (selectedSource === 'grievances') {
          res = await apiClient.get('/api/crm/tickets');
        } else {
          res = { data: [] };
        }

        const data = res?.data || res || [];
        if (Array.isArray(data)) {
          setPreviewData(data.slice(0, 10));
        } else {
          setPreviewData([]);
        }
      } catch (err) {
        console.error('Failed to load preview data:', err);
        setPreviewData([]);
      }
    };

    fetchPreview();
  }, [selectedSource]);

  const addTransformation = (type: TransformationStep['type'], label: string, config: Record<string, string>) => {
    const newTransform: TransformationStep = {
      id: Date.now().toString(),
      type,
      label,
      config
    };
    setTransformations([...transformations, newTransform]);
  };

  const removeTransformation = (id: string) => {
    setTransformations(transformations.filter(t => t.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Dataset Builder</h1>
          <p className="text-muted-foreground mt-1">Create and configure public datasets with privacy filters and transformations</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> New Dataset</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-4">
          {/* Source Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Source Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Select Source Table</label>
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_TABLES.map(table => (
                      <SelectItem key={table.id} value={table.id}>{table.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-1">
                {currentSource?.columns.map(col => (
                  <Badge key={col} variant="outline" className="text-xs">{col}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transformations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Transformations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {/* Filter Button */}
                <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">+ Filter</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Filter</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Column</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentSource?.columns.map(col => (
                              <SelectItem key={col} value={col}>{col}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Operator</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {OPERATORS.map(op => (
                              <SelectItem key={op} value={op}>{op}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Value</label>
                        <Input placeholder="Enter value" />
                      </div>
                      <Button className="w-full" onClick={() => {
                        addTransformation('filter', 'Filter applied', {});
                        setFilterOpen(false);
                      }}>Add Filter</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Group By Button */}
                <Dialog open={groupOpen} onOpenChange={setGroupOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">+ Group By</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Group By</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Column(s) to Group</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select columns" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentSource?.columns.map(col => (
                              <SelectItem key={col} value={col}>{col}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full" onClick={() => {
                        addTransformation('group', 'Group by applied', {});
                        setGroupOpen(false);
                      }}>Apply Group</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Aggregate Button */}
                <Dialog open={aggregateOpen} onOpenChange={setAggregateOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">+ Aggregate</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Aggregation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Column to Aggregate</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentSource?.columns.map(col => (
                              <SelectItem key={col} value={col}>{col}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Function</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select function" />
                          </SelectTrigger>
                          <SelectContent>
                            {AGGREGATE_FUNCTIONS.map(fn => (
                              <SelectItem key={fn} value={fn}>{fn.toUpperCase()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full" onClick={() => {
                        addTransformation('aggregate', 'Aggregation added', {});
                        setAggregateOpen(false);
                      }}>Add Aggregation</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Compute Field Button */}
                <Dialog open={computeOpen} onOpenChange={setComputeOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">+ Computed Field</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Computed Field</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Field Name</label>
                        <Input placeholder="e.g., ComplianceRatio" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Expression</label>
                        <Input placeholder="e.g., complianceScore / 100" className="font-mono text-xs" />
                      </div>
                      <p className="text-xs text-muted-foreground">Available: {currentSource?.columns.join(', ')}</p>
                      <Button className="w-full" onClick={() => {
                        addTransformation('compute', 'Computed field added', {});
                        setComputeOpen(false);
                      }}>Add Field</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Applied Transformations */}
              {transformations.length > 0 && (
                <div className="mt-4 space-y-2 border-t pt-4">
                  {transformations.map(transform => (
                    <div key={transform.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <Badge className="text-xs">{transform.type.toUpperCase()}</Badge>
                        <span className="text-sm ml-2">{transform.label}</span>
                      </div>
                      <button onClick={() => removeTransformation(transform.id)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">Anonymize IDs</Button>
                <Button variant="outline" size="sm">Redact Names</Button>
                <Button variant="outline" size="sm">Mask Emails</Button>
                <Button variant="outline" size="sm">Aggregate Sensitive</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Applied rules will be shown here</p>
            </CardContent>
          </Card>

          {/* Refresh Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Refresh Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={refreshSchedule} onValueChange={setRefreshSchedule}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never (Manual)</SelectItem>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily (Midnight)</SelectItem>
                  <SelectItem value="weekly">Weekly (Sunday)</SelectItem>
                  <SelectItem value="monthly">Monthly (1st)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Preview & Controls Sidebar */}
        <div className="space-y-4">
          {/* Dataset Config */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dataset Config</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Dataset Name</label>
                <Input placeholder="e.g., Committee Performance" value={datasetName} onChange={e => setDatasetName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Source</label>
                <div className="text-sm text-muted-foreground mt-1">{currentSource?.name}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Transformations</label>
                <div className="text-sm text-muted-foreground mt-1">{transformations.length} applied</div>
              </div>
              <Button className="w-full" onClick={async () => {
                const payload = {
                  title: datasetName || `${currentSource?.name} dataset`,
                  topic: currentSource?.id || selectedSource,
                  license: 'CC BY 4.0',
                  description: `Dataset generated from ${currentSource?.name}`,
                  refreshSchedule,
                  transformations,
                };
                try {
                  const res = await apiClient.post('/api/open-data/catalog', payload);
                  console.log('Dataset registered:', res);
                } catch (err) {
                  console.warn('Failed to register dataset to server; keeping locally (server may not support POST).', err);
                }
              }}>Save Dataset</Button>
            </CardContent>
          </Card>

          {/* Data Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm">Preview</CardTitle>
              <Eye className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-2">
                {previewData.slice(0, 3).map((row, i) => (
                  <div key={i} className="p-2 bg-muted rounded">
                    {Object.entries(row).slice(0, 2).map(([k, v]) => (
                      <div key={k} className="text-xs">
                        <span className="font-medium">{k}:</span> {String(v)}
                      </div>
                    ))}
                  </div>
                ))}
                <p className="text-muted-foreground text-xs italic">+{Math.max(0, previewData.length - 1)} more rows</p>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">CSV Export</Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">GeoJSON Export</Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">API Key</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
