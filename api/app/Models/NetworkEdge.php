<?php

namespace App\Models;

use App\Models\Traits\HasTenancy;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use MatanYadaev\EloquentSpatial\Objects\LineString;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class NetworkEdge extends Model
{
    use HasUuids, SoftDeletes, HasTenancy, HasSpatial;

    protected $fillable = [
        'tenant_id',
        'scheme_id',
        'dma_id',
        'from_node_id',
        'to_node_id',
        'code',
        'type',
        'material',
        'diameter_mm',
        'length_m',
        'install_year',
        'status',
        'geom',
        'props',
    ];

    protected $casts = [
        'geom' => LineString::class,
        'props' => 'array',
        'diameter_mm' => 'integer',
        'length_m' => 'decimal:2',
        'install_year' => 'integer',
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

    public function fromNode(): BelongsTo
    {
        return $this->belongsTo(NetworkNode::class, 'from_node_id');
    }

    public function toNode(): BelongsTo
    {
        return $this->belongsTo(NetworkNode::class, 'to_node_id');
    }
}
