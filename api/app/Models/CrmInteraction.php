<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class CrmInteraction extends Model
{
    protected $fillable = [
        'tenant_id',
        'customer_id',
        'account_no',
        'channel',
        'subject',
        'message',
        'created_by',
        'status',
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

    public function customer(): BelongsTo
    {
        return $this->belongsTo(CrmCustomer::class, 'customer_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function connection(): BelongsTo
    {
        return $this->belongsTo(CrmServiceConnection::class, 'account_no', 'account_no');
    }
}
