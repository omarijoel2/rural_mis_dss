<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class FleetUptimeLog extends Model
{
    protected $fillable = [
        'fleet_asset_id',
        'log_date',
        'available_hours',
        'down_hours',
        'reason',
    ];

    protected $casts = [
        'log_date' => 'date',
        'available_hours' => 'decimal:2',
        'down_hours' => 'decimal:2',
    ];

    public function fleetAsset(): BelongsTo
    {
        return $this->belongsTo(FleetAsset::class);
    }
}
