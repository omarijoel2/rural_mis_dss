<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class CrmMeterRoute extends Model
{
    protected $fillable = [
        'tenant_id',
        'route_code',
        'area',
        'assigned_to',
        'meters_count',
        'status',
        'last_read_date',
        'completion_rate',
    ];

    protected $casts = [
        'last_read_date' => 'date',
        'completion_rate' => 'decimal:2',
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
