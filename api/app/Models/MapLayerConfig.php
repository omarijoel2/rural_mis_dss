<?php

namespace App\Models;

use App\Models\Traits\HasTenancy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MapLayerConfig extends Model
{
    use HasFactory, HasUuids, HasTenancy;

    protected $fillable = [
        'tenant_id',
        'layer_name',
        'display_name',
        'is_visible',
        'z_index',
        'style_rules',
        'filters',
        'tile_endpoint',
        'min_zoom',
        'max_zoom',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'z_index' => 'integer',
        'style_rules' => 'array',
        'filters' => 'array',
        'min_zoom' => 'integer',
        'max_zoom' => 'integer',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
