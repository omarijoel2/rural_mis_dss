<?php

namespace App\Services;

use App\Models\AuditEvent;
use Illuminate\Support\Facades\Auth;

class AuditService
{
    /**
     * Log an audit event
     */
    public function log(
        string $action,
        ?string $userId = null,
        ?string $entityType = null,
        ?string $entityId = null,
        array $changes = [],
        string $severity = 'info',
        array $metadata = []
    ): AuditEvent {
        $user = $userId ? \App\Models\User::find($userId) : Auth::user();
        
        return AuditEvent::create([
            'tenant_id' => $user?->current_tenant_id,
            'user_id' => $user?->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'changes' => $changes,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'severity' => $severity,
            'metadata' => array_merge($metadata, [
                'url' => request()->fullUrl(),
                'method' => request()->method(),
            ]),
        ]);
    }

    /**
     * Log model changes
     */
    public function logModelChanges(string $action, $model, array $changes = []): AuditEvent
    {
        return $this->log(
            $action,
            Auth::id(),
            get_class($model),
            $model->id,
            $changes,
            'info'
        );
    }

    /**
     * Get audit trail for an entity
     */
    public function getAuditTrail(string $entityType, string $entityId, ?string $tenantId = null, int $limit = 50)
    {
        $query = AuditEvent::forEntity($entityType, $entityId);

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        } elseif (Auth::user()) {
            $query->where('tenant_id', Auth::user()->current_tenant_id);
        } else {
            throw new \Exception('Tenant context required');
        }

        return $query->with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get recent audit events for current tenant
     */
    public function getRecentEvents(?string $tenantId = null, int $limit = 100)
    {
        $query = AuditEvent::query();

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        } elseif (Auth::user()) {
            $query->where('tenant_id', Auth::user()->current_tenant_id);
        } else {
            throw new \Exception('Tenant context required');
        }

        return $query->with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get high severity events
     */
    public function getHighSeverityEvents(?string $tenantId = null, int $days = 7)
    {
        $query = AuditEvent::query();

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        } elseif (Auth::user()) {
            $query->where('tenant_id', Auth::user()->current_tenant_id);
        } else {
            throw new \Exception('Tenant context required');
        }

        return $query->whereIn('severity', ['warning', 'error', 'critical'])
            ->where('created_at', '>=', now()->subDays($days))
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get events by action
     */
    public function getEventsByAction(string $action, ?string $tenantId = null, int $limit = 50)
    {
        $query = AuditEvent::action($action);

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        } elseif (Auth::user()) {
            $query->where('tenant_id', Auth::user()->current_tenant_id);
        } else {
            throw new \Exception('Tenant context required');
        }

        return $query->with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get failed authentication attempts
     */
    public function getFailedAuthAttempts(?string $tenantId = null, int $hours = 24)
    {
        $query = AuditEvent::action('auth.login.failed')
            ->where('created_at', '>=', now()->subHours($hours));

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        } elseif (Auth::user()) {
            $query->where('tenant_id', Auth::user()->current_tenant_id);
        } else {
            throw new \Exception('Tenant context required');
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Detect suspicious activity patterns
     */
    public function detectSuspiciousActivity(?string $userId = null, ?string $tenantId = null, int $hours = 1): array
    {
        if (!$tenantId && !Auth::user()) {
            throw new \Exception('Tenant context required for suspicious activity detection');
        }

        $effectiveTenantId = $tenantId ?? Auth::user()->current_tenant_id;
        $suspiciousPatterns = [];

        if ($userId) {
            $failedLogins = AuditEvent::where('user_id', $userId)
                ->where('tenant_id', $effectiveTenantId)
                ->action('auth.login.failed')
                ->where('created_at', '>=', now()->subHours($hours))
                ->count();

            if ($failedLogins >= 5) {
                $suspiciousPatterns[] = [
                    'type' => 'multiple_failed_logins',
                    'count' => $failedLogins,
                    'user_id' => $userId,
                    'tenant_id' => $effectiveTenantId,
                ];
            }
        }

        $rapidActions = AuditEvent::where('created_at', '>=', now()->subMinutes(5))
            ->where('tenant_id', $effectiveTenantId)
            ->when($userId, fn($q) => $q->where('user_id', $userId))
            ->count();

        if ($rapidActions >= 50) {
            $suspiciousPatterns[] = [
                'type' => 'rapid_actions',
                'count' => $rapidActions,
                'user_id' => $userId,
                'tenant_id' => $effectiveTenantId,
            ];
        }

        return $suspiciousPatterns;
    }
}
