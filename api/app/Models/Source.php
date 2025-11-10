<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class Source extends Model
{
    use HasSpatial, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'scheme_id',
        'name',
        'code',
        'kind_id',
        'status_id',
        'catchment',
        'elevation_m',
        'depth_m',
        'static_level_m',
        'dynamic_level_m',
        'capacity_m3_per_day',
        'permit_no',
        'permit_expiry',
        'quality_risk_id',
        'location',
        'meta',
    ];

    protected $casts = [
        'elevation_m' => 'decimal:2',
        'depth_m' => 'decimal:2',
        'static_level_m' => 'decimal:2',
        'dynamic_level_m' => 'decimal:2',
        'capacity_m3_per_day' => 'decimal:2',
        'permit_expiry' => 'date',
        'location' => Point::class,
        'meta' => 'array',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (!auth()->check()) {
                $query->whereRaw('1 = 0');
                return;
            }

            try {
                $query->where('tenant_id', auth()->user()->currentTenantId());
            } catch (\RuntimeException $e) {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'tenant_id');
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(Scheme::class);
    }

    public function kind(): BelongsTo
    {
        return $this->belongsTo(SourceKind::class, 'kind_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(SourceStatus::class, 'status_id');
    }

    public function qualityRisk(): BelongsTo
    {
        return $this->belongsTo(QualityRiskLevel::class, 'quality_risk_id');
    }

    public function abstractionLogs(): HasMany
    {
        return $this->hasMany(AbstractionLog::class);
    }
}
