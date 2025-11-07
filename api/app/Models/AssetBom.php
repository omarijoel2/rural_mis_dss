<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetBom extends Model
{
    protected $fillable = ['asset_id', 'part_id', 'qty'];
    protected $casts = ['qty' => 'decimal:4'];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function part(): BelongsTo
    {
        return $this->belongsTo(Part::class);
    }
}
