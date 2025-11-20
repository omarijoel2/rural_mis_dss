<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class WoTransition extends Model
{
    protected $fillable = [
        'work_order_id',
        'from_status',
        'to_status',
        'transitioned_by',
        'notes',
        'transitioned_at',
    ];

    protected $casts = [
        'transitioned_at' => 'datetime',
    ];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function transitionedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'transitioned_by');
    }
}
