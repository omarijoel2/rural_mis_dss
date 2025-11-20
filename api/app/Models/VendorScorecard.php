<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class VendorScorecard extends Model
{
    protected $fillable = [
        'service_contract_id',
        'period_start',
        'period_end',
        'wo_assigned',
        'wo_completed',
        'wo_on_time',
        'avg_response_min',
        'avg_resolution_min',
        'sla_breach_count',
        'quality_score',
        'safety_score',
        'rating',
        'notes',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'quality_score' => 'decimal:2',
        'safety_score' => 'decimal:2',
    ];

    public function serviceContract(): BelongsTo
    {
        return $this->belongsTo(ServiceContract::class);
    }
}
