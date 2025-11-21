<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class CrmWaterTruck extends Model
{
    protected $fillable = [
        'tenant_id',
        'truck_no',
        'driver_name',
        'phone',
        'capacity',
        'status',
        'trips_today',
        'revenue_today',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'trips_today' => 'integer',
        'revenue_today' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                try {
                    $query->where('tenant_id', auth()->user()->currentTenantId());
                } catch (\RuntimeException $e) {
                    $query->whereRaw('1 = 0');
                }
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }
}
