<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait HasTenancy
{
    protected static function bootedHasTenancy(): void
    {
        // Automatically scope all queries by tenant_id when authenticated
        // FAIL CLOSED: If authenticated user lacks tenant, return zero rows
        static::addGlobalScope('tenant', function (Builder $builder) {
            try {
                if (auth()->check()) {
                    $user = auth()->user();
                    if ($user && method_exists($user, 'currentTenantId')) {
                        $tenantId = $user->currentTenantId();
                        if ($tenantId) {
                            $builder->where($builder->getModel()->getTable() . '.tenant_id', $tenantId);
                        } else {
                            // Authenticated user without tenant - fail closed (return zero rows)
                            $builder->whereRaw('1 = 0');
                        }
                    }
                }
            } catch (\Exception $e) {
                // Gracefully handle auth unavailability (queues, seeders, etc.)
                // No scoping applied when auth is completely unavailable
            }
        });

        // Automatically set tenant_id on create
        static::creating(function (Model $model) {
            try {
                if (!$model->tenant_id && auth()->check() && auth()->user() && method_exists(auth()->user(), 'currentTenantId')) {
                    $model->tenant_id = auth()->user()->currentTenantId();
                }
            } catch (\Exception $e) {
                // Gracefully handle auth unavailability
            }
        });
    }
}
