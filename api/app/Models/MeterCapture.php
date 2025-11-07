<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeterCapture extends Model
{
    protected $fillable = ['asset_meter_id', 'captured_at', 'value', 'source', 'meta'];
    protected $casts = ['captured_at' => 'datetime', 'value' => 'decimal:4', 'meta' => 'array'];

    public function assetMeter(): BelongsTo
    {
        return $this->belongsTo(AssetMeter::class);
    }
}
