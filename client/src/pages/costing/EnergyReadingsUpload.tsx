import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

export function EnergyReadingsUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [periodMonth, setPeriodMonth] = useState('');
  const [uploadResult, setUploadResult] = useState<any>(null);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/v1/costing/energy/readings/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
    onSuccess: (data) => {
      setUploadResult(data.data);
      setFile(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !periodMonth) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('period_month', periodMonth);

    uploadMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Energy Readings Upload</h1>
        <p className="text-muted-foreground mt-1">
          Bulk import energy consumption data from CSV files
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload CSV File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="period">Reporting Period *</Label>
                <Input
                  id="period"
                  type="month"
                  value={periodMonth}
                  onChange={(e) => setPeriodMonth(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Month and year for the readings
                </p>
              </div>

              <div>
                <Label htmlFor="file">CSV File *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum file size: 10MB
                </p>
              </div>

              {file && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
                  <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-900">{file.name}</span>
                  <span className="text-xs text-blue-600 ml-auto">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? 'Uploading...' : 'Upload & Process'}
              </Button>
            </form>

            {uploadResult && (
              <div className="mt-6 space-y-3">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Success!</strong> Imported {uploadResult.imported} of {uploadResult.total_rows} records
                  </AlertDescription>
                </Alert>

                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>{uploadResult.errors.length} errors:</strong>
                      <ul className="mt-2 text-xs space-y-1 max-h-32 overflow-y-auto">
                        {uploadResult.errors.slice(0, 10).map((error: string, idx: number) => (
                          <li key={idx}>• {error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CSV Format Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Required Columns:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <code className="bg-muted px-1 py-0.5 rounded">scheme_name</code> - Scheme identifier</li>
                <li>• <code className="bg-muted px-1 py-0.5 rounded">kwh</code> - Energy consumption in kWh</li>
                <li>• <code className="bg-muted px-1 py-0.5 rounded">peak_kwh</code> - Peak period consumption</li>
                <li>• <code className="bg-muted px-1 py-0.5 rounded">offpeak_kwh</code> - Off-peak consumption</li>
                <li>• <code className="bg-muted px-1 py-0.5 rounded">demand_kva</code> - Maximum demand</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Sample CSV:</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`scheme_name,kwh,peak_kwh,offpeak_kwh,demand_kva
Nairobi Central,125400,75200,50200,850
Mombasa North,98200,58900,39300,720
Kisumu West,45600,27100,18500,390`}
              </pre>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Make sure all numeric values are valid and scheme names match existing records
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
