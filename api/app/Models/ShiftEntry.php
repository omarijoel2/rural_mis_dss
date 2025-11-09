<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class ShiftEntry extends Model
{
    use HasSpatial;

    protected $fillable = [
        'shift_id',
        'kind',
        'title',
        'body',
        'tags',
        'created_by',
        'geom',
        'attachments',
    ];

    protected $casts = [
        'tags' => 'array',
        'attachments' => 'array',
        'geom' => Point::class,
    ];

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
