import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CsvImportDialog({ open, onOpenChange }: CsvImportDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const response = await fetch(`${API_BASE_URL}/water-quality/results/import-csv`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Import failed' }));
        throw new Error(error.message || 'Import failed');
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['water-quality-results'] });
      setImportResult(data);
      toast.success(`Successfully imported ${data.imported || 0} results`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to import CSV file');
      setImportResult({ errors: error.response?.data?.errors || ['Import failed'] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }
    importMutation.mutate(selectedFile);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Lab Results from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing lab test results. File must include columns: sample_barcode, parameter_code, value, uncertainty, method, analyst, analyzed_at
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input
              ref={fileInputRef}
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <FileText className="h-4 w-4" />
                <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          {importResult && (
            <Alert variant={importResult.errors ? 'destructive' : 'default'}>
              {importResult.errors ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">Import Errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {importResult.errors.slice(0, 5).map((err: string, i: number) => (
                        <li key={i} className="text-sm">{err}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li className="text-sm">... and {importResult.errors.length - 5} more</li>
                      )}
                    </ul>
                  </AlertDescription>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold">Import Successful!</p>
                    <p className="text-sm mt-1">
                      Imported {importResult.imported || 0} results. 
                      {importResult.skipped > 0 && ` Skipped ${importResult.skipped} duplicates.`}
                    </p>
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="text-sm font-semibold mb-2">CSV Format Example:</h4>
            <pre className="text-xs font-mono overflow-x-auto">
{`sample_barcode,parameter_code,value,uncertainty,method,analyst,analyzed_at
WQ20240101-ABC123,PH,7.2,0.1,SM 4500-H,John Doe,2024-01-15
WQ20240101-ABC123,TURB,1.5,0.2,SM 2130-B,Jane Smith,2024-01-15`}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {!importResult && (
            <Button 
              onClick={handleImport} 
              disabled={!selectedFile || importMutation.isPending}
            >
              {importMutation.isPending ? (
                <>Importing...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
