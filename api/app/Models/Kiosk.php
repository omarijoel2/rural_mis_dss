<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kiosk extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'kiosks';

    protected $fillable = [
        'tenant_id',
        'scheme_id',
        'dma_id',
        'kiosk_code',
        'name',
        'vendor_name',
        'vendor_phone',
        'status',
        'daily_sales_m3',
        'balance',
    ];

    protected $casts = [
        'daily_sales_m3' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(Scheme::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(KioskSale::class);
    }
}
