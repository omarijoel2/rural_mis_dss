<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WoLabor extends Model
{
    protected $fillable = ['work_order_id', 'user_id', 'hours', 'rate'];
    protected $casts = ['hours' => 'decimal:2', 'rate' => 'decimal:2'];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
