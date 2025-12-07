<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentReconciliation extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'payment_reconciliations';

    protected $fillable = [
        'tenant_id',
        'reconciliation_code',
        'reconciliation_date',
        'channel',
        'payments_matched',
        'payments_unmatched',
        'amount_matched',
        'amount_unmatched',
        'reconciled_by',
        'status',
    ];

    protected $casts = [
        'reconciliation_date' => 'date',
        'payments_matched' => 'integer',
        'payments_unmatched' => 'integer',
        'amount_matched' => 'decimal:2',
        'amount_unmatched' => 'decimal:2',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function reconciledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reconciled_by');
    }
}
