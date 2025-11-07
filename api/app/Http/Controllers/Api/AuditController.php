<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    protected AuditService $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    public function index(Request $request)
    {
        $tenantId = $request->user()->current_tenant_id;
        $limit = $request->input('limit', 100);

        $events = $this->auditService->getRecentEvents($tenantId, $limit);

        return response()->json(['audit_events' => $events]);
    }

    public function getEntityAuditTrail(Request $request, string $entityType, string $entityId)
    {
        $limit = $request->input('limit', 50);
        $tenantId = $request->user()->current_tenant_id;
        
        $trail = $this->auditService->getAuditTrail($entityType, $entityId, $tenantId, $limit);

        return response()->json(['audit_trail' => $trail]);
    }

    public function getHighSeverityEvents(Request $request)
    {
        $tenantId = $request->user()->current_tenant_id;
        $days = $request->input('days', 7);

        $events = $this->auditService->getHighSeverityEvents($tenantId, $days);

        return response()->json(['high_severity_events' => $events]);
    }

    public function getEventsByAction(Request $request, string $action)
    {
        $tenantId = $request->user()->current_tenant_id;
        $limit = $request->input('limit', 50);

        $events = $this->auditService->getEventsByAction($action, $tenantId, $limit);

        return response()->json(['events' => $events]);
    }

    public function getFailedAuthAttempts(Request $request)
    {
        $tenantId = $request->user()->current_tenant_id;
        $hours = $request->input('hours', 24);
        
        $attempts = $this->auditService->getFailedAuthAttempts($tenantId, $hours);

        return response()->json(['failed_attempts' => $attempts]);
    }

    public function detectSuspiciousActivity(Request $request)
    {
        $tenantId = $request->user()->current_tenant_id;
        $userId = $request->input('user_id', $request->user()->id);
        $hours = $request->input('hours', 1);

        $suspicious = $this->auditService->detectSuspiciousActivity($userId, $tenantId, $hours);

        return response()->json(['suspicious_patterns' => $suspicious]);
    }
}
