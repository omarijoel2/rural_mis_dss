<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetClass extends Model
{
    protected $fillable = [
        'code',
        'name',
        'parent_id',
        'criticality',
        'attributes_schema',
    ];

    protected $casts = [
        'attributes_schema' => 'array',
        'criticality' => 'string',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(AssetClass::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(AssetClass::class, 'parent_id');
    }

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class, 'class_id');
    }

    public function pmPolicies(): HasMany
    {
        return $this->hasMany(PmPolicy::class, 'asset_class_id');
    }
}
