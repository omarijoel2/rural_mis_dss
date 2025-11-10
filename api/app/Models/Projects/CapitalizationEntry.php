<?php

namespace App\Models\Projects;

use App\Models\Costing\GlAccount;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Builder;

class CapitalizationEntry extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'project_id',
        'handover_package_id',
        'entry_no',
        'asset_class',
        'amount',
        'depreciation_method',
        'useful_life_years',
        'salvage_value',
        'capitalization_date',
        'gl_account_id',
        'linked_asset_id',
        'status',
        'posted_by',
        'posted_at',
        'meta',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'useful_life_years' => 'integer',
        'salvage_value' => 'decimal:2',
        'capitalization_date' => 'date',
        'posted_at' => 'datetime',
        'meta' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('capitalization_entries.tenant_id', auth()->user()->tenant_id);
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

    public function handoverPackage()
    {
        return $this->belongsTo(HandoverPackage::class);
    }

    public function glAccount()
    {
        return $this->belongsTo(GlAccount::class, 'gl_account_id');
    }

    public function poster()
    {
        return $this->belongsTo(User::class, 'posted_by');
    }
}
