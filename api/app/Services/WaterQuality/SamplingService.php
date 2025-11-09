<?php

namespace App\Services\WaterQuality;

use App\Models\WqSample;
use App\Models\WqSamplingPoint;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class SamplingService
{
    /**
     * Create an ad-hoc sample (not from a plan).
     *
     * @throws ValidationException
     */
    public function createAdHocSample(array $data, User $user): WqSample
    {
        $tenantId = $user->currentTenantId();

        $validator = Validator::make($data, [
            'sampling_point_id' => 'required|integer|exists:wq_sampling_points,id',
            'scheduled_for' => 'nullable|date',
            'parameter_ids' => 'nullable|array',
            'parameter_ids.*' => 'integer|exists:wq_parameters,id',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // Validate sampling point belongs to tenant
        $samplingPoint = WqSamplingPoint::where('id', $data['sampling_point_id'])
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        return DB::transaction(function () use ($data, $samplingPoint) {
            $sample = WqSample::create([
                'sampling_point_id' => $samplingPoint->id,
                'plan_id' => null,
                'barcode' => $this->generateBarcode(),
                'scheduled_for' => $data['scheduled_for'] ?? now(),
                'custody_state' => 'scheduled',
                'chain' => [],
            ]);

            // Attach parameters if provided
            if (!empty($data['parameter_ids'])) {
                foreach ($data['parameter_ids'] as $paramId) {
                    $sample->sampleParams()->create([
                        'parameter_id' => $paramId,
                        'status' => 'pending',
                    ]);
                }
            }

            return $sample->load('samplingPoint', 'sampleParams.parameter');
        });
    }

    /**
     * Mark sample as collected in the field.
     *
     * @throws ValidationException
     */
    public function collectSample(int $sampleId, array $data, User $user): WqSample
    {
        $tenantId = $user->currentTenantId();

        $validator = Validator::make($data, [
            'collected_at' => 'nullable|date',
            'photos' => 'nullable|array',
            'photos.*' => 'string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // Validate tenant ownership through sampling point
        $sample = WqSample::whereHas('samplingPoint', function ($q) use ($tenantId) {
                $q->where('tenant_id', $tenantId);
            })
            ->findOrFail($sampleId);

        if ($sample->custody_state !== 'scheduled') {
            throw ValidationException::withMessages([
                'sample' => ['Sample must be in scheduled state to collect.']
            ]);
        }

        // Update custody chain
        $chain = $sample->chain ?? [];
        $chain[] = [
            'state' => 'collected',
            'timestamp' => $data['collected_at'] ?? now(),
            'user_id' => $user->id,
            'user_name' => $user->name,
            'notes' => $data['notes'] ?? null,
        ];

        $sample->update([
            'collected_at' => $data['collected_at'] ?? now(),
            'collected_by' => $user->id,
            'custody_state' => 'collected',
            'photos' => $data['photos'] ?? [],
            'chain' => $chain,
        ]);

        return $sample->fresh(['samplingPoint', 'collectedBy']);
    }

    /**
     * Mark sample as received in the lab.
     *
     * @throws ValidationException
     */
    public function receiveSampleInLab(int $sampleId, array $data, User $user): WqSample
    {
        $tenantId = $user->currentTenantId();

        $validator = Validator::make($data, [
            'temp_c_on_receipt' => 'nullable|numeric|min:-10|max:50',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // Validate tenant ownership through sampling point
        $sample = WqSample::whereHas('samplingPoint', function ($q) use ($tenantId) {
                $q->where('tenant_id', $tenantId);
            })
            ->findOrFail($sampleId);

        if ($sample->custody_state !== 'collected') {
            throw ValidationException::withMessages([
                'sample' => ['Sample must be in collected state to receive in lab.']
            ]);
        }

        // Update custody chain
        $chain = $sample->chain ?? [];
        $chain[] = [
            'state' => 'received_lab',
            'timestamp' => now(),
            'user_id' => $user->id,
            'user_name' => $user->name,
            'temperature' => $data['temp_c_on_receipt'] ?? null,
            'notes' => $data['notes'] ?? null,
        ];

        $sample->update([
            'custody_state' => 'received_lab',
            'temp_c_on_receipt' => $data['temp_c_on_receipt'] ?? null,
            'chain' => $chain,
        ]);

        // Update all sample params to in_analysis
        $sample->sampleParams()->update(['status' => 'in_analysis']);

        return $sample->fresh(['samplingPoint', 'sampleParams.parameter']);
    }

    /**
     * Generate unique barcode for sample.
     */
    protected function generateBarcode(): string
    {
        do {
            $barcode = 'WQ' . now()->format('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 6));
        } while (WqSample::where('barcode', $barcode)->exists());

        return $barcode;
    }

    /**
     * List samples with filters.
     */
    public function listSamples(User $user, array $filters = [], int $perPage = 15)
    {
        $tenantId = $user->currentTenantId();

        $query = WqSample::whereHas('samplingPoint', function ($q) use ($tenantId) {
                $q->where('tenant_id', $tenantId);
            })
            ->with(['samplingPoint', 'plan', 'collectedBy']);

        if (!empty($filters['custody_state'])) {
            $query->where('custody_state', $filters['custody_state']);
        }

        if (!empty($filters['plan_id'])) {
            $query->where('plan_id', $filters['plan_id']);
        }

        if (!empty($filters['barcode'])) {
            $query->where('barcode', 'LIKE', '%' . $filters['barcode'] . '%');
        }

        return $query->orderBy('scheduled_for', 'desc')->paginate($perPage);
    }

    /**
     * Get sample by barcode (for mobile scanning).
     */
    public function getSampleByBarcode(string $barcode, User $user): WqSample
    {
        $tenantId = $user->currentTenantId();

        return WqSample::whereHas('samplingPoint', function ($q) use ($tenantId) {
                $q->where('tenant_id', $tenantId);
            })
            ->where('barcode', $barcode)
            ->with(['samplingPoint', 'plan', 'sampleParams.parameter', 'collectedBy'])
            ->firstOrFail();
    }
}
