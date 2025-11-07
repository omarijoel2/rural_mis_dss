import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileJson, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImportGeoJSONDialogProps {
  trigger?: React.ReactNode;
  onImportComplete?: () => void;
}

export function ImportGeoJSONDialog({ trigger, onImportComplete }: ImportGeoJSONDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [nameField, setNameField] = useState('name');
  const [typeField, setTypeField] = useState('type');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    imported?: number;
    total?: number;
    errors?: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name_field', nameField);
    formData.append('type_field', typeField);

    try {
      const response = await fetch('/api/v1/gis/schemes/import', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      if (data.imported > 0 && onImportComplete) {
        setTimeout(() => {
          onImportComplete();
          setOpen(false);
          setFile(null);
          setResult(null);
        }, 2000);
      }
    } catch (error) {
      setResult({
        errors: [(error as Error).message],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import GeoJSON
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">Import GeoJSON</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Upload a GeoJSON file to import water supply schemes. Maximum 10MB, 500 features.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file" className="text-gray-900 dark:text-gray-100">
              <FileJson className="inline mr-2 h-4 w-4" />
              GeoJSON File
            </Label>
            <Input
              id="file"
              type="file"
              accept=".json,.geojson"
              onChange={handleFileChange}
              className="dark:bg-gray-800 dark:text-gray-100"
            />
            {file && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name-field" className="text-gray-900 dark:text-gray-100">
                Name Field
              </Label>
              <Input
                id="name-field"
                value={nameField}
                onChange={(e) => setNameField(e.target.value)}
                placeholder="name"
                className="dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type-field" className="text-gray-900 dark:text-gray-100">
                Type Field
              </Label>
              <Input
                id="type-field"
                value={typeField}
                onChange={(e) => setTypeField(e.target.value)}
                placeholder="type"
                className="dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          {result && (
            <Alert className={result.imported ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}>
              {result.imported ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className="text-gray-900 dark:text-gray-100">
                {result.imported !== undefined && (
                  <p className="font-medium">
                    Successfully imported {result.imported} of {result.total} features
                  </p>
                )}
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="font-medium">Errors:</p>
                    <ul className="list-disc list-inside text-sm">
                      {result.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {result.errors.length > 5 && (
                        <li>... and {result.errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="dark:bg-gray-800 dark:text-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
