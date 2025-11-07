<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WoPart extends Model
{
    protected $fillable = ['work_order_id', 'part_id', 'qty', 'unit_cost'];
    protected $casts = ['qty' => 'decimal:4', 'unit_cost' => 'decimal:2'];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function part(): BelongsTo
    {
        return $this->belongsTo(Part::class);
    }
}
