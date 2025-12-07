<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillingRun extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'billing_runs';

    protected $fillable = [
        'tenant_id',
        'scheme_id',
        'run_code',
        'period_start',
        'period_end',
        'status',
        'accounts_processed',
        'invoices_generated',
        'total_billed',
        'run_by',
        'started_at',
        'completed_at',
        'error_log',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'total_billed' => 'decimal:2',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(Scheme::class);
    }

    public function runBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'run_by');
    }
}
