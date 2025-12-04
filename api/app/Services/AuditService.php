<?php

namespace App\Services;

use App\Models\AuditEvent;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuditService
{
    /**
     * Log an audit event
     */
    public function log(
        string $action,
        ?string $actorId = null,
        ?string $entityType = null,
        ?string $entityId = null,
        array $diff = []
    ): AuditEvent {
        $user = $actorId ? User::find($actorId) : Auth::user();
        
        return AuditEvent::create([
            'tenant_id' => $user?->current_tenant_id,
            'actor_id' => $user?->id,
            'actor_type' => $user ? User::class : 'system',
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'diff' => $diff,
            'ip' => request()->ip(),
            'ua' => request()->userAgent(),
            'occurred_at' => now(),
        ]);
    }

    /**
     * Log model changes
     */
    public function logModelChanges(string $action, $model, array $diff = []): AuditEvent
    {
        return $this->log(
            $action,
            Auth::id(),
            get_class($model),
            $model->id,
            $diff
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

        return $query->orderBy('occurred_at', 'desc')
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

        return $query->orderBy('occurred_at', 'desc')
            ->limit($limit)
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

        return $query->orderBy('occurred_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get failed authentication attempts
     */
    public function getFailedAuthAttempts(?string $tenantId = null, int $hours = 24)
    {
        $query = AuditEvent::action('auth.login.failed')
            ->where('occurred_at', '>=', now()->subHours($hours));

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        } elseif (Auth::user()) {
            $query->where('tenant_id', Auth::user()->current_tenant_id);
        } else {
            throw new \Exception('Tenant context required');
        }

        return $query->orderBy('occurred_at', 'desc')->get();
    }

    /**
     * Detect suspicious activity patterns
     */
    public function detectSuspiciousActivity(?string $actorId = null, ?string $tenantId = null, int $hours = 1): array
    {
        if (!$tenantId && !Auth::user()) {
            throw new \Exception('Tenant context required for suspicious activity detection');
        }

        $effectiveTenantId = $tenantId ?? Auth::user()->current_tenant_id;
        $suspiciousPatterns = [];

        if ($actorId) {
            $failedLogins = AuditEvent::where('actor_id', $actorId)
                ->where('tenant_id', $effectiveTenantId)
                ->action('auth.login.failed')
                ->where('occurred_at', '>=', now()->subHours($hours))
                ->count();

            if ($failedLogins >= 5) {
                $suspiciousPatterns[] = [
                    'type' => 'multiple_failed_logins',
                    'count' => $failedLogins,
                    'actor_id' => $actorId,
                    'tenant_id' => $effectiveTenantId,
                ];
            }
        }

        $rapidActions = AuditEvent::where('occurred_at', '>=', now()->subMinutes(5))
            ->where('tenant_id', $effectiveTenantId)
            ->when($actorId, fn($q) => $q->where('actor_id', $actorId))
            ->count();

        if ($rapidActions >= 50) {
            $suspiciousPatterns[] = [
                'type' => 'rapid_actions',
                'count' => $rapidActions,
                'actor_id' => $actorId,
                'tenant_id' => $effectiveTenantId,
            ];
        }

        return $suspiciousPatterns;
    }
}
