<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class PmComplianceMetric extends Model
{
    protected $fillable = [
        'tenant_id',
        'period_start',
        'period_end',
        'pm_scheduled',
        'pm_completed_on_time',
        'pm_completed_late',
        'pm_deferred',
        'pm_skipped',
        'breakdown_wo',
        'compliance_pct',
        'pm_breakdown_ratio',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'compliance_pct' => 'decimal:2',
        'pm_breakdown_ratio' => 'decimal:4',
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

}
