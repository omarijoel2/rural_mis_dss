<?php

namespace App\Services\Projects;

use App\Models\Projects\Project;
use App\Models\Projects\ProjectMilestone;
use App\Models\Projects\ProgressReport;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProjectService
{
    /**
     * Get all projects for the current tenant with optional filters
     */
    public function getAllProjects(array $filters = [])
    {
        $query = Project::with(['program', 'category', 'projectManager', 'pipeline']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['program_id'])) {
            $query->where('program_id', $filters['program_id']);
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['pm_id'])) {
            $query->where('pm_id', $filters['pm_id']);
        }

        if (!empty($filters['from_date']) && !empty($filters['to_date'])) {
            $query->whereBetween('baseline_start_date', [$filters['from_date'], $filters['to_date']]);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get a single project with full details
     */
    public function getProject(string $id, bool $withDetails = true)
    {
        $query = Project::with(['program', 'category', 'pipeline', 'projectManager', 'creator']);

        if ($withDetails) {
            $query->with([
                'milestones',
                'contracts',
                'defects',
                'progressReports' => function ($q) {
                    $q->orderBy('report_date', 'desc')->limit(5);
                },
            ]);
        }

        return $query->findOrFail($id);
    }

    /**
     * Create a new project
     */
    public function createProject(array $data): Project
    {
        DB::beginTransaction();
        try {
            $project = Project::create([
                'tenant_id' => auth()->user()->tenant_id,
                'code' => $data['code'],
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'program_id' => $data['program_id'] ?? null,
                'category_id' => $data['category_id'],
                'pipeline_id' => $data['pipeline_id'] ?? null,
                'pm_id' => $data['pm_id'] ?? null,
                'baseline_budget' => $data['baseline_budget'],
                'baseline_start_date' => $data['baseline_start_date'],
                'baseline_end_date' => $data['baseline_end_date'],
                'status' => $data['status'] ?? 'planning',
                'location' => $data['location'] ?? null,
                'created_by' => auth()->id(),
                'meta' => $data['meta'] ?? null,
            ]);

            // Create default milestones if provided
            if (!empty($data['milestones'])) {
                foreach ($data['milestones'] as $milestone) {
                    $this->addMilestone($project->id, $milestone);
                }
            }

            DB::commit();
            Log::info('Project created', ['project_id' => $project->id, 'user_id' => auth()->id()]);

            return $project->load(['program', 'category', 'projectManager']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create project', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Update an existing project
     */
    public function updateProject(string $id, array $data): Project
    {
        $project = Project::findOrFail($id);

        $updateData = array_filter([
            'title' => $data['title'] ?? null,
            'description' => $data['description'] ?? null,
            'program_id' => $data['program_id'] ?? null,
            'category_id' => $data['category_id'] ?? null,
            'pm_id' => $data['pm_id'] ?? null,
            'baseline_budget' => $data['baseline_budget'] ?? null,
            'revised_budget' => $data['revised_budget'] ?? null,
            'baseline_start_date' => $data['baseline_start_date'] ?? null,
            'baseline_end_date' => $data['baseline_end_date'] ?? null,
            'revised_start_date' => $data['revised_start_date'] ?? null,
            'revised_end_date' => $data['revised_end_date'] ?? null,
            'actual_start_date' => $data['actual_start_date'] ?? null,
            'actual_end_date' => $data['actual_end_date'] ?? null,
            'status' => $data['status'] ?? null,
            'location' => $data['location'] ?? null,
            'meta' => $data['meta'] ?? null,
        ], fn($value) => $value !== null);

        $project->update($updateData);

        Log::info('Project updated', ['project_id' => $project->id, 'user_id' => auth()->id()]);

        return $project->fresh(['program', 'category', 'projectManager']);
    }

    /**
     * Delete a project (soft delete)
     */
    public function deleteProject(string $id): void
    {
        $project = Project::findOrFail($id);

        // Only allow deletion of planning or closed projects
        if (!in_array($project->status, ['planning', 'closed'])) {
            throw new \Exception('Only projects in planning or closed status can be deleted.');
        }

        $project->delete();
        Log::info('Project deleted', ['project_id' => $id, 'user_id' => auth()->id()]);
    }

    /**
     * Update project progress
     */
    public function updateProgress(string $id, array $data): Project
    {
        $project = Project::findOrFail($id);

        $project->update([
            'physical_progress' => $data['physical_progress'] ?? $project->physical_progress,
            'financial_progress' => $data['financial_progress'] ?? $project->financial_progress,
        ]);

        Log::info('Project progress updated', [
            'project_id' => $project->id,
            'physical' => $project->physical_progress,
            'financial' => $project->financial_progress,
        ]);

        return $project;
    }

    /**
     * Add a milestone to a project
     */
    public function addMilestone(string $projectId, array $data): ProjectMilestone
    {
        $project = Project::findOrFail($projectId);

        $milestone = ProjectMilestone::create([
            'project_id' => $project->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'planned_date' => $data['planned_date'],
            'status' => $data['status'] ?? 'pending',
            'progress' => $data['progress'] ?? 0,
        ]);

        Log::info('Milestone added to project', ['project_id' => $project->id, 'milestone_id' => $milestone->id]);

        return $milestone;
    }

    /**
     * Update a milestone
     */
    public function updateMilestone(string $milestoneId, array $data): ProjectMilestone
    {
        $milestone = ProjectMilestone::findOrFail($milestoneId);

        $milestone->update(array_filter([
            'name' => $data['name'] ?? null,
            'description' => $data['description'] ?? null,
            'planned_date' => $data['planned_date'] ?? null,
            'actual_date' => $data['actual_date'] ?? null,
            'progress' => $data['progress'] ?? null,
            'status' => $data['status'] ?? null,
        ], fn($value) => $value !== null));

        return $milestone->fresh();
    }

    /**
     * Submit a progress report
     */
    public function submitProgressReport(string $projectId, array $data): ProgressReport
    {
        $project = Project::findOrFail($projectId);

        $report = ProgressReport::create([
            'project_id' => $project->id,
            'report_date' => $data['report_date'],
            'physical_progress' => $data['physical_progress'],
            'financial_progress' => $data['financial_progress'],
            'expenditure_to_date' => $data['expenditure_to_date'],
            'achievements' => $data['achievements'] ?? null,
            'challenges' => $data['challenges'] ?? null,
            'next_steps' => $data['next_steps'] ?? null,
            'submitted_by' => auth()->id(),
        ]);

        // Update project progress based on the report
        $this->updateProgress($project->id, [
            'physical_progress' => $data['physical_progress'],
            'financial_progress' => $data['financial_progress'],
        ]);

        Log::info('Progress report submitted', ['project_id' => $project->id, 'report_id' => $report->id]);

        return $report;
    }

    /**
     * Get project dashboard statistics
     */
    public function getDashboardStats(array $filters = []): array
    {
        $query = Project::query();

        if (!empty($filters['program_id'])) {
            $query->where('program_id', $filters['program_id']);
        }

        $projects = $query->get();

        return [
            'total_projects' => $projects->count(),
            'active_projects' => $projects->where('status', 'execution')->count(),
            'completed_projects' => $projects->where('status', 'completed')->count(),
            'average_physical_progress' => round($projects->avg('physical_progress'), 2),
            'average_financial_progress' => round($projects->avg('financial_progress'), 2),
            'delayed_projects' => $projects->filter(function ($project) {
                return $project->baseline_end_date < now() && !in_array($project->status, ['completed', 'closed']);
            })->count(),
            'total_baseline_budget' => $projects->sum('baseline_budget'),
            'total_revised_budget' => $projects->sum('revised_budget') ?: $projects->sum('baseline_budget'),
        ];
    }
}
