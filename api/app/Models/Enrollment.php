<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenancy;

class Enrollment extends Model
{
    use HasFactory, HasTenancy;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'course_id',
        'status',
        'progress_percent',
        'started_at',
        'due_at',
        'completed_at',
        'final_score',
    ];

    protected $casts = [
        'progress_percent' => 'integer',
        'final_score' => 'decimal:2',
        'started_at' => 'datetime',
        'due_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function lessonProgress()
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function assessmentAttempts()
    {
        return $this->hasMany(AssessmentAttempt::class);
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeOverdue($query)
    {
        return $query->where('due_at', '<', now())
                     ->whereNotIn('status', ['completed', 'withdrawn']);
    }
}
