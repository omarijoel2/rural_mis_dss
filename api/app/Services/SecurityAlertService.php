<?php

namespace App\Services;

use App\Models\SecurityAlert;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class SecurityAlertService
{
    protected AuditService $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Create a security alert
     */
    public function createAlert(
        string $alertType,
        string $severity,
        string $title,
        string $description,
        array $metadata = [],
        ?string $tenantId = null
    ): SecurityAlert {
        $alert = SecurityAlert::create([
            'tenant_id' => $tenantId ?? Auth::user()?->current_tenant_id,
            'alert_type' => $alertType,
            'severity' => $severity,
            'title' => $title,
            'description' => $description,
            'source' => request()->ip(),
            'detected_at' => now(),
            'metadata' => $metadata,
        ]);

        $this->auditService->log(
            'security.alert.created',
            null,
            SecurityAlert::class,
            $alert->id,
            [
                'alert_type' => $alertType,
                'severity' => $severity,
            ],
            $severity
        );

        return $alert;
    }

    /**
     * Get unacknowledged alerts
     */
    public function getUnacknowledged(?string $tenantId = null): Collection
    {
        $query = SecurityAlert::unacknowledged();

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        } elseif (Auth::check()) {
            $query->where('tenant_id', Auth::user()->current_tenant_id);
        } else {
            throw new \Exception('Tenant context required');
        }

        return $query->orderBy('detected_at', 'desc')->get();
    }

    /**
     * Get unresolved alerts
     */
    public function getUnresolved(?string $tenantId = null): Collection
    {
        $query = SecurityAlert::unresolved();

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        } elseif (Auth::check()) {
            $query->where('tenant_id', Auth::user()->current_tenant_id);
        } else {
            throw new \Exception('Tenant context required');
        }

        return $query->orderBy('detected_at', 'desc')->get();
    }

    /**
     * Get high severity alerts
     */
    public function getHighSeverity(?string $tenantId = null, int $days = 7): Collection
    {
        if (!$tenantId && !Auth::check()) {
            throw new \Exception('Tenant context required');
        }

        $effectiveTenantId = $tenantId ?? Auth::user()->current_tenant_id;

        return SecurityAlert::where('tenant_id', $effectiveTenantId)
            ->where('detected_at', '>=', now()->subDays($days))
            ->where(function ($query) {
                $query->where('severity', 'high')
                      ->orWhere('severity', 'critical');
            })
            ->orderBy('detected_at', 'desc')
            ->get();
    }

    /**
     * Acknowledge alert
     */
    public function acknowledgeAlert(SecurityAlert $alert, User $user): void
    {
        $alert->acknowledge($user);

        $this->auditService->log(
            'security.alert.acknowledged',
            $user->id,
            SecurityAlert::class,
            $alert->id,
            ['alert_type' => $alert->alert_type]
        );
    }

    /**
     * Resolve alert
     */
    public function resolveAlert(SecurityAlert $alert, User $user): void
    {
        $alert->resolve($user);

        $this->auditService->log(
            'security.alert.resolved',
            $user->id,
            SecurityAlert::class,
            $alert->id,
            ['alert_type' => $alert->alert_type]
        );
    }

    /**
     * Get alert statistics
     */
    public function getStatistics(?string $tenantId = null, int $days = 30): array
    {
        $query = SecurityAlert::where('detected_at', '>=', now()->subDays($days));

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        } elseif (Auth::check()) {
            $query->where('tenant_id', Auth::user()->current_tenant_id);
        } else {
            throw new \Exception('Tenant context required');
        }

        $alerts = $query->get();

        return [
            'total' => $alerts->count(),
            'by_severity' => $alerts->groupBy('severity')->map->count(),
            'by_type' => $alerts->groupBy('alert_type')->map->count(),
            'unacknowledged' => $alerts->where('acknowledged_at', null)->count(),
            'unresolved' => $alerts->where('resolved_at', null)->count(),
        ];
    }
}
