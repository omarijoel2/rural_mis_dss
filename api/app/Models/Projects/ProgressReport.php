<?php

namespace App\Models\Projects;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgressReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'report_date',
        'physical_progress',
        'financial_progress',
        'expenditure_to_date',
        'achievements',
        'challenges',
        'next_steps',
        'submitted_by',
    ];

    protected $casts = [
        'report_date' => 'date',
        'physical_progress' => 'decimal:2',
        'financial_progress' => 'decimal:2',
        'expenditure_to_date' => 'decimal:2',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}
