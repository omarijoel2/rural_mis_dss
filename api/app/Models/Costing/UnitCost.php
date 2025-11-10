<?php

namespace App\Models\Costing;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class UnitCost extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'item_code',
        'name',
        'unit',
        'method',
        'period',
        'unit_cost',
        'meta',
    ];

    protected $casts = [
        'period' => 'date',
        'unit_cost' => 'decimal:4',
        'meta' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('unit_costs.tenant_id', auth()->user()->tenant_id);
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
