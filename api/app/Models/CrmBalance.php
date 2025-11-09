<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class CrmBalance extends Model
{
    protected $fillable = [
        'tenant_id',
        'account_no',
        'as_of',
        'balance',
        'aging',
    ];

    protected $casts = [
        'as_of' => 'date',
        'balance' => 'decimal:2',
        'aging' => 'array',
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
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'tenant_id');
    }

    public function connection(): BelongsTo
    {
        return $this->belongsTo(CrmServiceConnection::class, 'account_no', 'account_no');
    }
}
