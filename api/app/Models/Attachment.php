<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Attachment extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'entity_type',
        'entity_id',
        'path',
        'kind',
        'title',
        'uploaded_by',
    ];

    public function entity()
    {
        return $this->morphTo();
    }
}
