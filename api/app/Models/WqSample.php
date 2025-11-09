<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WqSample extends Model
{
    protected $fillable = [
        'sampling_point_id',
        'plan_id',
        'barcode',
        'scheduled_for',
        'collected_at',
        'collected_by',
        'temp_c_on_receipt',
        'custody_state',
        'photos',
        'chain',
    ];

    protected $casts = [
        'scheduled_for' => 'datetime',
        'collected_at' => 'datetime',
        'temp_c_on_receipt' => 'float',
        'photos' => 'array',
        'chain' => 'array',
    ];

    public function samplingPoint(): BelongsTo
    {
        return $this->belongsTo(WqSamplingPoint::class, 'sampling_point_id');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(WqPlan::class);
    }

    public function collectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    public function sampleParams(): HasMany
    {
        return $this->hasMany(WqSampleParam::class, 'sample_id');
    }

    public function qcControls(): HasMany
    {
        return $this->hasMany(WqQcControl::class, 'sample_id');
    }
}
