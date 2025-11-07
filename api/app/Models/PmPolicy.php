<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PmPolicy extends Model
{
    protected $fillable = [
        'asset_class_id',
        'asset_id',
        'title',
        'strategy',
        'interval_days',
        'interval_meter',
        'due_rule',
        'window',
        'priority',
        'sla_hours',
        'checklist_schema',
    ];

    protected $casts = [
        'interval_meter' => 'decimal:4',
        'due_rule' => 'array',
        'window' => 'array',
        'checklist_schema' => 'array',
    ];

    public function assetClass(): BelongsTo
    {
        return $this->belongsTo(AssetClass::class);
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(PmSchedule::class);
    }
}
