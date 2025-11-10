<?php

namespace App\Models\Projects;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Builder;

class ProjectCategory extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'description',
        'icon',
        'color',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('project_categories.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class, 'category_id');
    }

    public function pipelines()
    {
        return $this->hasMany(InvestmentPipeline::class, 'category_id');
    }
}
