<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KioskSale extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'kiosk_sales';

    protected $fillable = [
        'kiosk_id',
        'sale_date',
        'volume_m3',
        'amount',
        'receipt_no',
    ];

    protected $casts = [
        'sale_date' => 'date',
        'volume_m3' => 'decimal:2',
        'amount' => 'decimal:2',
    ];

    public function kiosk(): BelongsTo
    {
        return $this->belongsTo(Kiosk::class);
    }
}
