<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SyncBatch extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id', 'batch_token', 'device_id', 'client_sync_token', 'server_sync_token', 'status', 'items_count', 'processed_at'];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->id)) $model->id = (string) Str::uuid();
        });
    }

    public function items()
    {
        return $this->hasMany(SyncItem::class, 'batch_id');
    }
}
