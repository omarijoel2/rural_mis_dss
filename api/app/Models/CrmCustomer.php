<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class CrmCustomer extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
        'id_no',
        'phone',
        'email',
        'alt_contact',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
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

    public function serviceConnections(): HasMany
    {
        return $this->hasMany(CrmServiceConnection::class, 'customer_id');
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(CrmInteraction::class, 'customer_id');
    }

    public function complaints(): HasMany
    {
        return $this->hasMany(CrmComplaint::class, 'customer_id');
    }
}
