<?php

namespace App\Models;

use App\Models\Traits\HasTenancy;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use MatanYadaev\EloquentSpatial\Objects\MultiPolygon;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class Outage extends Model
{
    use HasUuids, SoftDeletes, HasTenancy, HasSpatial;

    protected $fillable = [
        'tenant_id',
        'scheme_id',
        'dma_id',
        'code',
        'cause',
        'state',
        'starts_at',
        'ends_at',
        'actual_restored_at',
        'estimated_customers_affected',
        'actual_customers_affected',
        'affected_stats',
        'notifications',
        'isolation_plan',
        'summary',
        'affected_geom',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'actual_restored_at' => 'datetime',
        'estimated_customers_affected' => 'integer',
        'actual_customers_affected' => 'integer',
        'affected_stats' => 'array',
        'notifications' => 'array',
        'isolation_plan' => 'array',
        'affected_geom' => MultiPolygon::class,
    ];


    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'tenant_id');
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(Scheme::class);
    }

    public function dma(): BelongsTo
    {
        return $this->belongsTo(Dma::class);
    }

    public function audits(): HasMany
    {
        return $this->hasMany(OutageAudit::class);
    }
}
