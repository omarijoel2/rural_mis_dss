<?php

namespace App\Models\Costing;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class ChemicalTariff extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'name',
        'valid_from',
        'valid_to',
        'item_code',
        'unit_cost',
        'unit',
        'currency',
    ];

    protected $casts = [
        'valid_from' => 'date',
        'valid_to' => 'date',
        'unit_cost' => 'decimal:4',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('chemical_tariffs.tenant_id', auth()->user()->tenant_id);
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
