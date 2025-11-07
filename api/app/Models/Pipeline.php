<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use MatanYadaev\EloquentSpatial\Objects\LineString;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class Pipeline extends Model
{
    use HasFactory, HasUuids, SoftDeletes, HasSpatial;

    protected $fillable = [
        'tenant_id',
        'scheme_id',
        'code',
        'material',
        'diameter_mm',
        'install_year',
        'status',
        'geom',
        'meta',
    ];

    protected $casts = [
        'geom' => LineString::class,
        'diameter_mm' => 'integer',
        'install_year' => 'integer',
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
