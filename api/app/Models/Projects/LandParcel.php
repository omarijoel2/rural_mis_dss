<?php

namespace App\Models\Projects;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use MatanYadaev\EloquentSpatial\Objects\Polygon;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class LandParcel extends Model
{
    use HasFactory, SoftDeletes, HasSpatial;

    protected $fillable = [
        'tenant_id',
        'ref_no',
        'title_number',
        'owner_name',
        'owner_contact',
        'title_status',
        'boundary',
        'area_ha',
        'county',
        'sub_county',
        'ward',
        'category_id',
        'project_id',
        'acquisition_status',
        'notes',
        'created_by',
        'meta',
    ];

    protected $casts = [
        'boundary' => Polygon::class,
        'area_ha' => 'decimal:4',
        'meta' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('land_parcels.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function category()
    {
        return $this->belongsTo(LandCategory::class, 'category_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function wayleaves()
    {
        return $this->hasMany(Wayleave::class, 'parcel_id');
    }

    public function compensations()
    {
        return $this->hasMany(Compensation::class, 'parcel_id');
    }

    public function disputes()
    {
        return $this->hasMany(LandDispute::class, 'parcel_id');
    }

    public function documents()
    {
        return $this->hasMany(LandDocument::class, 'parcel_id');
    }
}
