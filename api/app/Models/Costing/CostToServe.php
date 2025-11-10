<?php

namespace App\Models\Costing;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class CostToServe extends Model
{
    use HasFactory;

    protected $table = 'cost_to_serve';

    protected $fillable = [
        'tenant_id',
        'period',
        'scheme_id',
        'dma_id',
        'class',
        'production_m3',
        'billed_m3',
        'opex_cost',
        'capex_depr',
        'energy_kwh',
        'energy_cost',
        'chemical_cost',
        'other_cost',
        'cost_per_m3',
        'revenue_per_m3',
        'margin_per_m3',
    ];

    protected $casts = [
        'period' => 'date',
        'production_m3' => 'decimal:2',
        'billed_m3' => 'decimal:2',
        'opex_cost' => 'decimal:2',
        'capex_depr' => 'decimal:2',
        'energy_kwh' => 'decimal:2',
        'energy_cost' => 'decimal:2',
        'chemical_cost' => 'decimal:2',
        'other_cost' => 'decimal:2',
        'cost_per_m3' => 'decimal:4',
        'revenue_per_m3' => 'decimal:4',
        'margin_per_m3' => 'decimal:4',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('cost_to_serve.tenant_id', auth()->user()->tenant_id);
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
