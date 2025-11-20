<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConditionAlarm extends Model
{
    protected $fillable = [
        'tag_id',
        'severity',
        'value',
        'threshold',
        'state',
        'raised_at',
        'acknowledged_at',
        'acknowledged_by',
        'cleared_at',
        'ack_notes',
        'work_order_id',
    ];

    protected $casts = [
        'value' => 'decimal:4',
        'threshold' => 'decimal:4',
        'raised_at' => 'datetime',
        'acknowledged_at' => 'datetime',
        'cleared_at' => 'datetime',
    ];

    public function conditionTag(): BelongsTo
    {
        return $this->belongsTo(ConditionTag::class, 'tag_id');
    }

    public function acknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }
}
