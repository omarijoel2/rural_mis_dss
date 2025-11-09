<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Part extends Model
{
    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'category',
        'unit',
        'min_qty',
        'reorder_qty',
        'cost',
        'location',
    ];

    protected $casts = [
        'min_qty' => 'decimal:4',
        'reorder_qty' => 'decimal:4',
        'cost' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                try {
                    $query->where('tenant_id', auth()->user()->currentTenantId());
                } catch (\RuntimeException $e) {
                    // Tenant not selected - force empty results to prevent cross-tenant access
                    $query->whereRaw('1 = 0');
                }
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'tenant_id');
    }

    public function assetBoms(): HasMany
    {
        return $this->hasMany(AssetBom::class);
    }

    public function woParts(): HasMany
    {
        return $this->hasMany(WoPart::class);
    }

    public function stockTxns(): HasMany
    {
        return $this->hasMany(StockTxn::class);
    }
}
