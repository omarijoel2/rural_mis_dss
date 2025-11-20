<?php

namespace App\Models;

use App\Models\Traits\HasTenancy;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OutageAudit extends Model
{
    use HasUuids;

    protected $fillable = [
        'outage_id',
        'event',
        'meta',
        'user_id',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function outage(): BelongsTo
    {
        return $this->belongsTo(Outage::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
