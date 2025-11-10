<?php

namespace App\Models\Costing;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class EnergyTariff extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'name',
        'valid_from',
        'valid_to',
        'peak_rate',
        'offpeak_rate',
        'demand_charge',
        'currency',
        'meta',
    ];

    protected $casts = [
        'valid_from' => 'date',
        'valid_to' => 'date',
        'peak_rate' => 'decimal:4',
        'offpeak_rate' => 'decimal:4',
        'demand_charge' => 'decimal:4',
        'meta' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('energy_tariffs.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
