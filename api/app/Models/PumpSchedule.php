<?php

namespace App\Models;

use App\Models\Traits\HasTenancy;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class PumpSchedule extends Model
{
    use HasUuids, SoftDeletes, HasTenancy;

    protected $fillable = [
        'tenant_id',
        'asset_id',
        'scheme_id',
        'start_at',
        'end_at',
        'status',
        'constraints',
        'source',
        'target_volume_m3',
        'actual_volume_m3',
        'energy_cost',
        'notes',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'constraints' => 'array',
        'target_volume_m3' => 'decimal:2',
        'actual_volume_m3' => 'decimal:2',
        'energy_cost' => 'decimal:2',
    ];


    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'tenant_id');
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(Scheme::class);
    }
}
