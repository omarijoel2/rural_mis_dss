<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Objects\Polygon;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class Scheme extends Model
{
    use HasFactory, HasUuids, SoftDeletes, HasSpatial;

    protected $fillable = [
        'tenant_id',
        'org_id',
        'code',
        'name',
        'type',
        'population_estimate',
        'status',
        'geom',
        'centroid',
        'elevation_m',
        'meta',
    ];

    protected $casts = [
        'geom' => Polygon::class,
        'centroid' => Point::class,
        'meta' => 'array',
        'population_estimate' => 'integer',
        'elevation_m' => 'decimal:2',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }

    public function facilities()
    {
        return $this->hasMany(Facility::class);
    }

    public function dmas()
    {
        return $this->hasMany(Dma::class);
    }

    public function pipelines()
    {
        return $this->hasMany(Pipeline::class);
    }

    public function zones()
    {
        return $this->hasMany(Zone::class);
    }
}
