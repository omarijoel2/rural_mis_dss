<?php

namespace App\Models;

use App\Models\Traits\HasTenancy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class TopologyValidation extends Model
{
    use HasFactory, HasUuids, HasSpatial, HasTenancy;

    protected $fillable = [
        'tenant_id',
        'edit_layer_id',
        'validation_type',
        'severity',
        'entity_type',
        'entity_id',
        'message',
        'details',
        'location',
        'resolved',
        'resolved_by',
        'resolved_at',
    ];

    protected $casts = [
        'details' => 'array',
        'location' => Point::class,
        'resolved' => 'boolean',
        'resolved_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function editLayer()
    {
        return $this->belongsTo(SpatialEditLayer::class, 'edit_layer_id');
    }

    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
