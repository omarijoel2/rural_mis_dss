<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class AssetLocation extends Model
{
    use HasSpatial;

    protected $fillable = ['asset_id', 'effective_from', 'effective_to', 'geom'];
    protected $casts = ['effective_from' => 'date', 'effective_to' => 'date', 'geom' => Point::class];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}
