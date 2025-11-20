<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class FuelLog extends Model
{
    protected $fillable = [
        'fleet_asset_id',
        'filled_at',
        'filled_by',
        'odometer',
        'fuel_qty',
        'fuel_cost',
        'receipt_path',
        'vendor',
    ];

    protected $casts = [
        'filled_at' => 'datetime',
        'odometer' => 'decimal:2',
        'fuel_qty' => 'decimal:2',
        'fuel_cost' => 'decimal:2',
    ];

    public function fleetAsset(): BelongsTo
    {
        return $this->belongsTo(FleetAsset::class);
    }

    public function filledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'filled_by');
    }
}
