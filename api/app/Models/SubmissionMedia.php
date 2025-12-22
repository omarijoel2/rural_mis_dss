<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SubmissionMedia extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id','submission_id','key','filename','content_type','size_bytes','gps','captured_at','uploaded_at'];

    protected $casts = [
        'gps' => 'array',
        'captured_at' => 'datetime',
        'uploaded_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->id)) $model->id = (string) Str::uuid();
        });
    }

    public function submission()
    {
        return $this->belongsTo(Submission::class);
    }
}
