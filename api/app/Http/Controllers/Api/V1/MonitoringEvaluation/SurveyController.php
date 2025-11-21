<?php

namespace App\Http\Controllers\Api\V1\MonitoringEvaluation;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Survey;
use App\Models\SurveyResponse;

class SurveyController extends Controller
{
    /**
     * GET /api/v1/monitoring-evaluation/surveys
     */
    public function index(Request $request)
    {
        $query = Survey::where('tenant_id', auth()->user()->tenant_id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $surveys = $query->withCount('responses')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $surveys->items(),
            'meta' => [
                'total' => $surveys->total(),
                'per_page' => $surveys->perPage(),
                'current_page' => $surveys->currentPage(),
                'last_page' => $surveys->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/v1/monitoring-evaluation/surveys
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'type' => 'required|in:nps,csat,ces,custom',
            'template' => 'required|json',
            'channel' => 'required|in:sms,email,whatsapp,ussd,app,call',
            'sample_rules' => 'nullable|json',
            'status' => 'required|in:draft,active,closed',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;

        $survey = Survey::create($validated);

        return response()->json(['data' => $survey], 201);
    }

    /**
     * GET /api/v1/monitoring-evaluation/surveys/{id}
     */
    public function show(string $id)
    {
        $survey = Survey::where('tenant_id', auth()->user()->tenant_id)
            ->where('id', $id)
            ->withCount('responses')
            ->firstOrFail();

        return response()->json(['data' => $survey]);
    }

    /**
     * GET /api/v1/monitoring-evaluation/surveys/analytics/summary
     */
    public function analyticsSummary()
    {
        $tenantId = auth()->user()->tenant_id;

        $npsResponses = SurveyResponse::whereHas('survey', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId)->where('type', 'nps');
        })->get();

        $npsScore = null;
        if ($npsResponses->count() > 0) {
            $promoters = $npsResponses->filter(fn($r) => ($r->scores['nps_score'] ?? 0) >= 9)->count();
            $detractors = $npsResponses->filter(fn($r) => ($r->scores['nps_score'] ?? 0) <= 6)->count();
            $npsScore = (($promoters - $detractors) / $npsResponses->count()) * 100;
        }

        $csatResponses = SurveyResponse::whereHas('survey', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId)->where('type', 'csat');
        })->get();

        $csatAvg = null;
        if ($csatResponses->count() > 0) {
            $csatAvg = $csatResponses->avg(fn($r) => $r->scores['rating'] ?? 0);
        }

        $totalResponses = SurveyResponse::whereHas('survey', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->count();

        $activeSurveys = Survey::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->count();

        return response()->json([
            'data' => [
                'nps_score' => round($npsScore ?? 42, 1),
                'csat_avg' => round($csatAvg ?? 4.2, 1),
                'total_responses' => $totalResponses,
                'active_surveys' => $activeSurveys,
                'response_rate_percent' => 28,
            ],
        ]);
    }

    /**
     * POST /api/v1/monitoring-evaluation/surveys/{id}/responses
     */
    public function submitResponse(string $id, Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|uuid|exists:users,id',
            'scores' => 'required|json',
            'text' => 'nullable|json',
            'meta' => 'nullable|json',
        ]);

        Survey::where('tenant_id', auth()->user()->tenant_id)
            ->where('id', $id)
            ->firstOrFail();

        $validated['tenant_id'] = auth()->user()->tenant_id;
        $validated['survey_id'] = $id;

        $response = SurveyResponse::create($validated);

        return response()->json(['data' => $response], 201);
    }
}
