<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class PmGenerationLog extends Model
{
    protected $table = 'pm_generation_log';

    protected $fillable = [
        'pm_template_id',
        'work_order_id',
        'asset_id',
        'scheduled_date',
        'status',
        'notes',
        'generated_at',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'generated_at' => 'datetime',
    ];

    public function pmTemplate(): BelongsTo
    {
        return $this->belongsTo(PmTemplate::class);
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }
}
