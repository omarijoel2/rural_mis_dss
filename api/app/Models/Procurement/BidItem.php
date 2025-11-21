<?php

namespace App\Models\Procurement;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BidItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'bid_id',
        'rfq_item_id',
        'unit_price',
        'total_price',
        'remarks',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    public function bid()
    {
        return $this->belongsTo(Bid::class);
    }

    public function rfqItem()
    {
        return $this->belongsTo(RfqItem::class);
    }
}
