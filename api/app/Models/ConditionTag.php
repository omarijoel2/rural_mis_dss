<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConditionTag extends Model
{
    protected $fillable = [
        'asset_id',
        'tag',
        'parameter',
        'unit',
        'thresholds',
        'last_value',
        'last_reading_at',
        'health_status',
        'is_active',
    ];

    protected $casts = [
        'thresholds' => 'array',
        'last_value' => 'decimal:4',
        'last_reading_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function alarms(): HasMany
    {
        return $this->hasMany(ConditionAlarm::class, 'tag_id');
    }

    public function readings(): HasMany
    {
        return $this->hasMany(ConditionReading::class, 'tag_id');
    }
}
