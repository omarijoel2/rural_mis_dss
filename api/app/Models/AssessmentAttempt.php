<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssessmentAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'assessment_id',
        'attempt_number',
        'answers',
        'score',
        'passed',
        'started_at',
        'submitted_at',
        'evidence',
        'assessor_id',
    ];

    protected $casts = [
        'attempt_number' => 'integer',
        'answers' => 'array',
        'score' => 'decimal:2',
        'passed' => 'boolean',
        'evidence' => 'array',
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];

    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function assessment()
    {
        return $this->belongsTo(Assessment::class);
    }

    public function assessor()
    {
        return $this->belongsTo(User::class, 'assessor_id');
    }
}
