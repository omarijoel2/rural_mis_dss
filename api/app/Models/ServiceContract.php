<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class ServiceContract extends Model
{
    protected $fillable = [
        'tenant_id',
        'contract_num',
        'supplier_id',
        'title',
        'scope',
        'start_date',
        'end_date',
        'contract_value',
        'contract_type',
        'rates',
        'kpis',
        'penalty_rate',
        'bonus_rate',
        'status',
        'document_path',
        'owner_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'contract_value' => 'decimal:2',
        'rates' => 'array',
        'kpis' => 'array',
        'penalty_rate' => 'decimal:2',
        'bonus_rate' => 'decimal:2',
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

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function scorecards(): HasMany
    {
        return $this->hasMany(VendorScorecard::class);
    }

    public function slaBreaches(): HasMany
    {
        return $this->hasMany(SlaBreach::class);
    }
}
