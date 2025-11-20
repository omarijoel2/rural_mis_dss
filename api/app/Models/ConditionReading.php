<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConditionReading extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'tag_id',
        'reading_at',
        'value',
        'source',
        'metadata',
    ];

    protected $casts = [
        'reading_at' => 'datetime',
        'value' => 'decimal:4',
        'metadata' => 'array',
    ];

    public function conditionTag(): BelongsTo
    {
        return $this->belongsTo(ConditionTag::class, 'tag_id');
    }
}
