<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'type',
        'content_url',
        'content_json',
        'order_index',
        'duration_min',
        'is_mandatory',
    ];

    protected $casts = [
        'content_json' => 'array',
        'order_index' => 'integer',
        'duration_min' => 'integer',
        'is_mandatory' => 'boolean',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function progress()
    {
        return $this->hasMany(LessonProgress::class);
    }
}
