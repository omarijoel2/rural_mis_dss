<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WqQcControl extends Model
{
    protected $fillable = [
        'sample_id',
        'parameter_id',
        'type',
        'target_value',
        'accepted_range',
        'outcome',
        'details',
    ];

    protected $casts = [
        'target_value' => 'float',
        'details' => 'array',
    ];

    public function sample(): BelongsTo
    {
        return $this->belongsTo(WqSample::class, 'sample_id');
    }

    public function parameter(): BelongsTo
    {
        return $this->belongsTo(WqParameter::class, 'parameter_id');
    }
}
