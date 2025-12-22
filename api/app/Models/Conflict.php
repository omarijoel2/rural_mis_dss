<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Conflict extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id','resource_type','resource_id','server_payload','client_payload','resolution','resolution_action','resolved_by','resolved_at','notes'];

    protected $casts = [
        'server_payload' => 'array',
        'client_payload' => 'array',
        'resolved_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->id)) $model->id = (string) Str::uuid();
        });
    }
}
