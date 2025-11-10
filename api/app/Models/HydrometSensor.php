<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;

class HydrometSensor extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'station_id',
        'parameter_id',
        'make',
        'model',
        'serial_number',
        'multiplier',
        'offset',
        'installed_at',
        'calibrated_at',
        'active',
        'meta',
    ];

    protected $casts = [
        'multiplier' => 'decimal:4',
        'offset' => 'decimal:4',
        'installed_at' => 'date',
        'calibrated_at' => 'date',
        'active' => 'boolean',
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
                $tenantId = auth()->user()->currentTenantId();
                $query->whereHas('station', function (Builder $q) use ($tenantId) {
                    $q->where('tenant_id', $tenantId);
                });
            } catch (\RuntimeException $e) {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function station(): BelongsTo
    {
        return $this->belongsTo(HydrometStation::class, 'station_id');
    }

    public function parameter(): BelongsTo
    {
        return $this->belongsTo(SensorParameter::class, 'parameter_id');
    }
}
