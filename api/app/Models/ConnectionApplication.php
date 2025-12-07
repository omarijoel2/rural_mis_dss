<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConnectionApplication extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'connection_applications';

    protected $fillable = [
        'tenant_id',
        'scheme_id',
        'application_no',
        'applicant_name',
        'applicant_phone',
        'applicant_email',
        'premise_address',
        'connection_type',
        'category',
        'estimated_cost',
        'status',
        'approved_by',
        'approved_at',
        'kyc_documents',
    ];

    protected $casts = [
        'estimated_cost' => 'decimal:2',
        'approved_at' => 'datetime',
        'kyc_documents' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(Scheme::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
