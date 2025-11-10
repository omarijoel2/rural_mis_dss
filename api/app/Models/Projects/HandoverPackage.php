<?php

namespace App\Models\Projects;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Builder;

class HandoverPackage extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'project_id',
        'package_no',
        'commissioning_date',
        'handover_date',
        'status',
        'scope',
        'documents',
        'spares',
        'warranties',
        'acceptance_notes',
        'submitted_by',
        'accepted_by',
        'accepted_at',
        'meta',
    ];

    protected $casts = [
        'commissioning_date' => 'date',
        'handover_date' => 'date',
        'documents' => 'array',
        'spares' => 'array',
        'warranties' => 'array',
        'meta' => 'array',
        'accepted_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('handover_packages.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function acceptor()
    {
        return $this->belongsTo(User::class, 'accepted_by');
    }

    public function capitalizationEntries()
    {
        return $this->hasMany(CapitalizationEntry::class);
    }
}
