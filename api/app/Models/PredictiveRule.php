<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class PredictiveRule extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'asset_class_id',
        'conditions',
        'job_plan_id',
        'wo_priority',
        'is_active',
    ];

    protected $casts = [
        'conditions' => 'array',
        'is_active' => 'boolean',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                try {
                    $query->where('tenant_id', auth()->user()->currentTenantId());
                } catch (\RuntimeException $e) {
                    $query->whereRaw('1 = 0');
                }
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'tenant_id');
    }

    public function assetClass(): BelongsTo
    {
        return $this->belongsTo(AssetClass::class);
    }

    public function jobPlan(): BelongsTo
    {
        return $this->belongsTo(JobPlan::class);
    }

    public function triggers(): HasMany
    {
        return $this->hasMany(PredictiveTrigger::class, 'rule_id');
    }
}
