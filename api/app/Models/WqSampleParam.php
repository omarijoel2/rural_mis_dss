<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class WqSampleParam extends Model
{
    protected $fillable = [
        'sample_id',
        'parameter_id',
        'status',
        'method',
    ];

    public function sample(): BelongsTo
    {
        return $this->belongsTo(WqSample::class, 'sample_id');
    }

    public function parameter(): BelongsTo
    {
        return $this->belongsTo(WqParameter::class, 'parameter_id');
    }

    public function result(): HasOne
    {
        return $this->hasOne(WqResult::class, 'sample_param_id');
    }
}
