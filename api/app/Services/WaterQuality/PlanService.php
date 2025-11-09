<?php

namespace App\Services\WaterQuality;

use App\Models\WqPlan;
use App\Models\WqPlanRule;
use App\Models\WqSample;
use App\Models\WqSamplingPoint;
use App\Models\WqParameter;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class PlanService
{
    /**
     * Create a new sampling plan.
     *
     * @throws ValidationException
     */
    public function createPlan(array $data, User $user): WqPlan
    {
        $tenantId = $user->currentTenantId();

        $validator = Validator::make($data, [
            'name' => 'required|string|max:255',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return WqPlan::create([
            'tenant_id' => $tenantId,
            'name' => $data['name'],
            'period_start' => $data['period_start'],
            'period_end' => $data['period_end'],
            'status' => 'draft',
            'notes' => $data['notes'] ?? null,
        ]);
    }

    /**
     * Add sampling rules to a plan.
     *
     * @throws ValidationException
     */
    public function addRule(int $planId, array $data, User $user): WqPlanRule
    {
        $tenantId = $user->currentTenantId();

        $plan = WqPlan::where('tenant_id', $tenantId)->findOrFail($planId);

        $validator = Validator::make($data, [
            'point_kind' => 'required|in:source,treatment,reservoir,distribution,kiosk,household',
            'parameter_group' => 'required|in:physical,chemical,biological',
            'frequency' => 'required|in:daily,weekly,monthly,quarterly,adhoc',
            'sample_count' => 'nullable|integer|min:1',
            'container_type' => 'nullable|string|max:255',
            'preservatives' => 'nullable|string|max:255',
            'holding_time_hrs' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return WqPlanRule::create([
            'plan_id' => $plan->id,
            'point_kind' => $data['point_kind'],
            'parameter_group' => $data['parameter_group'],
            'frequency' => $data['frequency'],
            'sample_count' => $data['sample_count'] ?? 1,
            'container_type' => $data['container_type'] ?? null,
            'preservatives' => $data['preservatives'] ?? null,
            'holding_time_hrs' => $data['holding_time_hrs'] ?? null,
        ]);
    }

    /**
     * Activate a plan and generate sampling tasks.
     *
     * @throws ValidationException
     */
    public function activatePlan(int $planId, User $user): WqPlan
    {
        $tenantId = $user->currentTenantId();

        $plan = WqPlan::where('tenant_id', $tenantId)
            ->with('rules')
            ->findOrFail($planId);

        if ($plan->status === 'active') {
            throw ValidationException::withMessages([
                'plan' => ['This plan is already active.']
            ]);
        }

        if ($plan->rules->isEmpty()) {
            throw ValidationException::withMessages([
                'plan' => ['Cannot activate plan without any sampling rules.']
            ]);
        }

        DB::transaction(function () use ($plan) {
            $plan->update(['status' => 'active']);
        });

        return $plan->fresh('rules');
    }

    /**
     * Generate sampling tasks from plan rules.
     * Creates scheduled samples for all matching sampling points.
     */
    public function generateTasks(int $planId, User $user): array
    {
        $tenantId = $user->currentTenantId();

        $plan = WqPlan::where('tenant_id', $tenantId)
            ->with('rules')
            ->findOrFail($planId);

        if ($plan->status !== 'active') {
            throw ValidationException::withMessages([
                'plan' => ['Plan must be active to generate tasks.']
            ]);
        }

        $createdSamples = [];

        DB::transaction(function () use ($plan, $tenantId, &$createdSamples) {
            foreach ($plan->rules as $rule) {
                // Get matching sampling points
                $points = WqSamplingPoint::where('tenant_id', $tenantId)
                    ->where('kind', $rule->point_kind)
                    ->where('is_active', true)
                    ->get();

                // Get parameters for this group
                $parameters = WqParameter::where('group', $rule->parameter_group)
                    ->where('is_active', true)
                    ->get();

                // Generate sampling dates based on frequency
                $samplingDates = $this->generateSamplingDates(
                    $plan->period_start,
                    $plan->period_end,
                    $rule->frequency
                );

                // Create samples for each point and date
                foreach ($points as $point) {
                    foreach ($samplingDates as $date) {
                        for ($i = 0; $i < $rule->sample_count; $i++) {
                            $sample = WqSample::create([
                                'sampling_point_id' => $point->id,
                                'plan_id' => $plan->id,
                                'barcode' => $this->generateBarcode(),
                                'scheduled_for' => $date,
                                'custody_state' => 'scheduled',
                            ]);

                            // Link parameters to sample
                            foreach ($parameters as $param) {
                                $sample->sampleParams()->create([
                                    'parameter_id' => $param->id,
                                    'status' => 'pending',
                                    'method' => $param->method,
                                ]);
                            }

                            $createdSamples[] = $sample;
                        }
                    }
                }
            }
        });

        return $createdSamples;
    }

    /**
     * Generate sampling dates based on frequency.
     */
    protected function generateSamplingDates(string $start, string $end, string $frequency): array
    {
        $dates = [];
        $current = Carbon::parse($start);
        $endDate = Carbon::parse($end);

        $interval = match($frequency) {
            'daily' => 'day',
            'weekly' => 'week',
            'monthly' => 'month',
            'quarterly' => 'quarter',
            default => null,
        };

        if (!$interval) {
            return [$current];
        }

        while ($current->lte($endDate)) {
            $dates[] = $current->copy();
            $current->add(1, $interval);
        }

        return $dates;
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
     * List plans with filters.
     */
    public function listPlans(User $user, array $filters = [], int $perPage = 15)
    {
        $tenantId = $user->currentTenantId();

        $query = WqPlan::where('tenant_id', $tenantId)
            ->with('rules');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }
}
