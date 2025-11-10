<?php

namespace App\Models\Costing;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class AllocationRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'name',
        'basis',
        'driver_id',
        'percentage',
        'formula',
        'applies_to',
        'active',
        'scope_filter',
    ];

    protected $casts = [
        'percentage' => 'decimal:2',
        'active' => 'boolean',
        'scope_filter' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('allocation_rules.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
