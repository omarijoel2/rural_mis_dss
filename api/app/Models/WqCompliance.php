<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WqCompliance extends Model
{
    protected $fillable = [
        'sampling_point_id',
        'parameter_id',
        'period',
        'granularity',
        'samples_taken',
        'samples_compliant',
        'compliance_pct',
        'worst_value',
        'breaches',
    ];

    protected $casts = [
        'period' => 'date',
        'samples_taken' => 'integer',
        'samples_compliant' => 'integer',
        'compliance_pct' => 'float',
        'worst_value' => 'float',
        'breaches' => 'integer',
    ];

    public function samplingPoint(): BelongsTo
    {
        return $this->belongsTo(WqSamplingPoint::class, 'sampling_point_id');
    }

    public function parameter(): BelongsTo
    {
        return $this->belongsTo(WqParameter::class, 'parameter_id');
    }
}
