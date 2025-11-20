<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PredictiveTrigger extends Model
{
    protected $fillable = [
        'rule_id',
        'asset_id',
        'work_order_id',
        'condition_snapshot',
        'triggered_at',
        'status',
    ];

    protected $casts = [
        'condition_snapshot' => 'array',
        'triggered_at' => 'datetime',
    ];

    public function predictiveRule(): BelongsTo
    {
        return $this->belongsTo(PredictiveRule::class, 'rule_id');
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }
}
