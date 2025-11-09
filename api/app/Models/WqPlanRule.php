<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WqPlanRule extends Model
{
    protected $fillable = [
        'plan_id',
        'point_kind',
        'parameter_group',
        'frequency',
        'sample_count',
        'container_type',
        'preservatives',
        'holding_time_hrs',
    ];

    protected $casts = [
        'sample_count' => 'integer',
        'holding_time_hrs' => 'integer',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(WqPlan::class, 'plan_id');
    }
}
