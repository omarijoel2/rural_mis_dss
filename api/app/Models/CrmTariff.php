<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class CrmTariff extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
        'valid_from',
        'valid_to',
        'blocks',
        'fixed_charge',
        'currency',
    ];

    protected $casts = [
        'valid_from' => 'date',
        'valid_to' => 'date',
        'blocks' => 'array',
        'fixed_charge' => 'decimal:2',
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
}
