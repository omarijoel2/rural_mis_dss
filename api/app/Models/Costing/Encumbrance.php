<?php

namespace App\Models\Costing;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Encumbrance extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'entity_type',
        'entity_id',
        'cost_center_id',
        'period',
        'amount',
        'released',
        'released_at',
    ];

    protected $casts = [
        'period' => 'date',
        'amount' => 'decimal:2',
        'released' => 'boolean',
        'released_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('encumbrances.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function costCenter()
    {
        return $this->belongsTo(CostCenter::class);
    }
}
