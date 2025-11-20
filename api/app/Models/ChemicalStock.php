<?php

namespace App\Models;

use App\Models\Traits\HasTenancy;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class ChemicalStock extends Model
{
    use HasUuids, SoftDeletes, HasTenancy;

    protected $fillable = [
        'tenant_id',
        'scheme_id',
        'facility_id',
        'chemical',
        'qty_on_hand_kg',
        'reorder_level_kg',
        'max_stock_kg',
        'as_of',
        'unit_cost',
    ];

    protected $casts = [
        'as_of' => 'date',
        'qty_on_hand_kg' => 'decimal:2',
        'reorder_level_kg' => 'decimal:2',
        'max_stock_kg' => 'decimal:2',
        'unit_cost' => 'decimal:2',
    ];


    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'tenant_id');
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(Scheme::class);
    }

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }
}
