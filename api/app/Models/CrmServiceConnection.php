<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class CrmServiceConnection extends Model
{
    protected $fillable = [
        'premise_id',
        'customer_id',
        'account_no',
        'service_type',
        'status',
        'install_date',
        'disconnect_date',
        'meta',
    ];

    protected $casts = [
        'install_date' => 'date',
        'disconnect_date' => 'date',
        'meta' => 'array',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                try {
                    $query->whereHas('premise', function ($q) {
                        $q->where('tenant_id', auth()->user()->currentTenantId());
                    });
                } catch (\RuntimeException $e) {
                    $query->whereRaw('1 = 0');
                }
            }
        });
    }

    public function premise(): BelongsTo
    {
        return $this->belongsTo(CrmPremise::class, 'premise_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(CrmCustomer::class, 'customer_id');
    }

    public function meters(): HasMany
    {
        return $this->hasMany(CrmMeter::class, 'connection_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(CrmInvoice::class, 'account_no', 'account_no');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(CrmPayment::class, 'account_no', 'account_no');
    }

    public function balances(): HasMany
    {
        return $this->hasMany(CrmBalance::class, 'account_no', 'account_no');
    }
}
