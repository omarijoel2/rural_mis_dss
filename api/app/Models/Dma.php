<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use MatanYadaev\EloquentSpatial\Objects\Polygon;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class Dma extends Model
{
    use HasFactory, HasUuids, SoftDeletes, HasSpatial;

    protected $fillable = [
        'tenant_id',
        'scheme_id',
        'code',
        'name',
        'status',
        'geom',
        'nightline_threshold_m3h',
        'pressure_target_bar',
        'meta',
    ];

    protected $casts = [
        'geom' => Polygon::class,
        'nightline_threshold_m3h' => 'decimal:2',
        'pressure_target_bar' => 'decimal:2',
        'meta' => 'array',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function scheme()
    {
        return $this->belongsTo(Scheme::class);
    }
}
