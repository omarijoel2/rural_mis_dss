<?php

namespace App\Models;

use App\Models\Traits\HasTenancy;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class NrwSnapshot extends Model
{
    use HasUuids, SoftDeletes, HasTenancy;

    protected $fillable = [
        'tenant_id',
        'dma_id',
        'as_of',
        'system_input_volume_m3',
        'billed_authorized_m3',
        'unbilled_authorized_m3',
        'apparent_losses_m3',
        'real_losses_m3',
        'nrw_m3',
        'nrw_pct',
    ];

    protected $casts = [
        'as_of' => 'date',
        'system_input_volume_m3' => 'decimal:2',
        'billed_authorized_m3' => 'decimal:2',
        'unbilled_authorized_m3' => 'decimal:2',
        'apparent_losses_m3' => 'decimal:2',
        'real_losses_m3' => 'decimal:2',
        'nrw_m3' => 'decimal:2',
        'nrw_pct' => 'decimal:3',
    ];


    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'tenant_id');
    }

    public function dma(): BelongsTo
    {
        return $this->belongsTo(Dma::class);
    }
}
