<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class InventoryLocation extends Model
{
    protected $fillable = [
        'part_id',
        'store_id',
        'bin_id',
        'qty_on_hand',
        'qty_reserved',
        'qty_available',
        'reorder_point',
        'reorder_qty',
        'unit_cost',
        'valuation_method',
        'last_counted_at',
    ];

    protected $casts = [
        'qty_on_hand' => 'decimal:2',
        'qty_reserved' => 'decimal:2',
        'qty_available' => 'decimal:2',
        'reorder_point' => 'decimal:2',
        'reorder_qty' => 'decimal:2',
        'unit_cost' => 'decimal:4',
        'last_counted_at' => 'datetime',
    ];

    public function part(): BelongsTo
    {
        return $this->belongsTo(Part::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function bin(): BelongsTo
    {
        return $this->belongsTo(Bin::class);
    }

    public function valuationHistory(): HasMany
    {
        return $this->hasMany(ValuationHistory::class);
    }
}
