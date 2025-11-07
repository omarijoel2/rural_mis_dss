<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use MatanYadaev\EloquentSpatial\Objects\Polygon;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class Zone extends Model
{
    use HasFactory, HasUuids, SoftDeletes, HasSpatial;

    protected $fillable = [
        'tenant_id',
        'scheme_id',
        'type',
        'code',
        'name',
        'geom',
        'meta',
    ];

    protected $casts = [
        'geom' => Polygon::class,
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
