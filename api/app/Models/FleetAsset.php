<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class FleetAsset extends Model
{
    protected $fillable = [
        'tenant_id',
        'asset_id',
        'reg_num',
        'make',
        'model_name',
        'year',
        'odometer',
        'engine_hours',
        'fuel_type',
        'fuel_capacity',
        'avg_consumption',
        'assigned_to',
    ];

    protected $casts = [
        'odometer' => 'decimal:2',
        'engine_hours' => 'decimal:2',
        'fuel_capacity' => 'decimal:2',
        'avg_consumption' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                try {
                    $query->where('tenant_id', auth()->user()->currentTenantId());
                } catch (\RuntimeException $e) {
                    $query->whereRaw('1 = 0');
                }
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'tenant_id');
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function serviceSchedules(): HasMany
    {
        return $this->hasMany(ServiceSchedule::class);
    }

    public function fuelLogs(): HasMany
    {
        return $this->hasMany(FuelLog::class);
    }

    public function uptimeLogs(): HasMany
    {
        return $this->hasMany(FleetUptimeLog::class);
    }
}
