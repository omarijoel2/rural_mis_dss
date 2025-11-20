<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class PmDeferral extends Model
{
    protected $fillable = [
        'pm_generation_log_id',
        'original_date',
        'deferred_to',
        'reason_code',
        'notes',
        'deferred_by',
        'approved_by',
        'deferred_at',
    ];

    protected $casts = [
        'original_date' => 'date',
        'deferred_to' => 'date',
        'deferred_at' => 'datetime',
    ];

    public function pmGenerationLog(): BelongsTo
    {
        return $this->belongsTo(PmGenerationLog::class);
    }

    public function deferredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deferred_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
