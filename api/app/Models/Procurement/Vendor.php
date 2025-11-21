<?php

namespace App\Models\Procurement;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Vendor extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'vendor_code',
        'name',
        'email',
        'phone',
        'address',
        'category',
        'status',
        'performance_score',
        'meta',
    ];

    protected $casts = [
        'performance_score' => 'decimal:2',
        'meta' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('vendors.tenant_id', auth()->user()->tenant_id);
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function bids()
    {
        return $this->hasMany(Bid::class);
    }
}
