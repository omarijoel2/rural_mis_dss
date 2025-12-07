<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeterReadingCycle extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'meter_reading_cycles';

    protected $fillable = [
        'tenant_id',
        'route_id',
        'period_start',
        'period_end',
        'status',
        'meters_total',
        'meters_read',
        'anomalies_count',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'meters_total' => 'integer',
        'meters_read' => 'integer',
        'anomalies_count' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function route(): BelongsTo
    {
        return $this->belongsTo(MeterRoute::class, 'route_id');
    }
}
