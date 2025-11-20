<?php

namespace App\Models;

use App\Models\Traits\HasTenancy;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class TelemetryTag extends Model
{
    use HasUuids, SoftDeletes, HasTenancy;

    protected $fillable = [
        'tenant_id',
        'scheme_id',
        'asset_id',
        'network_node_id',
        'tag',
        'io_type',
        'unit',
        'scale',
        'thresholds',
        'enabled',
    ];

    protected $casts = [
        'scale' => 'array',
        'thresholds' => 'array',
        'enabled' => 'boolean',
    ];


    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'tenant_id');
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(Scheme::class);
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function networkNode(): BelongsTo
    {
        return $this->belongsTo(NetworkNode::class);
    }

    public function measurements(): HasMany
    {
        return $this->hasMany(TelemetryMeasurement::class);
    }
}
