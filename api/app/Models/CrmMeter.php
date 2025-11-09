<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class CrmMeter extends Model
{
    protected $fillable = [
        'connection_id',
        'serial',
        'brand',
        'size_mm',
        'install_date',
        'last_read',
        'last_read_at',
        'status',
        'meta',
    ];

    protected $casts = [
        'install_date' => 'date',
        'last_read_at' => 'datetime',
        'last_read' => 'decimal:2',
        'meta' => 'array',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                try {
                    $query->whereHas('connection.premise', function ($q) {
                        $q->where('tenant_id', auth()->user()->currentTenantId());
                    });
                } catch (\RuntimeException $e) {
                    $query->whereRaw('1 = 0');
                }
            }
        });
    }

    public function connection(): BelongsTo
    {
        return $this->belongsTo(CrmServiceConnection::class, 'connection_id');
    }

    public function reads(): HasMany
    {
        return $this->hasMany(CrmCustomerRead::class, 'meter_id');
    }

    public function raCases(): HasMany
    {
        return $this->hasMany(CrmRaCase::class, 'meter_id');
    }
}
