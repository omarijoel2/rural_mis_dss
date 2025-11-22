<?php

namespace App\Models;

use App\Models\Traits\HasTenancy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class NetworkNode extends Model
{
    use HasUuids, SoftDeletes, HasSpatial, HasTenancy;

    protected $fillable = [
        'tenant_id',
        'scheme_id',
        'dma_id',
        'facility_id',
        'code',
        'name',
        'type',
        'elevation_m',
        'pressure_bar',
        'geom',
        'props',
    ];

    protected $casts = [
        'geom' => Point::class,
        'props' => 'array',
        'elevation_m' => 'decimal:2',
        'pressure_bar' => 'decimal:2',
    ];


    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(Scheme::class);
    }

    public function dma(): BelongsTo
    {
        return $this->belongsTo(Dma::class);
    }

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function incomingEdges(): HasMany
    {
        return $this->hasMany(NetworkEdge::class, 'to_node_id');
    }

    public function outgoingEdges(): HasMany
    {
        return $this->hasMany(NetworkEdge::class, 'from_node_id');
    }

    public function telemetryTags(): HasMany
    {
        return $this->hasMany(TelemetryTag::class);
    }
}
