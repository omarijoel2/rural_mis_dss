<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetHealthScore extends Model
{
    protected $fillable = [
        'asset_id',
        'score_date',
        'overall_score',
        'condition_score',
        'reliability_score',
        'age_score',
        'mtbf_days',
        'rul_days',
        'factors',
    ];

    protected $casts = [
        'score_date' => 'date',
        'overall_score' => 'decimal:2',
        'condition_score' => 'decimal:2',
        'reliability_score' => 'decimal:2',
        'age_score' => 'decimal:2',
        'factors' => 'array',
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}
