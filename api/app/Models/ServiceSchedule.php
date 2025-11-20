<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class ServiceSchedule extends Model
{
    protected $fillable = [
        'fleet_asset_id',
        'service_type',
        'interval_km',
        'interval_hours',
        'last_km',
        'last_hours',
        'next_km',
        'next_hours',
        'last_wo_id',
        'next_wo_id',
    ];

    protected $casts = [
        'interval_km' => 'decimal:2',
        'interval_hours' => 'decimal:2',
        'last_km' => 'decimal:2',
        'last_hours' => 'decimal:2',
        'next_km' => 'decimal:2',
        'next_hours' => 'decimal:2',
    ];

    public function fleetAsset(): BelongsTo
    {
        return $this->belongsTo(FleetAsset::class);
    }

    public function lastWorkOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class, 'last_wo_id');
    }

    public function nextWorkOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class, 'next_wo_id');
    }
}
