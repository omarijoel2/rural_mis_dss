<?php

namespace App\Models\Procurement;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Bid extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'rfq_id',
        'vendor_id',
        'total_bid_amount',
        'delivery_days',
        'notes',
        'attachments',
        'submitted_at',
    ];

    protected $casts = [
        'total_bid_amount' => 'decimal:2',
        'attachments' => 'array',
        'submitted_at' => 'datetime',
    ];

    public function rfq()
    {
        return $this->belongsTo(Rfq::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function items()
    {
        return $this->hasMany(BidItem::class);
    }

    public function evaluations()
    {
        return $this->hasMany(BidEvaluation::class);
    }
}
