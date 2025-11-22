<?php

namespace App\Models\GIS;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VectorLayer extends Model
{
    protected $table = 'vector_layers';

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'source_file_id',
        'layer_type',
        'visibility',
        'opacity',
        'fill_color',
        'stroke_color',
        'stroke_width',
        'properties_display',
        'filter_config',
        'z_index',
        'metadata',
    ];

    protected $casts = [
        'properties_display' => 'array',
        'filter_config' => 'array',
        'metadata' => 'array',
        'visibility' => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(config('app.tenant_model'));
    }

    public function sourceFile(): BelongsTo
    {
        return $this->belongsTo(ShapeFile::class, 'source_file_id');
    }

    public function scopeForTenant($query)
    {
        $tenantId = auth()->user()->active_tenant_id ?? auth()->user()->tenant_id;
        return $query->where('tenant_id', $tenantId);
    }

    public function getLayerConfig(): array
    {
        return [
            'id' => "vector-{$this->id}",
            'type' => $this->layer_type,
            'source' => "vector-source-{$this->source_file_id}",
            'layout' => [
                'visibility' => $this->visibility ? 'visible' : 'none',
            ],
            'paint' => $this->getPaintConfig(),
            'filter' => $this->filter_config ?? null,
        ];
    }

    private function getPaintConfig(): array
    {
        return match ($this->layer_type) {
            'fill' => [
                'fill-color' => $this->fill_color ?? '#3b82f6',
                'fill-opacity' => $this->opacity ?? 0.6,
                'fill-outline-color' => $this->stroke_color ?? '#1e40af',
            ],
            'line' => [
                'line-color' => $this->stroke_color ?? '#1e40af',
                'line-width' => $this->stroke_width ?? 2,
                'line-opacity' => $this->opacity ?? 0.8,
            ],
            'circle' => [
                'circle-color' => $this->fill_color ?? '#3b82f6',
                'circle-radius' => 6,
                'circle-opacity' => $this->opacity ?? 0.8,
                'circle-stroke-color' => $this->stroke_color ?? '#1e40af',
                'circle-stroke-width' => 2,
            ],
            'symbol' => [
                'icon-opacity' => $this->opacity ?? 1.0,
            ],
            default => [],
        };
    }
}
