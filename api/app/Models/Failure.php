<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Failure extends Model
{
    protected $fillable = ['work_order_id', 'code', 'mode', 'cause', 'effect', 'remarks'];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }
}
