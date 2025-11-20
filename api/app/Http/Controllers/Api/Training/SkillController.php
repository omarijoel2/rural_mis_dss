<?php

namespace App\Http\Controllers\Api\Training;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use App\Models\EmployeeSkill;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SkillController extends Controller
{
    public function index(Request $request)
    {
        $query = Skill::query();

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        $skills = $query->orderBy('name')->paginate(50);

        return response()->json($skills);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:skills,code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'levels' => ['required', 'array'],
            'category' => ['required', 'string', Rule::in(['technical', 'safety', 'customer', 'leadership'])],
        ]);

        $validated['tenant_id'] = auth()->user()->current_tenant_id;

        $skill = Skill::create($validated);

        return response()->json($skill, 201);
    }

    public function show(Skill $skill)
    {
        return response()->json($skill->load(['employeeSkills.user', 'employeeSkills.assessor']));
    }

    public function update(Request $request, Skill $skill)
    {
        $validated = $request->validate([
            'code' => ['sometimes', 'string', 'max:50', Rule::unique('skills', 'code')->ignore($skill->id)],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'levels' => ['sometimes', 'array'],
            'category' => ['sometimes', 'string', Rule::in(['technical', 'safety', 'customer', 'leadership'])],
        ]);

        $skill->update($validated);

        return response()->json($skill);
    }

    public function destroy(Skill $skill)
    {
        if ($skill->employeeSkills()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete skill with employee assessments'
            ], 422);
        }

        $skill->delete();

        return response()->json(['message' => 'Skill deleted successfully']);
    }

    public function assessEmployee(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'skill_id' => ['required', 'exists:skills,id'],
            'level_index' => ['required', 'integer', 'min:0'],
            'evidence' => ['nullable', 'array'],
        ]);

        $validated['tenant_id'] = auth()->user()->current_tenant_id;
        $validated['assessor_id'] = auth()->id();
        $validated['assessed_at'] = now();

        $employeeSkill = EmployeeSkill::updateOrCreate(
            [
                'user_id' => $validated['user_id'],
                'skill_id' => $validated['skill_id'],
            ],
            $validated
        );

        return response()->json($employeeSkill->load(['skill', 'assessor']), 201);
    }

    public function employeeSkills(Request $request)
    {
        $userId = $request->input('user_id', auth()->id());

        $employeeSkills = EmployeeSkill::where('user_id', $userId)
            ->with(['skill', 'assessor'])
            ->orderBy('assessed_at', 'desc')
            ->get();

        return response()->json($employeeSkills);
    }

    public function skillsMatrix(Request $request)
    {
        $skills = Skill::with(['employeeSkills.user'])
            ->get()
            ->map(function ($skill) {
                return [
                    'skill' => $skill,
                    'employees' => $skill->employeeSkills->map(function ($es) {
                        return [
                            'user' => $es->user,
                            'level_index' => $es->level_index,
                            'level_name' => $es->skill->levels[$es->level_index] ?? 'Unknown',
                            'assessed_at' => $es->assessed_at,
                        ];
                    }),
                ];
            });

        return response()->json($skills);
    }
}
