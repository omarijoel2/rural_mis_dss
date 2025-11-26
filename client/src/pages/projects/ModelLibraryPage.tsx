import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Plus, Database, Play, Settings, FileCode } from 'lucide-react';
import { toast } from 'sonner';

interface Model {
  id: string;
  model_name: string;
  engine: string;
  version: string;
  project_id: string | null;
  created_by: string;
  created_at: string;
  runs_count: number;
}

export function ModelLibraryPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRunOpen, setIsRunOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [newModel, setNewModel] = useState({
    model_name: '',
    engine: '',
    version: '',
    project_id: '',
  });
  const [scenarioName, setScenarioName] = useState('');

  const { data: modelsData, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const res = await fetch('/api/models');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success('Model uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setIsCreateOpen(false);
      setNewModel({ model_name: '', engine: '', version: '', project_id: '' });
    },
  });

  const models = modelsData?.data || [];

  const handleRunScenario = () => {
    toast.success(`Scenario "${scenarioName}" started for ${selectedModel?.model_name}`);
    setIsRunOpen(false);
    setScenarioName('');
    setSelectedModel(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Design & Hydraulic Modeling</h1>
          <p className="text-muted-foreground">Manage EPANET/InfoWater models, run scenarios, and calibrate</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Upload Model
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Hydraulic Model</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Model Name *</label>
                <Input
                  placeholder="e.g., Nairobi Distribution Network"
                  value={newModel.model_name}
                  onChange={(e) => setNewModel({ ...newModel, model_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Engine *</label>
                <Select
                  value={newModel.engine}
                  onValueChange={(value) => setNewModel({ ...newModel, engine: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select engine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EPANET">EPANET</SelectItem>
                    <SelectItem value="InfoWater">InfoWater</SelectItem>
                    <SelectItem value="WaterGEMS">WaterGEMS</SelectItem>
                    <SelectItem value="MIKE URBAN">MIKE URBAN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Version</label>
                <Input
                  placeholder="e.g., 2.2"
                  value={newModel.version}
                  onChange={(e) => setNewModel({ ...newModel, version: e.target.value })}
                />
              </div>
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                <FileCode className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Drag & drop model file here</p>
                <p className="text-xs">or click to browse (.inp, .sqlite, .mdb)</p>
              </div>
              <Button
                onClick={() => createMutation.mutate(newModel)}
                disabled={!newModel.model_name || !newModel.engine || createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? 'Uploading...' : 'Upload Model'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" /> Total Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{models.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">EPANET Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {models.filter((m: Model) => m.engine === 'EPANET').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">InfoWater Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {models.filter((m: Model) => m.engine === 'InfoWater').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {models.reduce((sum: number, m: Model) => sum + m.runs_count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Library</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading models...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model Name</TableHead>
                  <TableHead>Engine</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Runs</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No models found
                    </TableCell>
                  </TableRow>
                ) : (
                  models.map((model: Model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">{model.model_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{model.engine}</Badge>
                      </TableCell>
                      <TableCell>{model.version}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {model.project_id ? `PRJ-${model.project_id}` : '-'}
                      </TableCell>
                      <TableCell>{model.created_by}</TableCell>
                      <TableCell>{model.created_at}</TableCell>
                      <TableCell>{model.runs_count}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => {
                              setSelectedModel(model);
                              setIsRunOpen(true);
                            }}
                          >
                            <Play className="h-3 w-3" />
                            Run
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRunOpen} onOpenChange={setIsRunOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Scenario - {selectedModel?.model_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Scenario Name *</label>
              <Input
                placeholder="e.g., Peak Demand 2025"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Parameters (JSON)</label>
              <textarea
                className="w-full h-32 p-3 border rounded-md font-mono text-sm"
                placeholder='{"duration_hours": 24, "pattern": "weekday"}'
              />
            </div>
            <Button
              onClick={handleRunScenario}
              disabled={!scenarioName}
              className="w-full"
            >
              Execute Scenario
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
