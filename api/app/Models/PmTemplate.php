<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class PmTemplate extends Model
{
    protected $fillable = [
        'tenant_id',
        'asset_class_id',
        'job_plan_id',
        'name',
        'description',
        'trigger_type',
        'frequency_days',
        'tolerance_days',
        'usage_counters',
        'is_active',
        'checklist',
        'kit',
        'next_gen_date',
    ];

    protected $casts = [
        'usage_counters' => 'array',
        'is_active' => 'boolean',
        'checklist' => 'array',
        'kit' => 'array',
        'next_gen_date' => 'date',
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

    public function generationLogs(): HasMany
    {
        return $this->hasMany(PmGenerationLog::class);
    }

    public function deferrals(): HasMany
    {
        return $this->hasMany(PmDeferral::class);
    }
}
