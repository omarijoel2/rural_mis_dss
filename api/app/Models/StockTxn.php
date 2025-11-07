<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockTxn extends Model
{
    protected $fillable = ['part_id', 'kind', 'qty', 'unit_cost', 'ref', 'work_order_id', 'occurred_at'];
    protected $casts = ['qty' => 'decimal:4', 'unit_cost' => 'decimal:2', 'occurred_at' => 'datetime'];

    public function part(): BelongsTo
    {
        return $this->belongsTo(Part::class);
    }

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }
}
