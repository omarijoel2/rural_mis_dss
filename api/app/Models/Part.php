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
        'sku',
        'name',
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
            if (auth()->check() && auth()->user()->tenant_id) {
                $query->where('tenant_id', auth()->user()->tenant_id);
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
