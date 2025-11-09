<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WqResult extends Model
{
    protected $fillable = [
        'sample_param_id',
        'value',
        'value_qualifier',
        'unit',
        'analyzed_at',
        'analyst_id',
        'instrument',
        'lod',
        'uncertainty',
        'qc_flags',
    ];

    protected $casts = [
        'value' => 'float',
        'analyzed_at' => 'datetime',
        'lod' => 'float',
        'uncertainty' => 'float',
        'qc_flags' => 'array',
    ];

    public function sampleParam(): BelongsTo
    {
        return $this->belongsTo(WqSampleParam::class, 'sample_param_id');
    }

    public function analyst(): BelongsTo
    {
        return $this->belongsTo(User::class, 'analyst_id');
    }
}
