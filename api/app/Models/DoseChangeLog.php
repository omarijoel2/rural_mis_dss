<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoseChangeLog extends Model
{
    use HasUuids;

    protected $fillable = [
        'dose_plan_id',
        'user_id',
        'before',
        'after',
        'reason',
    ];

    protected $casts = [
        'before' => 'array',
        'after' => 'array',
    ];

    public function dosePlan(): BelongsTo
    {
        return $this->belongsTo(DosePlan::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
