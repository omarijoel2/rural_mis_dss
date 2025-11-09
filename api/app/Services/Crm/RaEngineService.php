<?php

namespace App\Services\Crm;

use App\Models\CrmRaRule;
use App\Models\CrmRaCase;
use App\Models\CrmCustomerRead;
use App\Models\CrmMeter;
use App\Models\CrmServiceConnection;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RaEngineService
{
    public function runAllRules(User $user): array
    {
        $tenantId = $user->currentTenantId();

        $rules = CrmRaRule::where('tenant_id', $tenantId)
            ->where('active', true)
            ->get();

        $casesCreated = 0;

        foreach ($rules as $rule) {
            $created = $this->executeRule($rule, $user);
            $casesCreated += $created;
        }

        return [
            'rules_executed' => $rules->count(),
            'cases_created' => $casesCreated,
        ];
    }

    private function executeRule(CrmRaRule $rule, User $user): int
    {
        $method = 'rule' . str_replace('_', '', ucwords($rule->code, '_'));

        if (method_exists($this, $method)) {
            return $this->$method($rule, $user);
        }

        return 0;
    }

    private function ruleZeroConsumption(CrmRaRule $rule, User $user): int
    {
        $tenantId = $user->currentTenantId();
        $params = $rule->params;
        $monthsThreshold = $params['months_threshold'] ?? 3;

        $startDate = Carbon::now()->subMonths($monthsThreshold);

        $meters = CrmMeter::whereHas('connection.premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->where('status', 'active')->get();

        $casesCreated = 0;

        foreach ($meters as $meter) {
            $reads = $meter->reads()
                ->where('read_at', '>=', $startDate)
                ->where('quality', 'good')
                ->orderBy('read_at', 'asc')
                ->get();

            if ($reads->count() < 2) {
                continue;
            }

            $firstRead = $reads->first();
            $lastRead = $reads->last();
            $consumption = $lastRead->value - $firstRead->value;

            if ($consumption <= 0) {
                $existingCase = CrmRaCase::where('tenant_id', $tenantId)
                    ->where('meter_id', $meter->id)
                    ->where('rule_code', $rule->code)
                    ->whereIn('status', ['new', 'triage', 'field'])
                    ->exists();

                if (!$existingCase) {
                    CrmRaCase::create([
                        'tenant_id' => $tenantId,
                        'account_no' => $meter->connection->account_no,
                        'meter_id' => $meter->id,
                        'premise_id' => $meter->connection->premise_id,
                        'rule_code' => $rule->code,
                        'detected_at' => now(),
                        'severity' => $rule->severity,
                        'status' => 'new',
                        'score' => 75.0,
                        'description' => "Zero consumption detected over {$monthsThreshold} months",
                        'evidence' => [
                            'first_read' => $firstRead->value,
                            'last_read' => $lastRead->value,
                            'read_count' => $reads->count(),
                            'period_months' => $monthsThreshold,
                        ],
                        'geom' => $meter->connection->premise->geom,
                    ]);

                    $casesCreated++;
                }
            }
        }

        return $casesCreated;
    }

    private function ruleHighConsumptionSpike(CrmRaRule $rule, User $user): int
    {
        $tenantId = $user->currentTenantId();
        $params = $rule->params;
        $thresholdMultiplier = $params['threshold_multiplier'] ?? 3.0;

        $meters = CrmMeter::whereHas('connection.premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->where('status', 'active')->get();

        $casesCreated = 0;

        foreach ($meters as $meter) {
            $reads = $meter->reads()
                ->where('quality', 'good')
                ->orderBy('read_at', 'desc')
                ->limit(6)
                ->get();

            if ($reads->count() < 4) {
                continue;
            }

            $consumptions = [];
            for ($i = 0; $i < $reads->count() - 1; $i++) {
                $curr = $reads[$i];
                $prev = $reads[$i + 1];
                $consumed = $curr->value - $prev->value;
                if ($consumed > 0) {
                    $consumptions[] = $consumed;
                }
            }

            if (count($consumptions) < 3) {
                continue;
            }

            $latest = $consumptions[0];
            $historical = array_slice($consumptions, 1);
            $avgHistorical = array_sum($historical) / count($historical);

            if ($avgHistorical > 0 && $latest > ($avgHistorical * $thresholdMultiplier)) {
                $existingCase = CrmRaCase::where('tenant_id', $tenantId)
                    ->where('meter_id', $meter->id)
                    ->where('rule_code', $rule->code)
                    ->where('detected_at', '>=', Carbon::now()->subDays(30))
                    ->whereIn('status', ['new', 'triage', 'field'])
                    ->exists();

                if (!$existingCase) {
                    $score = min(100, ($latest / $avgHistorical - 1) * 20);

                    CrmRaCase::create([
                        'tenant_id' => $tenantId,
                        'account_no' => $meter->connection->account_no,
                        'meter_id' => $meter->id,
                        'premise_id' => $meter->connection->premise_id,
                        'rule_code' => $rule->code,
                        'detected_at' => now(),
                        'severity' => $rule->severity,
                        'status' => 'new',
                        'score' => $score,
                        'description' => sprintf("Consumption spike: %.1f x average", $latest / $avgHistorical),
                        'evidence' => [
                            'latest_consumption' => $latest,
                            'average_consumption' => $avgHistorical,
                            'spike_multiplier' => round($latest / $avgHistorical, 2),
                        ],
                        'geom' => $meter->connection->premise->geom,
                    ]);

                    $casesCreated++;
                }
            }
        }

        return $casesCreated;
    }

    private function ruleTampering(CrmRaRule $rule, User $user): int
    {
        $tenantId = $user->currentTenantId();

        $recentReads = CrmCustomerRead::whereHas('meter.connection.premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->where('read_at', '>=', Carbon::now()->subDays(7))
          ->orderBy('read_at', 'desc')
          ->get();

        $casesCreated = 0;

        foreach ($recentReads as $read) {
            $meter = $read->meter;
            $prevRead = $meter->reads()
                ->where('read_at', '<', $read->read_at)
                ->orderBy('read_at', 'desc')
                ->first();

            if ($prevRead && $read->value < $prevRead->value) {
                $existingCase = CrmRaCase::where('tenant_id', $tenantId)
                    ->where('meter_id', $meter->id)
                    ->where('rule_code', $rule->code)
                    ->where('detected_at', '>=', Carbon::now()->subDays(30))
                    ->whereIn('status', ['new', 'triage', 'field'])
                    ->exists();

                if (!$existingCase) {
                    CrmRaCase::create([
                        'tenant_id' => $tenantId,
                        'account_no' => $meter->connection->account_no,
                        'meter_id' => $meter->id,
                        'premise_id' => $meter->connection->premise_id,
                        'rule_code' => $rule->code,
                        'detected_at' => now(),
                        'severity' => 'high',
                        'status' => 'new',
                        'score' => 95.0,
                        'description' => "Reverse meter reading detected (tampering suspected)",
                        'evidence' => [
                            'previous_read' => $prevRead->value,
                            'current_read' => $read->value,
                            'difference' => $prevRead->value - $read->value,
                        ],
                        'geom' => $meter->connection->premise->geom,
                    ]);

                    $casesCreated++;
                }
            }
        }

        return $casesCreated;
    }
}
