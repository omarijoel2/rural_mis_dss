<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class Facility extends Model
{
    use HasFactory, HasUuids, SoftDeletes, HasSpatial;

    protected $fillable = [
        'tenant_id',
        'scheme_id',
        'code',
        'name',
        'category',
        'status',
        'location',
        'address',
        'commissioned_on',
        'meta',
    ];

    protected $casts = [
        'location' => Point::class,
        'commissioned_on' => 'date',
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

    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'entity');
    }
}
