<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'type',
        'passing_score',
        'max_attempts',
        'time_limit_min',
        'randomize_questions',
        'show_answers',
    ];

    protected $casts = [
        'passing_score' => 'integer',
        'max_attempts' => 'integer',
        'time_limit_min' => 'integer',
        'randomize_questions' => 'boolean',
        'show_answers' => 'boolean',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class)->orderBy('order_index');
    }

    public function attempts()
    {
        return $this->hasMany(AssessmentAttempt::class);
    }
}
