<?php

namespace App\Services;

use App\Models\RetentionPolicy;
use App\Models\AuditEvent;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class RetentionService
{
    protected AuditService $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Create retention policy
     */
    public function createPolicy(
        string $name,
        string $description,
        array $appliesTo,
        int $retentionDays,
        string $actionOnExpiry = 'delete'
    ): RetentionPolicy {
        $policy = RetentionPolicy::create([
            'name' => $name,
            'description' => $description,
            'applies_to' => $appliesTo,
            'retention_days' => $retentionDays,
            'action_on_expiry' => $actionOnExpiry,
            'is_active' => true,
        ]);

        $this->auditService->log(
            'retention.policy.created',
            null,
            RetentionPolicy::class,
            $policy->id,
            ['name' => $name, 'applies_to' => $appliesTo, 'retention_days' => $retentionDays]
        );

        return $policy;
    }

    /**
     * Apply retention policies
     */
    public function applyPolicies(): array
    {
        $results = [];
        $policies = RetentionPolicy::active()->get();

        foreach ($policies as $policy) {
            $results[$policy->name] = $this->applyPolicy($policy);
        }

        $this->auditService->log(
            'retention.policies.applied',
            null,
            null,
            null,
            ['results' => $results]
        );

        return $results;
    }

    /**
     * Apply a specific retention policy
     */
    protected function applyPolicy(RetentionPolicy $policy): array
    {
        $deletedCount = 0;
        $archivedCount = 0;

        foreach ($policy->applies_to as $entityType) {
            try {
                $expiryDate = now()->subDays($policy->retention_days);

                if ($entityType === 'audit_events') {
                    $count = AuditEvent::where('created_at', '<', $expiryDate)->count();
                    
                    if ($policy->action_on_expiry === 'delete') {
                        AuditEvent::where('created_at', '<', $expiryDate)->delete();
                        $deletedCount += $count;
                    }
                } elseif (class_exists("App\\Models\\{$entityType}")) {
                    $modelClass = "App\\Models\\{$entityType}";
                    $count = $modelClass::where('created_at', '<', $expiryDate)->count();
                    
                    if ($policy->action_on_expiry === 'delete') {
                        $modelClass::where('created_at', '<', $expiryDate)->delete();
                        $deletedCount += $count;
                    } elseif ($policy->action_on_expiry === 'archive') {
                        $archivedCount += $count;
                    }
                }
            } catch (\Exception $e) {
                \Log::error("Retention policy error for {$entityType}: " . $e->getMessage());
            }
        }

        return [
            'deleted' => $deletedCount,
            'archived' => $archivedCount,
        ];
    }

    /**
     * Get expired records for entity type
     */
    public function getExpiredRecords(string $entityType, RetentionPolicy $policy): Collection
    {
        $expiryDate = now()->subDays($policy->retention_days);

        if ($entityType === 'audit_events') {
            return AuditEvent::where('created_at', '<', $expiryDate)->get();
        } elseif (class_exists("App\\Models\\{$entityType}")) {
            $modelClass = "App\\Models\\{$entityType}";
            return $modelClass::where('created_at', '<', $expiryDate)->get();
        }

        return collect([]);
    }

    /**
     * Preview what would be deleted/archived
     */
    public function previewPolicyApplication(RetentionPolicy $policy): array
    {
        $preview = [];

        foreach ($policy->applies_to as $entityType) {
            $expiryDate = now()->subDays($policy->retention_days);
            
            try {
                if ($entityType === 'audit_events') {
                    $count = AuditEvent::where('created_at', '<', $expiryDate)->count();
                } elseif (class_exists("App\\Models\\{$entityType}")) {
                    $modelClass = "App\\Models\\{$entityType}";
                    $count = $modelClass::where('created_at', '<', $expiryDate)->count();
                } else {
                    $count = 0;
                }

                $preview[$entityType] = [
                    'count' => $count,
                    'action' => $policy->action_on_expiry,
                    'expiry_date' => $expiryDate->toDateTimeString(),
                ];
            } catch (\Exception $e) {
                $preview[$entityType] = [
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $preview;
    }
}
