<?php

namespace App\Models\Procurement;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RfqItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'rfq_id',
        'description',
        'quantity',
        'unit',
        'specifications',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'specifications' => 'array',
    ];

    public function rfq()
    {
        return $this->belongsTo(Rfq::class);
    }
}
