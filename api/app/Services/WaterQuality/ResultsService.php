<?php

namespace App\Services\WaterQuality;

use App\Models\WqResult;
use App\Models\WqSampleParam;
use App\Models\WqSample;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ResultsService
{
    /**
     * Create a single result entry.
     *
     * @throws ValidationException
     */
    public function createResult(array $data, User $user): WqResult
    {
        $tenantId = $user->currentTenantId();

        $validator = Validator::make($data, [
            'sample_param_id' => 'required|integer|exists:wq_sample_params,id',
            'value' => 'nullable|numeric',
            'value_qualifier' => 'nullable|in:<,>,~',
            'unit' => 'nullable|string|max:50',
            'analyzed_at' => 'nullable|date',
            'instrument' => 'nullable|string|max:255',
            'lod' => 'nullable|numeric',
            'uncertainty' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // Validate tenant ownership through sample -> sampling point
        $sampleParam = WqSampleParam::whereHas('sample.samplingPoint', function ($q) use ($tenantId) {
                $q->where('tenant_id', $tenantId);
            })
            ->findOrFail($data['sample_param_id']);

        // Create result
        $result = WqResult::create([
            'sample_param_id' => $sampleParam->id,
            'value' => $data['value'] ?? null,
            'value_qualifier' => $data['value_qualifier'] ?? null,
            'unit' => $data['unit'] ?? null,
            'analyzed_at' => $data['analyzed_at'] ?? now(),
            'analyst_id' => $user->id,
            'instrument' => $data['instrument'] ?? null,
            'lod' => $data['lod'] ?? null,
            'uncertainty' => $data['uncertainty'] ?? null,
            'qc_flags' => [],
        ]);

        // Update sample param status
        $sampleParam->update(['status' => 'resulted']);

        // Check if all params for this sample are resulted
        $sample = $sampleParam->sample;
        $allResulted = $sample->sampleParams()
            ->where('status', '!=', 'resulted')
            ->count() === 0;

        if ($allResulted) {
            $sample->update(['custody_state' => 'reported']);
        }

        return $result->load('sampleParam.parameter', 'analyst');
    }

    /**
     * Import results from CSV.
     * Expected format: barcode, parameter_code, value, unit, analyzed_at, instrument
     *
     * @throws ValidationException
     */
    public function importFromCsv(string $csvContent, User $user): array
    {
        $tenantId = $user->currentTenantId();
        
        $rows = str_getcsv($csvContent, "\n");
        $header = str_getcsv(array_shift($rows));
        
        $imported = [];
        $errors = [];

        DB::transaction(function () use ($rows, $header, $user, $tenantId, &$imported, &$errors) {
            foreach ($rows as $index => $row) {
                $data = array_combine($header, str_getcsv($row));
                $lineNumber = $index + 2;

                try {
                    // Find sample by barcode
                    $sample = WqSample::whereHas('samplingPoint', function ($q) use ($tenantId) {
                            $q->where('tenant_id', $tenantId);
                        })
                        ->where('barcode', $data['barcode'])
                        ->firstOrFail();

                    // Find sample param by parameter code
                    $sampleParam = $sample->sampleParams()
                        ->whereHas('parameter', function ($q) use ($data) {
                            $q->where('code', $data['parameter_code']);
                        })
                        ->firstOrFail();

                    // Create result
                    $result = WqResult::create([
                        'sample_param_id' => $sampleParam->id,
                        'value' => $data['value'] ?? null,
                        'unit' => $data['unit'] ?? null,
                        'analyzed_at' => $data['analyzed_at'] ?? now(),
                        'analyst_id' => $user->id,
                        'instrument' => $data['instrument'] ?? null,
                        'qc_flags' => [],
                    ]);

                    $sampleParam->update(['status' => 'resulted']);
                    $imported[] = $result;

                } catch (\Exception $e) {
                    $errors[] = "Line {$lineNumber}: " . $e->getMessage();
                }
            }
        });

        if (!empty($errors)) {
            throw ValidationException::withMessages([
                'import' => $errors
            ]);
        }

        return $imported;
    }

    /**
     * Harmonize unit to standard unit for a parameter.
     * Example: Convert mg/L to µg/L, ppm to mg/L, etc.
     */
    protected function harmonizeUnit(float $value, string $fromUnit, string $toUnit): float
    {
        $conversionFactors = [
            'mg/L' => [
                'µg/L' => 1000,
                'g/L' => 0.001,
                'ppm' => 1,
            ],
            'µg/L' => [
                'mg/L' => 0.001,
                'ng/L' => 1000,
            ],
            'NTU' => [
                'FTU' => 1,
            ],
        ];

        if (isset($conversionFactors[$fromUnit][$toUnit])) {
            return $value * $conversionFactors[$fromUnit][$toUnit];
        }

        return $value;
    }

    /**
     * List results with filters.
     */
    public function listResults(User $user, array $filters = [], int $perPage = 15)
    {
        $tenantId = $user->currentTenantId();

        $query = WqResult::whereHas('sampleParam.sample.samplingPoint', function ($q) use ($tenantId) {
                $q->where('tenant_id', $tenantId);
            })
            ->with(['sampleParam.parameter', 'sampleParam.sample.samplingPoint', 'analyst']);

        if (!empty($filters['parameter_id'])) {
            $query->whereHas('sampleParam', function ($q) use ($filters) {
                $q->where('parameter_id', $filters['parameter_id']);
            });
        }

        if (!empty($filters['sample_id'])) {
            $query->whereHas('sampleParam', function ($q) use ($filters) {
                $q->where('sample_id', $filters['sample_id']);
            });
        }

        if (!empty($filters['from_date'])) {
            $query->where('analyzed_at', '>=', $filters['from_date']);
        }

        if (!empty($filters['to_date'])) {
            $query->where('analyzed_at', '<=', $filters['to_date']);
        }

        return $query->orderBy('analyzed_at', 'desc')->paginate($perPage);
    }
}
