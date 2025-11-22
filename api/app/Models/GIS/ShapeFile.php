<?php

namespace App\Models\GIS;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\AsCollection;

class ShapeFile extends Model
{
    protected $table = 'shape_files';
    
    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'file_path',
        'file_size',
        'geom_type',
        'projection_crs',
        'bounds',
        'feature_count',
        'properties_schema',
        'status',
        'uploaded_by',
        'uploaded_at',
        'metadata',
    ];

    protected $casts = [
        'bounds' => AsCollection::class,
        'properties_schema' => AsCollection::class,
        'metadata' => 'array',
        'uploaded_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(config('app.tenant_model'));
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function vectorLayers(): HasMany
    {
        return $this->hasMany(VectorLayer::class, 'source_file_id');
    }

    public function scopeForTenant($query)
    {
        $tenantId = auth()->user()->active_tenant_id ?? auth()->user()->tenant_id;
        return $query->where('tenant_id', $tenantId);
    }

    public function getDownloadUrl(): string
    {
        return route('api.gis.shape-files.download', $this->id);
    }

    public function getPreviewUrl(): ?string
    {
        if ($this->status === 'processed') {
            return route('api.gis.shape-files.preview-geojson', $this->id);
        }
        return null;
    }
}
