<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Submission extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id','form_id','form_version','data','device_id','status','metadata','reviewed_at'];

    protected $casts = [
        'data' => 'array',
        'metadata' => 'array',
        'reviewed_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->id)) $model->id = (string) Str::uuid();
        });
    }

    public function media()
    {
        return $this->hasMany(SubmissionMedia::class);
    }
}
