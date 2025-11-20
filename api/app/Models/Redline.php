<?php

namespace App\Models;

use App\Models\Traits\HasTenancy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use MatanYadaev\EloquentSpatial\Objects\Geometry;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class Redline extends Model
{
    use HasFactory, HasUuids, HasSpatial, HasTenancy;

    protected $fillable = [
        'tenant_id',
        'edit_layer_id',
        'entity_type',
        'entity_id',
        'operation',
        'attributes_before',
        'attributes_after',
        'geom_before',
        'geom_after',
        'captured_by',
        'captured_at',
        'capture_method',
        'gps_accuracy_m',
        'evidence',
        'field_notes',
    ];

    protected $casts = [
        'attributes_before' => 'array',
        'attributes_after' => 'array',
        'geom_before' => Geometry::class,
        'geom_after' => Geometry::class,
        'captured_at' => 'datetime',
        'gps_accuracy_m' => 'decimal:2',
        'evidence' => 'array',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function editLayer()
    {
        return $this->belongsTo(SpatialEditLayer::class, 'edit_layer_id');
    }

    public function capturedBy()
    {
        return $this->belongsTo(User::class, 'captured_by');
    }
}
