<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Disconnection extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'disconnections';

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'account_no',
        'reason',
        'status',
        'scheduled_date',
        'executed_at',
        'reconnected_at',
        'executed_by',
        'notes',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'executed_at' => 'datetime',
        'reconnected_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function executedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'executed_by');
    }
}
