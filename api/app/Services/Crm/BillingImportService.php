<?php

namespace App\Services\Crm;

use App\Models\CrmInvoice;
use App\Models\CrmInvoiceLine;
use App\Models\CrmServiceConnection;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class BillingImportService
{
    public function importBillingCsv(string $filePath, User $user): array
    {
        $tenantId = $user->currentTenantId();

        if (!file_exists($filePath)) {
            throw new \Exception("File not found: {$filePath}");
        }

        $handle = fopen($filePath, 'r');
        $header = fgetcsv($handle);

        $requiredColumns = ['account_no', 'period_start', 'period_end', 'due_date', 'description', 'quantity', 'unit_price'];
        $missingColumns = array_diff($requiredColumns, $header);

        if (!empty($missingColumns)) {
            fclose($handle);
            throw ValidationException::withMessages([
                'csv' => ['Missing required columns: ' . implode(', ', $missingColumns)]
            ]);
        }

        $success = 0;
        $errors = [];
        $row = 1;

        while (($data = fgetcsv($handle)) !== false) {
            $row++;
            $record = array_combine($header, $data);

            try {
                $this->importBillingRecord($record, $tenantId);
                $success++;
            } catch (\Exception $e) {
                $errors[] = [
                    'row' => $row,
                    'account_no' => $record['account_no'] ?? 'unknown',
                    'error' => $e->getMessage(),
                ];
            }
        }

        fclose($handle);

        return [
            'success_count' => $success,
            'error_count' => count($errors),
            'errors' => $errors,
        ];
    }

    private function importBillingRecord(array $record, string $tenantId): void
    {
        $validator = Validator::make($record, [
            'account_no' => 'required|string',
            'period_start' => 'required|date',
            'period_end' => 'required|date',
            'due_date' => 'required|date',
            'description' => 'required|string',
            'quantity' => 'required|numeric|min:0',
            'unit_price' => 'required|numeric|min:0',
            'tariff_block' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $connection = CrmServiceConnection::whereHas('premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->where('account_no', $record['account_no'])->first();

        if (!$connection) {
            throw new \Exception("Account {$record['account_no']} not found in tenant.");
        }

        DB::transaction(function () use ($record, $tenantId) {
            $invoice = CrmInvoice::firstOrCreate(
                [
                    'tenant_id' => $tenantId,
                    'account_no' => $record['account_no'],
                    'period_start' => $record['period_start'],
                    'period_end' => $record['period_end'],
                ],
                [
                    'due_date' => $record['due_date'],
                    'total_amount' => 0,
                    'status' => 'open',
                ]
            );

            $amount = $record['quantity'] * $record['unit_price'];

            CrmInvoiceLine::create([
                'invoice_id' => $invoice->id,
                'description' => $record['description'],
                'quantity' => $record['quantity'],
                'unit_price' => $record['unit_price'],
                'amount' => $amount,
                'tariff_block' => $record['tariff_block'] ?? null,
            ]);

            $totalAmount = $invoice->lines()->sum('amount');
            $invoice->update(['total_amount' => $totalAmount]);
        });
    }

    public function validateBillingCsv(string $filePath, User $user): array
    {
        $tenantId = $user->currentTenantId();

        if (!file_exists($filePath)) {
            throw new \Exception("File not found: {$filePath}");
        }

        $handle = fopen($filePath, 'r');
        $header = fgetcsv($handle);

        $requiredColumns = ['account_no', 'period_start', 'period_end', 'due_date', 'description', 'quantity', 'unit_price'];
        $missingColumns = array_diff($requiredColumns, $header);

        if (!empty($missingColumns)) {
            fclose($handle);
            return [
                'valid' => false,
                'errors' => ['Missing required columns: ' . implode(', ', $missingColumns)],
            ];
        }

        $validationErrors = [];
        $row = 1;
        $accountNos = [];

        while (($data = fgetcsv($handle)) !== false) {
            $row++;
            $record = array_combine($header, $data);

            $validator = Validator::make($record, [
                'account_no' => 'required|string',
                'period_start' => 'required|date',
                'period_end' => 'required|date',
                'due_date' => 'required|date',
                'description' => 'required|string',
                'quantity' => 'required|numeric|min:0',
                'unit_price' => 'required|numeric|min:0',
            ]);

            if ($validator->fails()) {
                $validationErrors[] = [
                    'row' => $row,
                    'errors' => $validator->errors()->all(),
                ];
            }

            if (isset($record['account_no'])) {
                $accountNos[] = $record['account_no'];
            }
        }

        fclose($handle);

        $uniqueAccountNos = array_unique($accountNos);
        $existingAccounts = CrmServiceConnection::whereHas('premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->whereIn('account_no', $uniqueAccountNos)
          ->pluck('account_no')
          ->toArray();

        $missingAccounts = array_diff($uniqueAccountNos, $existingAccounts);

        if (!empty($missingAccounts)) {
            $validationErrors[] = [
                'row' => 'multiple',
                'errors' => ['Accounts not found in system: ' . implode(', ', array_slice($missingAccounts, 0, 10))],
            ];
        }

        return [
            'valid' => empty($validationErrors),
            'errors' => $validationErrors,
            'total_rows' => $row - 1,
            'unique_accounts' => count($uniqueAccountNos),
            'missing_accounts' => count($missingAccounts),
        ];
    }
}
