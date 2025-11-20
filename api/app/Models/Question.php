<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'assessment_id',
        'type',
        'question_text',
        'options',
        'correct_answer',
        'explanation',
        'points',
        'order_index',
    ];

    protected $casts = [
        'options' => 'array',
        'correct_answer' => 'array',
        'points' => 'integer',
        'order_index' => 'integer',
    ];

    public function assessment()
    {
        return $this->belongsTo(Assessment::class);
    }
}
