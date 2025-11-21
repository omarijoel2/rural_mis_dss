<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class CrmKiosk extends Model
{
    protected $fillable = [
        'tenant_id',
        'kiosk_code',
        'vendor_name',
        'vendor_phone',
        'location',
        'coordinates',
        'daily_target',
        'today_sales',
        'balance',
        'status',
    ];

    protected $casts = [
        'coordinates' => 'array',
        'daily_target' => 'decimal:2',
        'today_sales' => 'decimal:2',
        'balance' => 'decimal:2',
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
