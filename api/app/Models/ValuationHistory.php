<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class ValuationHistory extends Model
{
    protected $fillable = [
        'inventory_location_id',
        'snapshot_date',
        'qty',
        'unit_cost',
        'total_value',
    ];

    protected $casts = [
        'snapshot_date' => 'date',
        'qty' => 'decimal:2',
        'unit_cost' => 'decimal:4',
        'total_value' => 'decimal:2',
    ];

    public function inventoryLocation(): BelongsTo
    {
        return $this->belongsTo(InventoryLocation::class);
    }
}
