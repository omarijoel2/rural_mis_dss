<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerTariff extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'customer_tariffs';

    protected $fillable = [
        'tenant_id',
        'tariff_code',
        'name',
        'category',
        'effective_date',
        'end_date',
        'rate_blocks',
        'fixed_charge',
        'vat_percent',
    ];

    protected $casts = [
        'rate_blocks' => 'array',
        'effective_date' => 'date',
        'end_date' => 'date',
        'fixed_charge' => 'decimal:2',
        'vat_percent' => 'decimal:2',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
