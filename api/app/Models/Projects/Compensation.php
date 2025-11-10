<?php

namespace App\Models\Projects;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Compensation extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'parcel_id',
        'comp_no',
        'valuation_amount',
        'negotiated_amount',
        'paid_amount',
        'comp_type',
        'valuation_date',
        'payment_date',
        'payment_reference',
        'status',
        'valuation_notes',
        'valued_by',
        'approved_by',
        'approved_at',
        'meta',
    ];

    protected $casts = [
        'valuation_amount' => 'decimal:2',
        'negotiated_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'valuation_date' => 'date',
        'payment_date' => 'date',
        'approved_at' => 'datetime',
        'meta' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('compensations.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function parcel()
    {
        return $this->belongsTo(LandParcel::class, 'parcel_id');
    }

    public function valuator()
    {
        return $this->belongsTo(User::class, 'valued_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
