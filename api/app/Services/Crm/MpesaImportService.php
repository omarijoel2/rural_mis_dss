<?php

namespace App\Services\Crm;

use App\Models\CrmPayment;
use App\Models\CrmServiceConnection;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class MpesaImportService
{
    private PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function importMpesaCsv(string $filePath, User $user): array
    {
        $tenantId = $user->currentTenantId();

        if (!file_exists($filePath)) {
            throw new \Exception("File not found: {$filePath}");
        }

        $handle = fopen($filePath, 'r');
        $header = fgetcsv($handle);

        $requiredColumns = ['transaction_date', 'transaction_id', 'amount', 'phone_number', 'account_reference'];
        $missingColumns = array_diff($requiredColumns, $header);

        if (!empty($missingColumns)) {
            fclose($handle);
            throw ValidationException::withMessages([
                'csv' => ['Missing required columns: ' . implode(', ', $missingColumns)]
            ]);
        }

        $success = 0;
        $errors = [];
        $skipped = 0;
        $row = 1;

        while (($data = fgetcsv($handle)) !== false) {
            $row++;
            $record = array_combine($header, $data);

            try {
                $result = $this->importMpesaRecord($record, $tenantId, $user);
                
                if ($result === 'duplicate') {
                    $skipped++;
                } else {
                    $success++;
                }
            } catch (\Exception $e) {
                $errors[] = [
                    'row' => $row,
                    'transaction_id' => $record['transaction_id'] ?? 'unknown',
                    'error' => $e->getMessage(),
                ];
            }
        }

        fclose($handle);

        return [
            'success_count' => $success,
            'skipped_count' => $skipped,
            'error_count' => count($errors),
            'errors' => $errors,
        ];
    }

    private function importMpesaRecord(array $record, string $tenantId, User $user)
    {
        $validator = Validator::make($record, [
            'transaction_date' => 'required|date',
            'transaction_id' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'phone_number' => 'required|string',
            'account_reference' => 'required|string',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $existingPayment = CrmPayment::where('tenant_id', $tenantId)
            ->where('channel', 'mpesa')
            ->where('ref', $record['transaction_id'])
            ->exists();

        if ($existingPayment) {
            return 'duplicate';
        }

        $accountNo = $this->resolveAccountNumber($record['account_reference'], $record['phone_number'], $tenantId);

        if (!$accountNo) {
            throw new \Exception("Cannot resolve account for reference: {$record['account_reference']}, phone: {$record['phone_number']}");
        }

        $this->paymentService->recordPayment([
            'account_no' => $accountNo,
            'amount' => $record['amount'],
            'paid_at' => Carbon::parse($record['transaction_date']),
            'channel' => 'mpesa',
            'ref' => $record['transaction_id'],
            'meta' => [
                'phone_number' => $record['phone_number'],
                'account_reference' => $record['account_reference'],
                'imported_at' => now(),
            ],
        ], $user);

        return 'imported';
    }

    private function resolveAccountNumber(string $reference, string $phone, string $tenantId): ?string
    {
        $connection = CrmServiceConnection::whereHas('premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->where('account_no', $reference)->first();

        if ($connection) {
            return $connection->account_no;
        }

        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);

        $connection = CrmServiceConnection::whereHas('premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->whereHas('customer', function ($q) use ($cleanPhone) {
            $q->where('phone', 'like', "%{$cleanPhone}%");
        })->first();

        return $connection ? $connection->account_no : null;
    }

    public function validateMpesaCsv(string $filePath, User $user): array
    {
        $tenantId = $user->currentTenantId();

        if (!file_exists($filePath)) {
            throw new \Exception("File not found: {$filePath}");
        }

        $handle = fopen($filePath, 'r');
        $header = fgetcsv($handle);

        $requiredColumns = ['transaction_date', 'transaction_id', 'amount', 'phone_number', 'account_reference'];
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
        $totalAmount = 0;

        while (($data = fgetcsv($handle)) !== false) {
            $row++;
            $record = array_combine($header, $data);

            $validator = Validator::make($record, [
                'transaction_date' => 'required|date',
                'transaction_id' => 'required|string',
                'amount' => 'required|numeric|min:0.01',
                'phone_number' => 'required|string',
                'account_reference' => 'required|string',
            ]);

            if ($validator->fails()) {
                $validationErrors[] = [
                    'row' => $row,
                    'errors' => $validator->errors()->all(),
                ];
            }

            if (isset($record['amount']) && is_numeric($record['amount'])) {
                $totalAmount += $record['amount'];
            }
        }

        fclose($handle);

        return [
            'valid' => empty($validationErrors),
            'errors' => $validationErrors,
            'total_rows' => $row - 1,
            'total_amount' => $totalAmount,
        ];
    }
}
