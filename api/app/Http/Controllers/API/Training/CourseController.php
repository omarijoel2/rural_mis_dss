<?php

namespace App\Http\Controllers\Api\Training;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::with(['owner', 'lessons']);

        if ($request->filled('domain')) {
            $query->byDomain($request->domain);
        }

        if ($request->filled('level')) {
            $query->byLevel($request->level);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            $query->published();
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        $courses = $query->orderBy('title')->paginate(20);

        return response()->json($courses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:255', 'unique:courses,code'],
            'domain' => ['required', 'string', Rule::in(['Ops', 'Lab', 'HSE', 'CRM', 'Finance'])],
            'level' => ['required', 'string', Rule::in(['basic', 'intermediate', 'advanced'])],
            'format' => ['required', 'string', Rule::in(['video', 'SCORM', 'live', 'reading'])],
            'credits' => ['nullable', 'integer', 'min:0'],
            'duration_min' => ['nullable', 'integer', 'min:0'],
            'prerequisites' => ['nullable', 'array'],
            'expiry_days' => ['nullable', 'integer', 'min:0'],
            'syllabus' => ['nullable', 'array'],
            'description' => ['nullable', 'string'],
            'thumbnail_url' => ['nullable', 'string', 'url'],
        ]);

        $validated['tenant_id'] = auth()->user()->current_tenant_id;
        $validated['owner_id'] = auth()->id();
        $validated['status'] = 'draft';

        $course = Course::create($validated);

        return response()->json($course->load(['owner', 'lessons']), 201);
    }

    public function show(Course $course)
    {
        return response()->json(
            $course->load(['owner', 'lessons', 'assessments.questions', 'enrollments'])
        );
    }

    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'string', 'max:255', Rule::unique('courses', 'code')->ignore($course->id)],
            'domain' => ['sometimes', 'string', Rule::in(['Ops', 'Lab', 'HSE', 'CRM', 'Finance'])],
            'level' => ['sometimes', 'string', Rule::in(['basic', 'intermediate', 'advanced'])],
            'format' => ['sometimes', 'string', Rule::in(['video', 'SCORM', 'live', 'reading'])],
            'credits' => ['nullable', 'integer', 'min:0'],
            'duration_min' => ['nullable', 'integer', 'min:0'],
            'prerequisites' => ['nullable', 'array'],
            'expiry_days' => ['nullable', 'integer', 'min:0'],
            'syllabus' => ['nullable', 'array'],
            'description' => ['nullable', 'string'],
            'thumbnail_url' => ['nullable', 'string', 'url'],
            'status' => ['sometimes', 'string', Rule::in(['draft', 'published', 'archived'])],
        ]);

        $course->update($validated);

        return response()->json($course->load(['owner', 'lessons']));
    }

    public function destroy(Course $course)
    {
        if ($course->enrollments()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete course with active enrollments'
            ], 422);
        }

        $course->delete();

        return response()->json(['message' => 'Course deleted successfully']);
    }

    public function publish(Course $course)
    {
        if ($course->lessons()->count() === 0) {
            return response()->json([
                'message' => 'Cannot publish course without lessons'
            ], 422);
        }

        $course->update(['status' => 'published']);

        return response()->json($course);
    }

    public function statistics(Course $course)
    {
        return response()->json([
            'total_enrollments' => $course->enrollments()->count(),
            'active_enrollments' => $course->enrollments()->inProgress()->count(),
            'completed_enrollments' => $course->enrollments()->completed()->count(),
            'completion_rate' => $course->enrollments()->count() > 0
                ? ($course->enrollments()->completed()->count() / $course->enrollments()->count()) * 100
                : 0,
            'average_score' => $course->enrollments()->completed()->avg('final_score') ?? 0,
            'average_rating' => $course->rating,
        ]);
    }
}
