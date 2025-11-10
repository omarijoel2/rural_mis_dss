<?php

namespace App\Models\Projects;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class LandDispute extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'parcel_id',
        'dispute_no',
        'description',
        'type',
        'raised_date',
        'resolved_date',
        'status',
        'claimant_name',
        'claimant_contact',
        'resolution_notes',
        'settlement_amount',
        'handled_by',
    ];

    protected $casts = [
        'raised_date' => 'date',
        'resolved_date' => 'date',
        'settlement_amount' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('land_disputes.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function parcel()
    {
        return $this->belongsTo(LandParcel::class, 'parcel_id');
    }

    public function handler()
    {
        return $this->belongsTo(User::class, 'handled_by');
    }
}
