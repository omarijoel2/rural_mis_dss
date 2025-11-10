<?php

namespace App\Models\Projects;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class DesignModel extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'model_name',
        'engine_id',
        'version',
        'project_id',
        'description',
        'file_path',
        'file_format',
        'file_size',
        'metadata',
        'created_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'metadata' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('design_models.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function engine()
    {
        return $this->belongsTo(ModelEngine::class, 'engine_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function runs()
    {
        return $this->hasMany(ModelRun::class, 'model_id');
    }

    public function calibrations()
    {
        return $this->hasMany(ModelCalibration::class, 'model_id');
    }
}
