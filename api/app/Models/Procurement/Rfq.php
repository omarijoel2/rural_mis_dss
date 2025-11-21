<?php

namespace App\Models\Procurement;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Rfq extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'rfq_no',
        'requisition_id',
        'title',
        'description',
        'issue_date',
        'submission_deadline',
        'status',
        'evaluation_criteria',
        'awarded_vendor_id',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'submission_deadline' => 'date',
        'evaluation_criteria' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('rfqs.tenant_id', auth()->user()->tenant_id);
            }
        });

        static::creating(function ($rfq) {
            if (!$rfq->rfq_no) {
                $rfq->rfq_no = 'RFQ-' . now()->format('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function requisition()
    {
        return $this->belongsTo(Requisition::class);
    }

    public function items()
    {
        return $this->hasMany(RfqItem::class);
    }

    public function invitations()
    {
        return $this->hasMany(RfqInvitation::class);
    }

    public function bids()
    {
        return $this->hasMany(Bid::class);
    }

    public function awardedVendor()
    {
        return $this->belongsTo(Vendor::class, 'awarded_vendor_id');
    }
}
