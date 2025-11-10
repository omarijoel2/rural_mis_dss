<?php

namespace App\Http\Controllers;

use App\Http\Requests\Projects\StorePipelineRequest;
use App\Http\Requests\Projects\UpdatePipelineRequest;
use App\Http\Requests\Projects\ScorePipelineRequest;
use App\Http\Requests\Projects\CreateAppraisalRequest;
use App\Services\Projects\InvestmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvestmentController extends Controller
{
    public function __construct(private InvestmentService $investmentService)
    {
    }

    /**
     * List all investment pipelines
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'category_id']);
        $pipelines = $this->investmentService->getAllPipelines($filters);

        return response()->json($pipelines);
    }

    /**
     * Get a single pipeline with details
     */
    public function show(string $id): JsonResponse
    {
        $pipeline = $this->investmentService->getPipelineDetails($id);

        return response()->json($pipeline);
    }

    /**
     * Create a new investment pipeline
     */
    public function store(StorePipelineRequest $request): JsonResponse
    {
        $data = $request->validated();
        $pipeline = $this->investmentService->createPipeline($data);

        return response()->json($pipeline, 201);
    }

    /**
     * Update a pipeline
     */
    public function update(UpdatePipelineRequest $request, string $id): JsonResponse
    {
        $data = $request->validated();
        $pipeline = $this->investmentService->updatePipeline($id, $data);

        return response()->json($pipeline);
    }

    /**
     * Delete a pipeline
     */
    public function destroy(string $id): JsonResponse
    {
        $this->investmentService->deletePipeline($id);

        return response()->json(null, 204);
    }

    /**
     * Score a pipeline against a scoring criterion
     */
    public function score(ScorePipelineRequest $request, string $id): JsonResponse
    {
        $data = $request->validated();
        $score = $this->investmentService->scorePipeline(
            $id,
            $data['criterion_id'],
            $data['raw_score'],
            $data['weighted_score'],
            $data['rationale'] ?? null
        );

        return response()->json($score, 201);
    }

    /**
     * Get scores for a pipeline
     */
    public function scores(string $id): JsonResponse
    {
        $scores = $this->investmentService->getPipelineScores($id);

        return response()->json($scores);
    }

    /**
     * Create a financial appraisal for a pipeline
     */
    public function appraisal(CreateAppraisalRequest $request, string $id): JsonResponse
    {
        $data = $request->validated();
        $appraisal = $this->investmentService->createAppraisal($id, $data);

        return response()->json($appraisal, 201);
    }

    /**
     * Get appraisals for a pipeline
     */
    public function appraisals(string $id): JsonResponse
    {
        $appraisals = $this->investmentService->getPipelineAppraisals($id);

        return response()->json($appraisals);
    }

    /**
     * Convert a pipeline to a project
     */
    public function convert(string $id): JsonResponse
    {
        $project = $this->investmentService->convertToProject($id);

        return response()->json($project, 201);
    }
}
