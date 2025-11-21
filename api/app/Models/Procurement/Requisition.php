<?php

namespace App\Models\Procurement;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Requisition extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'requisition_no',
        'requestor_id',
        'department_id',
        'required_date',
        'justification',
        'status',
        'total_estimate',
        'approved_by',
        'approved_at',
        'rejection_reason',
    ];

    protected $casts = [
        'required_date' => 'date',
        'total_estimate' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('requisitions.tenant_id', auth()->user()->tenant_id);
            }
        });

        static::creating(function ($requisition) {
            if (!$requisition->requisition_no) {
                $requisition->requisition_no = 'REQ-' . now()->format('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function requestor()
    {
        return $this->belongsTo(User::class, 'requestor_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function items()
    {
        return $this->hasMany(RequisitionItem::class);
    }

    public function rfq()
    {
        return $this->hasOne(Rfq::class);
    }
}
