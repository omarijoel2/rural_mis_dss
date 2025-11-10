<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class HydrometStation extends Model
{
    use HasSpatial, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'scheme_id',
        'name',
        'code',
        'station_type_id',
        'elevation_m',
        'datasource_id',
        'active',
        'location',
        'meta',
    ];

    protected $casts = [
        'elevation_m' => 'decimal:2',
        'active' => 'boolean',
        'location' => Point::class,
        'meta' => 'array',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (!auth()->check()) {
                $query->whereRaw('1 = 0');
                return;
            }

            try {
                $query->where('tenant_id', auth()->user()->currentTenantId());
            } catch (\RuntimeException $e) {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'tenant_id');
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(Scheme::class);
    }

    public function stationType(): BelongsTo
    {
        return $this->belongsTo(StationType::class, 'station_type_id');
    }

    public function datasource(): BelongsTo
    {
        return $this->belongsTo(Datasource::class, 'datasource_id');
    }

    public function sensors(): HasMany
    {
        return $this->hasMany(HydrometSensor::class, 'station_id');
    }
}
