<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Traits\ValidatesTenantOwnership;
use App\Models\Outage;
use App\Models\TelemetryTag;
use App\Models\PumpSchedule;
use App\Models\DosePlan;
use Illuminate\Http\Request;

class OperationsController extends Controller
{
    use ValidatesTenantOwnership;
    public function dashboard(Request $request)
    {
        // Note: All queries below are automatically scoped by tenant via HasTenancy trait
        // on Outage, PumpSchedule, DosePlan, and TelemetryTag models
        
        $activeOutages = Outage::whereIn('state', ['approved', 'live'])
            ->with(['scheme', 'dma'])
            ->latest('starts_at')
            ->limit(5)
            ->get();

        $activeSchedules = PumpSchedule::whereIn('status', ['scheduled', 'running'])
            ->with(['asset', 'scheme'])
            ->whereBetween('start_at', [now(), now()->addHours(24)])
            ->get();

        $activeDosePlans = DosePlan::where('active', true)
            ->with(['scheme', 'asset'])
            ->get();

        $alarmTags = TelemetryTag::where('enabled', true)
            ->whereNotNull('thresholds')
            ->with(['scheme', 'asset'])
            ->limit(10)
            ->get();

        return response()->json([
            'active_outages' => $activeOutages,
            'active_schedules' => $activeSchedules,
            'active_dose_plans' => $activeDosePlans,
            'alarm_tags' => $alarmTags,
            'kpis' => [
                'outages_count' => $activeOutages->count(),
                'schedules_count' => $activeSchedules->count(),
                'dose_plans_count' => $activeDosePlans->count(),
            ],
        ]);
    }

    public function alarms(Request $request)
    {
        return response()->json([
            'alarms' => [],
            'message' => 'Alarm system not yet implemented',
        ]);
    }
}
