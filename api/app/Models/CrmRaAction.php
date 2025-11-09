<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmRaAction extends Model
{
    protected $fillable = [
        'ra_case_id',
        'action',
        'payload',
        'actor_id',
        'occurred_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'occurred_at' => 'datetime',
    ];

    public function raCase(): BelongsTo
    {
        return $this->belongsTo(CrmRaCase::class, 'ra_case_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
