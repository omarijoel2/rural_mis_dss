<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TelemetryMeasurement extends Model
{
    use HasUuids;

    protected $fillable = [
        'telemetry_tag_id',
        'ts',
        'value',
        'meta',
    ];

    protected $casts = [
        'ts' => 'datetime',
        'value' => 'float',
        'meta' => 'array',
    ];

    public function telemetryTag(): BelongsTo
    {
        return $this->belongsTo(TelemetryTag::class);
    }
}
