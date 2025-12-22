<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SyncItem extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id','batch_id','client_temp_id','resource_type','action','payload','client_version','server_version','server_id','status','error_message'];

    protected $casts = [
        'payload' => 'array',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->id)) $model->id = (string) Str::uuid();
        });
    }

    public function batch()
    {
        return $this->belongsTo(SyncBatch::class, 'batch_id');
    }
}
