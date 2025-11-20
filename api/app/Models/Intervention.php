<?php

namespace App\Models;

use App\Models\Traits\HasTenancy;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Intervention extends Model
{
    use HasUuids, SoftDeletes, HasTenancy;

    protected $fillable = [
        'tenant_id',
        'dma_id',
        'asset_id',
        'type',
        'date',
        'estimated_savings_m3d',
        'realized_savings_m3d',
        'cost',
        'responsible',
        'follow_up_at',
        'evidence',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'follow_up_at' => 'date',
        'estimated_savings_m3d' => 'decimal:2',
        'realized_savings_m3d' => 'decimal:2',
        'cost' => 'decimal:2',
        'evidence' => 'array',
    ];


    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'tenant_id');
    }

    public function dma(): BelongsTo
    {
        return $this->belongsTo(Dma::class);
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}
