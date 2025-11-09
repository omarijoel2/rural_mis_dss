<?php

namespace App\Services\WaterQuality;

use App\Models\WqQcControl;
use App\Models\WqResult;
use App\Models\WqSample;
use App\Models\WqParameter;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class QcService
{
    /**
     * Create a QC control entry.
     *
     * @throws ValidationException
     */
    public function createControl(array $data, User $user): WqQcControl
    {
        $tenantId = $user->currentTenantId();

        $validator = Validator::make($data, [
            'sample_id' => 'nullable|integer|exists:wq_samples,id',
            'parameter_id' => 'nullable|integer|exists:wq_parameters,id',
            'type' => 'required|in:blank,duplicate,spike,control_sample',
            'target_value' => 'nullable|numeric',
            'accepted_range' => 'nullable|string',
            'details' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // Validate sample ownership if sample_id provided
        if (!empty($data['sample_id'])) {
            $sampleExists = WqSample::whereHas('samplingPoint', function ($q) use ($tenantId) {
                    $q->where('tenant_id', $tenantId);
                })
                ->where('id', $data['sample_id'])
                ->exists();

            if (!$sampleExists) {
                throw ValidationException::withMessages([
                    'sample_id' => ['The selected sample does not belong to your organization.']
                ]);
            }
        }

        return WqQcControl::create([
            'sample_id' => $data['sample_id'] ?? null,
            'parameter_id' => $data['parameter_id'] ?? null,
            'type' => $data['type'],
            'target_value' => $data['target_value'] ?? null,
            'accepted_range' => $data['accepted_range'] ?? null,
            'outcome' => null,
            'details' => $data['details'] ?? [],
        ]);
    }

    /**
     * Evaluate QC control and determine pass/fail.
     */
    public function evaluateControl(int $controlId, float $measuredValue, User $user): WqQcControl
    {
        $tenantId = $user->currentTenantId();

        // Validate tenant ownership if control has a sample
        $control = WqQcControl::with('sample.samplingPoint')
            ->findOrFail($controlId);

        if ($control->sample && $control->sample->samplingPoint->tenant_id !== $tenantId) {
            throw new \RuntimeException('QC control does not belong to your organization.');
        }

        $outcome = $this->determineOutcome(
            $control->type,
            $control->target_value,
            $measuredValue,
            $control->accepted_range
        );

        $details = $control->details ?? [];
        $details['measured_value'] = $measuredValue;
        $details['evaluated_at'] = now();

        $control->update([
            'outcome' => $outcome,
            'details' => $details,
        ]);

        return $control;
    }

    /**
     * Determine QC outcome based on type and measured value.
     */
    protected function determineOutcome(string $type, ?float $target, float $measured, ?string $range): string
    {
        if ($type === 'blank') {
            // Blank should be near zero or below LOD
            return $measured < 0.1 ? 'pass' : 'fail';
        }

        if ($type === 'control_sample' && $target !== null) {
            // Control sample should be within acceptable range
            $tolerance = $this->parseRange($range);
            $diff = abs($measured - $target);
            
            if ($diff <= $tolerance) {
                return 'pass';
            } elseif ($diff <= $tolerance * 1.5) {
                return 'warn';
            } else {
                return 'fail';
            }
        }

        if ($type === 'spike' && $target !== null) {
            // Spike recovery percentage
            $recovery = ($measured / $target) * 100;
            
            if ($recovery >= 90 && $recovery <= 110) {
                return 'pass';
            } elseif ($recovery >= 80 && $recovery <= 120) {
                return 'warn';
            } else {
                return 'fail';
            }
        }

        return 'pass';
    }

    /**
     * Calculate Relative Percent Difference (RPD) for duplicates.
     */
    public function calculateRPD(float $value1, float $value2): float
    {
        $average = ($value1 + $value2) / 2;
        
        if ($average == 0) {
            return 0;
        }

        return (abs($value1 - $value2) / $average) * 100;
    }

    /**
     * Auto-flag results based on QC rules.
     */
    public function autoFlagResult(WqResult $result): array
    {
        $flags = [];
        $parameter = $result->sampleParam->parameter;

        // Flag 1: Value below LOD
        if ($result->value !== null && $result->lod !== null && $result->value < $result->lod) {
            $flags[] = 'below_lod';
            $result->update(['value_qualifier' => '<']);
        }

        // Flag 2: Exceeds WHO limit
        if ($result->value !== null && $parameter->who_limit !== null) {
            if ($result->value > $parameter->who_limit) {
                $flags[] = 'exceeds_who_limit';
            }
        }

        // Flag 3: Exceeds WASREB limit
        if ($result->value !== null && $parameter->wasreb_limit !== null) {
            if ($result->value > $parameter->wasreb_limit) {
                $flags[] = 'exceeds_wasreb_limit';
            }
        }

        // Flag 4: Exceeds local limit
        if ($result->value !== null && $parameter->local_limit !== null) {
            if ($result->value > $parameter->local_limit) {
                $flags[] = 'exceeds_local_limit';
            }
        }

        // Flag 5: High uncertainty
        if ($result->uncertainty !== null && $result->value !== null) {
            $relativeUncertainty = ($result->uncertainty / $result->value) * 100;
            if ($relativeUncertainty > 20) {
                $flags[] = 'high_uncertainty';
            }
        }

        $result->update(['qc_flags' => $flags]);

        return $flags;
    }

    /**
     * Parse range string to numeric tolerance.
     */
    protected function parseRange(?string $range): float
    {
        if (!$range) {
            return 0.1;
        }

        // Handle "±X%" format
        if (preg_match('/±(\d+(?:\.\d+)?)%?/', $range, $matches)) {
            return (float) $matches[1];
        }

        return 0.1;
    }

    /**
     * List QC controls with filters.
     */
    public function listControls(User $user, array $filters = [], int $perPage = 15)
    {
        $tenantId = $user->currentTenantId();

        // Scope to tenant's samples only
        $query = WqQcControl::where(function ($q) use ($tenantId) {
                // Controls without samples are global (like blank/control samples)
                // Controls with samples must belong to tenant
                $q->whereNull('sample_id')
                    ->orWhereHas('sample.samplingPoint', function ($sq) use ($tenantId) {
                        $sq->where('tenant_id', $tenantId);
                    });
            })
            ->with(['sample', 'parameter']);

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['outcome'])) {
            $query->where('outcome', $filters['outcome']);
        }

        if (!empty($filters['sample_id'])) {
            $query->where('sample_id', $filters['sample_id']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }
}
