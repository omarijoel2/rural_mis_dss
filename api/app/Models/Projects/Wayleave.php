<?php

namespace App\Models\Projects;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Builder;

class Wayleave extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'parcel_id',
        'wayleave_no',
        'type',
        'width_m',
        'length_m',
        'agreement_date',
        'expiry_date',
        'status',
        'annual_fee',
        'terms',
        'documents',
    ];

    protected $casts = [
        'width_m' => 'decimal:2',
        'length_m' => 'decimal:2',
        'agreement_date' => 'date',
        'expiry_date' => 'date',
        'annual_fee' => 'decimal:2',
        'documents' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('wayleaves.tenant_id', auth()->user()->tenant_id);
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
}
