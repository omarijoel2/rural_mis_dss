<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class SlaBreach extends Model
{
    protected $fillable = [
        'work_order_id',
        'sla_policy_id',
        'service_contract_id',
        'breach_type',
        'target_minutes',
        'actual_minutes',
        'variance_minutes',
        'penalty_value',
        'waived',
        'waived_by',
        'waived_reason',
        'breached_at',
    ];

    protected $casts = [
        'penalty_value' => 'decimal:2',
        'waived' => 'boolean',
        'breached_at' => 'datetime',
    ];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function slaPolicy(): BelongsTo
    {
        return $this->belongsTo(SlaPolicy::class);
    }

    public function serviceContract(): BelongsTo
    {
        return $this->belongsTo(ServiceContract::class);
    }

    public function waivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'waived_by');
    }
}
