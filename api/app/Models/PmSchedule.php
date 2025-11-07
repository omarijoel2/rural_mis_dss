<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PmSchedule extends Model
{
    protected $fillable = ['pm_policy_id', 'next_due', 'last_done', 'status'];
    protected $casts = ['next_due' => 'datetime', 'last_done' => 'datetime'];

    public function pmPolicy(): BelongsTo
    {
        return $this->belongsTo(PmPolicy::class);
    }
}
