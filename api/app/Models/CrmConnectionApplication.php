<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class CrmConnectionApplication extends Model
{
    protected $fillable = [
        'tenant_id',
        'application_no',
        'applicant_name',
        'phone',
        'email',
        'id_number',
        'address',
        'location',
        'connection_type',
        'property_type',
        'status',
        'kyc_status',
        'estimated_cost',
        'applied_date',
        'approved_date',
        'notes',
    ];

    protected $casts = [
        'location' => 'array',
        'applied_date' => 'date',
        'approved_date' => 'date',
        'estimated_cost' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                try {
                    $query->where('tenant_id', auth()->user()->currentTenantId());
                } catch (\RuntimeException $e) {
                    $query->whereRaw('1 = 0');
                }
            } else {
                $query->whereRaw('1 = 0');
            }
        });

        static::creating(function ($model) {
            if (!$model->application_no) {
                $model->application_no = 'APP-' . date('Y') . '-' . str_pad(random_int(1, 99999), 5, '0', STR_PAD_LEFT);
            }
            if (!$model->applied_date) {
                $model->applied_date = now();
            }
        });
    }
}
