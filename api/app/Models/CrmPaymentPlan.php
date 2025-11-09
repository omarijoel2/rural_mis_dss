<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class CrmPaymentPlan extends Model
{
    protected $fillable = [
        'tenant_id',
        'account_no',
        'status',
        'schedule',
        'next_due',
    ];

    protected $casts = [
        'schedule' => 'array',
        'next_due' => 'date',
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
