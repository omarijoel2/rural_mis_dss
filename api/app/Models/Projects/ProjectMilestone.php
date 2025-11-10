<?php

namespace App\Models\Projects;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ProjectMilestone extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'project_id',
        'name',
        'description',
        'planned_date',
        'actual_date',
        'progress',
        'status',
        'meta',
    ];

    protected $casts = [
        'planned_date' => 'date',
        'actual_date' => 'date',
        'progress' => 'decimal:2',
        'meta' => 'array',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
