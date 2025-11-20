<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait HasTenancy
{
    protected static function bootedHasTenancy(): void
    {
        // Automatically scope all queries by tenant_id
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check() && auth()->user()->currentTenantId()) {
                $builder->where(static::getTable() . '.tenant_id', auth()->user()->currentTenantId());
            }
        });

        // Automatically set tenant_id on create
        static::creating(function (Model $model) {
            if (auth()->check() && !$model->tenant_id) {
                $model->tenant_id = auth()->user()->currentTenantId();
            }
        });
    }
}
