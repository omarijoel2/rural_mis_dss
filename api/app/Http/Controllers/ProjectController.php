<?php

namespace App\Http\Controllers;

use App\Http\Requests\Projects\StoreProjectRequest;
use App\Http\Requests\Projects\UpdateProjectRequest;
use App\Services\Projects\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function __construct(private ProjectService $projectService)
    {
    }

    /**
     * List all projects
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'category_id', 'program_id', 'search']);
        $projects = $this->projectService->getAllProjects($filters);

        return response()->json($projects);
    }

    /**
     * Get a single project with details
     */
    public function show(string $id): JsonResponse
    {
        $project = $this->projectService->getProjectDetails($id);

        return response()->json($project);
    }

    /**
     * Create a new project
     */
    public function store(StoreProjectRequest $request): JsonResponse
    {
        $data = $request->validated();
        $project = $this->projectService->createProject($data);

        return response()->json($project, 201);
    }

    /**
     * Update a project
     */
    public function update(UpdateProjectRequest $request, string $id): JsonResponse
    {
        $data = $request->validated();
        $project = $this->projectService->updateProject($id, $data);

        return response()->json($project);
    }

    /**
     * Delete a project
     */
    public function destroy(string $id): JsonResponse
    {
        $this->projectService->deleteProject($id);

        return response()->json(null, 204);
    }

    /**
     * Get project dashboard statistics
     */
    public function dashboard(): JsonResponse
    {
        $stats = $this->projectService->getDashboardStats();

        return response()->json($stats);
    }
}
