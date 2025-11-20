<?php

namespace App\Services\Cmms;

use App\Models\JobPlan;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class JobPlanService
{
    public function getAllJobPlans(array $filters = []): Collection
    {
        $query = JobPlan::with(['assetClass']);
        
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        if (isset($filters['asset_class_id'])) {
            $query->where('asset_class_id', $filters['asset_class_id']);
        }
        
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('code', 'ilike', "%{$search}%")
                  ->orWhere('name', 'ilike', "%{$search}%");
            });
        }
        
        return $query->orderBy('code')->get();
    }

    public function getJobPlan(int $id): JobPlan
    {
        return JobPlan::with(['assetClass'])->findOrFail($id);
    }

    public function createJobPlan(array $data): JobPlan
    {
        $data['tenant_id'] = auth()->user()->tenant_id;
        $data['code'] = $data['code'] ?? $this->generateJobPlanCode();
        $data['version'] = $data['version'] ?? 1;
        
        return JobPlan::create($data);
    }

    public function updateJobPlan(int $id, array $data): JobPlan
    {
        $jobPlan = JobPlan::findOrFail($id);
        $jobPlan->update($data);
        
        return $jobPlan->fresh(['assetClass']);
    }

    public function deleteJobPlan(int $id): bool
    {
        $jobPlan = JobPlan::findOrFail($id);
        return $jobPlan->delete();
    }

    public function createNewVersion(int $id): JobPlan
    {
        $originalPlan = JobPlan::findOrFail($id);
        
        return DB::transaction(function () use ($originalPlan) {
            $originalPlan->update(['status' => 'archived']);
            
            $newData = $originalPlan->toArray();
            unset($newData['id'], $newData['created_at'], $newData['updated_at']);
            
            $newData['version'] = $originalPlan->version + 1;
            $newData['status'] = 'draft';
            
            return JobPlan::create($newData);
        });
    }

    public function activateJobPlan(int $id): JobPlan
    {
        $jobPlan = JobPlan::findOrFail($id);
        $jobPlan->update(['status' => 'active']);
        
        return $jobPlan->fresh();
    }

    protected function generateJobPlanCode(): string
    {
        $prefix = 'JP';
        $year = now()->format('y');
        $last = JobPlan::where('code', 'like', "{$prefix}{$year}%")
            ->orderBy('code', 'desc')
            ->first();
        
        if ($last && preg_match("/{$prefix}{$year}(\d{4})/", $last->code, $matches)) {
            $sequence = intval($matches[1]) + 1;
        } else {
            $sequence = 1;
        }
        
        return sprintf('%s%s%04d', $prefix, $year, $sequence);
    }
}
