import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hydrometService, CreateSourceData } from '../../services/hydromet.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, FileText, Download, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SourceBatchImportDialogProps {
  open: boolean;
  onClose: () => void;
}

const CSV_TEMPLATE = `code,name,kind_id,status_id,catchment,capacity_m3_per_day,latitude,longitude
SRC001,Main Borehole,1,1,Upper Catchment,500,3.1234,36.5678
SRC002,River Intake,2,1,Lower Catchment,1000,3.2345,36.6789`;

const CSV_HEADERS = ['code', 'name', 'kind_id', 'status_id', 'catchment', 'capacity_m3_per_day', 'latitude', 'longitude', 'elevation_m', 'depth_m', 'static_level_m', 'dynamic_level_m', 'permit_no', 'quality_risk_id'];

export function SourceBatchImportDialog({ open, onClose }: SourceBatchImportDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);

  const importMutation = useMutation({
    mutationFn: (sources: Partial<CreateSourceData>[]) => hydrometService.batchImportSources(sources),
    onSuccess: (data) => {
      setImportResult({ imported: data.imported, errors: data.errors });
      if (data.imported > 0) {
        queryClient.invalidateQueries({ queryKey: ['hydromet-sources'] });
        toast.success(`Successfully imported ${data.imported} sources`);
      }
      if (data.errors.length > 0) {
        toast.warning(`${data.errors.length} rows had errors`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to import sources');
    },
  });

  const parseCSV = (csv: string): { sources: Partial<CreateSourceData>[]; errors: string[] } => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
      return { sources: [], errors: ['CSV must have a header row and at least one data row'] };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const sources: Partial<CreateSourceData>[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
        continue;
      }

      const source: Partial<CreateSourceData> = {};
      let hasRequiredFields = true;

      headers.forEach((header, index) => {
        const value = values[index];
        if (!value) return;

        switch (header) {
          case 'code':
            source.code = value;
            break;
          case 'name':
            source.name = value;
            break;
          case 'kind_id':
            source.kind_id = parseInt(value);
            break;
          case 'status_id':
            source.status_id = parseInt(value);
            break;
          case 'catchment':
            source.catchment = value;
            break;
          case 'capacity_m3_per_day':
            source.capacity_m3_per_day = parseFloat(value);
            break;
          case 'elevation_m':
            source.elevation_m = parseFloat(value);
            break;
          case 'depth_m':
            source.depth_m = parseFloat(value);
            break;
          case 'static_level_m':
            source.static_level_m = parseFloat(value);
            break;
          case 'dynamic_level_m':
            source.dynamic_level_m = parseFloat(value);
            break;
          case 'permit_no':
            source.permit_no = value;
            break;
          case 'quality_risk_id':
            source.quality_risk_id = parseInt(value);
            break;
          case 'latitude':
          case 'longitude':
            break;
        }
      });

      const latIndex = headers.indexOf('latitude');
      const lonIndex = headers.indexOf('longitude');
      if (latIndex >= 0 && lonIndex >= 0 && values[latIndex] && values[lonIndex]) {
        const lat = parseFloat(values[latIndex]);
        const lon = parseFloat(values[lonIndex]);
        if (!isNaN(lat) && !isNaN(lon)) {
          source.latitude = lat;
          source.longitude = lon;
        }
      }

      if (!source.code || !source.name || !source.kind_id || !source.status_id) {
        errors.push(`Row ${i + 1}: Missing required fields (code, name, kind_id, status_id)`);
        hasRequiredFields = false;
      }

      if (hasRequiredFields) {
        sources.push(source);
      }
    }

    return { sources, errors };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvData(content);
      setParseErrors([]);
      setImportResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    const { sources, errors } = parseCSV(csvData);
    setParseErrors(errors);

    if (sources.length === 0) {
      toast.error('No valid sources to import');
      return;
    }

    importMutation.mutate(sources);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sources_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setCsvData('');
    setParseErrors([]);
    setImportResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Import Sources</DialogTitle>
          <DialogDescription>
            Upload a CSV file or paste CSV data to import multiple water sources at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload CSV
            </Button>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          <div className="space-y-2">
            <Label>CSV Data</Label>
            <Textarea
              placeholder="Paste CSV data here or upload a file..."
              value={csvData}
              onChange={(e) => {
                setCsvData(e.target.value);
                setParseErrors([]);
                setImportResult(null);
              }}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Required columns:</p>
            <p>code, name, kind_id, status_id</p>
            <p className="font-medium mt-2">Optional columns:</p>
            <p>catchment, capacity_m3_per_day, latitude, longitude, elevation_m, depth_m, static_level_m, dynamic_level_m, permit_no, quality_risk_id</p>
          </div>

          {parseErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Parse Errors:</p>
                <ul className="list-disc list-inside mt-1">
                  {parseErrors.slice(0, 5).map((error, i) => (
                    <li key={i} className="text-sm">{error}</li>
                  ))}
                  {parseErrors.length > 5 && (
                    <li className="text-sm">...and {parseErrors.length - 5} more errors</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {importResult && (
            <Alert variant={importResult.errors.length > 0 ? 'default' : 'default'}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Import Complete</p>
                <p>Successfully imported {importResult.imported} sources</p>
                {importResult.errors.length > 0 && (
                  <>
                    <p className="mt-2 font-medium text-destructive">{importResult.errors.length} errors:</p>
                    <ul className="list-disc list-inside mt-1">
                      {importResult.errors.slice(0, 3).map((error, i) => (
                        <li key={i} className="text-sm">{error}</li>
                      ))}
                      {importResult.errors.length > 3 && (
                        <li className="text-sm">...and {importResult.errors.length - 3} more</li>
                      )}
                    </ul>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!csvData.trim() || importMutation.isPending}
          >
            {importMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Import Sources
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
