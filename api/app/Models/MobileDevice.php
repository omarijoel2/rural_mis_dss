<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class MobileDevice extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'device_id', 'user_id', 'device_type', 'os_version', 'app_version', 'push_token', 'status', 'trust_score', 'metadata', 'last_seen'
    ];

    protected $casts = [
        'metadata' => 'array',
        'last_seen' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->id)) $model->id = (string) Str::uuid();
        });
    }
}
