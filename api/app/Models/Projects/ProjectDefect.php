<?php

namespace App\Models\Projects;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class ProjectDefect extends Model
{
    use HasFactory, HasUuids, HasSpatial;

    protected $fillable = [
        'project_id',
        'contract_id',
        'defect_no',
        'description',
        'severity',
        'location',
        'identified_date',
        'deadline_date',
        'rectified_date',
        'status',
        'reported_by',
        'verified_by',
        'meta',
    ];

    protected $casts = [
        'location' => Point::class,
        'identified_date' => 'date',
        'deadline_date' => 'date',
        'rectified_date' => 'date',
        'meta' => 'array',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
