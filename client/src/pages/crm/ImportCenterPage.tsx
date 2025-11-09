import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { crmService } from '../../services/crm.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImportResult {
  total?: number;
  success?: number;
  failed?: number;
  duplicates?: number;
  errors?: string[];
  error?: string;
}

export function ImportCenterPage() {
  const [billingFile, setBillingFile] = useState<File | null>(null);
  const [mpesaFile, setMpesaFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const billingInputRef = useRef<HTMLInputElement>(null);
  const mpesaInputRef = useRef<HTMLInputElement>(null);

  const billingImportMutation = useMutation({
    mutationFn: (file: File) => crmService.importBilling(file),
    onSuccess: (data) => {
      setImportResult(data as ImportResult);
      toast.success('Billing import completed');
      setBillingFile(null);
      if (billingInputRef.current) billingInputRef.current.value = '';
    },
    onError: (error: Error) => {
      toast.error(`Billing import failed: ${error.message}`);
      setImportResult({ error: error.message });
    },
  });

  const mpesaImportMutation = useMutation({
    mutationFn: (file: File) => crmService.importMpesa(file),
    onSuccess: (data) => {
      setImportResult(data as ImportResult);
      toast.success('M-Pesa import completed');
      setMpesaFile(null);
      if (mpesaInputRef.current) mpesaInputRef.current.value = '';
    },
    onError: (error: Error) => {
      toast.error(`M-Pesa import failed: ${error.message}`);
      setImportResult({ error: error.message });
    },
  });

  const handleBillingFileSelect = (file: File | null) => {
    setBillingFile(file);
    setImportResult(null);
  };

  const handleMpesaFileSelect = (file: File | null) => {
    setMpesaFile(file);
    setImportResult(null);
  };

  const handleBillingImport = () => {
    if (!billingFile) return;
    billingImportMutation.mutate(billingFile);
  };

  const handleMpesaImport = () => {
    if (!mpesaFile) return;
    mpesaImportMutation.mutate(mpesaFile);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Center</h1>
        <p className="text-muted-foreground">Bulk import billing invoices and M-Pesa payment transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Billing Invoices
            </CardTitle>
            <CardDescription>
              Upload CSV file containing billing invoices with consumption and charges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <input
                ref={billingInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => handleBillingFileSelect(e.target.files?.[0] || null)}
                className="hidden"
                id="billing-upload"
              />
              <label htmlFor="billing-upload">
                <Button variant="outline" asChild>
                  <span>Select Billing CSV</span>
                </Button>
              </label>
              {billingFile && (
                <p className="mt-2 text-sm text-muted-foreground">{billingFile.name}</p>
              )}
            </div>

            {billingFile && (
              <Button
                onClick={handleBillingImport}
                disabled={billingImportMutation.isPending}
                className="w-full"
              >
                {billingImportMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Billing Data
                  </>
                )}
              </Button>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Expected CSV Format:</p>
              <code className="block bg-muted p-2 rounded">
                account_no,period_start,period_end,consumption,total_amount
              </code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              M-Pesa Transactions
            </CardTitle>
            <CardDescription>
              Upload CSV file containing M-Pesa payment transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <input
                ref={mpesaInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => handleMpesaFileSelect(e.target.files?.[0] || null)}
                className="hidden"
                id="mpesa-upload"
              />
              <label htmlFor="mpesa-upload">
                <Button variant="outline" asChild>
                  <span>Select M-Pesa CSV</span>
                </Button>
              </label>
              {mpesaFile && (
                <p className="mt-2 text-sm text-muted-foreground">{mpesaFile.name}</p>
              )}
            </div>

            {mpesaFile && (
              <Button
                onClick={handleMpesaImport}
                disabled={mpesaImportMutation.isPending}
                className="w-full"
              >
                {mpesaImportMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import M-Pesa Payments
                  </>
                )}
              </Button>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Expected CSV Format:</p>
              <code className="block bg-muted p-2 rounded">
                transaction_id,phone,amount,paid_at,account_no
              </code>
            </div>
          </CardContent>
        </Card>
      </div>

      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.error ? (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Import Failed
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Import Results
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {importResult.error ? (
              <p className="text-red-600">{importResult.error}</p>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Records:</span>
                  <span className="text-sm">{importResult.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-green-600">Successful:</span>
                  <span className="text-sm text-green-600">{importResult.success || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-red-600">Failed:</span>
                  <span className="text-sm text-red-600">{importResult.failed || 0}</span>
                </div>
                {(importResult.duplicates ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-orange-600">Duplicates Skipped:</span>
                    <span className="text-sm text-orange-600">{importResult.duplicates}</span>
                  </div>
                )}
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Errors:</p>
                    <ul className="text-xs text-red-600 space-y-1 max-h-40 overflow-auto">
                      {importResult.errors.slice(0, 10).map((error: string, idx: number) => (
                        <li key={idx}>• {error}</li>
                      ))}
                      {importResult.errors.length > 10 && (
                        <li>... and {importResult.errors.length - 10} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Import Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div>
            <p className="font-medium mb-1">Billing Invoices:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>CSV format with headers: account_no, period_start, period_end, consumption, total_amount</li>
              <li>Dates in YYYY-MM-DD format</li>
              <li>Consumption in cubic meters (m³)</li>
              <li>Amount in KES (no currency symbols)</li>
              <li>Duplicate invoices for same period will be skipped</li>
            </ul>
          </div>

          <div>
            <p className="font-medium mb-1">M-Pesa Payments:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>CSV format with headers: transaction_id, phone, amount, paid_at, account_no</li>
              <li>Transaction ID must be unique (duplicates skipped)</li>
              <li>Phone number in format 254XXXXXXXXX</li>
              <li>Date in YYYY-MM-DD HH:MM:SS format</li>
              <li>Account number must exist in the system</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
