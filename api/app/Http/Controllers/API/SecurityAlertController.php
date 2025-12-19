<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SecurityAlertService;
use App\Models\SecurityAlert;
use Illuminate\Http\Request;

class SecurityAlertController extends Controller
{
    protected SecurityAlertService $alertService;

    public function __construct(SecurityAlertService $alertService)
    {
        $this->alertService = $alertService;
    }

    public function index(Request $request)
    {
        $tenantId = $request->user()->current_tenant_id;
        $alerts = $this->alertService->getUnresolved($tenantId);

        return response()->json(['alerts' => $alerts]);
    }

    public function getUnacknowledged(Request $request)
    {
        $tenantId = $request->user()->current_tenant_id;
        $alerts = $this->alertService->getUnacknowledged($tenantId);

        return response()->json(['alerts' => $alerts]);
    }

    public function getHighSeverity(Request $request)
    {
        $tenantId = $request->user()->current_tenant_id;
        $days = $request->input('days', 7);
        
        $alerts = $this->alertService->getHighSeverity($tenantId, $days);

        return response()->json(['alerts' => $alerts]);
    }

    public function getStatistics(Request $request)
    {
        $tenantId = $request->user()->current_tenant_id;
        $days = $request->input('days', 30);
        
        $stats = $this->alertService->getStatistics($tenantId, $days);

        return response()->json(['statistics' => $stats]);
    }

    public function acknowledge(Request $request, string $id)
    {
        try {
            $alert = SecurityAlert::findOrFail($id);
            $this->alertService->acknowledgeAlert($alert, $request->user());

            return response()->json(['message' => 'Alert acknowledged', 'alert' => $alert->fresh()]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function resolve(Request $request, string $id)
    {
        try {
            $alert = SecurityAlert::findOrFail($id);
            $this->alertService->resolveAlert($alert, $request->user());

            return response()->json(['message' => 'Alert resolved', 'alert' => $alert->fresh()]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
