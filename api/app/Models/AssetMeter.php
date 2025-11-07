<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetMeter extends Model
{
    protected $fillable = ['asset_id', 'kind', 'unit', 'multiplier'];
    protected $casts = ['multiplier' => 'decimal:4'];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function captures(): HasMany
    {
        return $this->hasMany(MeterCapture::class);
    }
}
