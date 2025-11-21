<?php

namespace App\Models\Procurement;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Lpo extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'lpo_no',
        'rfq_id',
        'vendor_id',
        'order_date',
        'delivery_date',
        'total_amount',
        'terms_conditions',
        'status',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'order_date' => 'date',
        'delivery_date' => 'date',
        'total_amount' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('lpos.tenant_id', auth()->user()->tenant_id);
            }
        });

        static::creating(function ($lpo) {
            if (!$lpo->lpo_no) {
                $lpo->lpo_no = 'LPO-' . now()->format('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function rfq()
    {
        return $this->belongsTo(Rfq::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function items()
    {
        return $this->hasMany(LpoItem::class);
    }
}
