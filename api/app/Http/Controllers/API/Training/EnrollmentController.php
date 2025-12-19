<?php

namespace App\Http\Controllers\Api\Training;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Course;
use App\Models\LessonProgress;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EnrollmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Enrollment::with(['course', 'user'])
            ->where('user_id', auth()->id());

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $enrollments = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($enrollments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'due_at' => ['nullable', 'date', 'after:today'],
        ]);

        $course = Course::findOrFail($validated['course_id']);

        if ($course->status !== 'published') {
            return response()->json([
                'message' => 'Cannot enroll in unpublished course'
            ], 422);
        }

        $existing = Enrollment::where('user_id', auth()->id())
            ->where('course_id', $course->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Already enrolled in this course'
            ], 422);
        }

        $enrollment = Enrollment::create([
            'tenant_id' => auth()->user()->current_tenant_id,
            'user_id' => auth()->id(),
            'course_id' => $course->id,
            'status' => 'enrolled',
            'due_at' => $validated['due_at'] ?? null,
        ]);

        foreach ($course->lessons as $lesson) {
            LessonProgress::create([
                'enrollment_id' => $enrollment->id,
                'lesson_id' => $lesson->id,
            ]);
        }

        $course->increment('enrollments_count');

        return response()->json($enrollment->load(['course', 'lessonProgress']), 201);
    }

    public function show(Enrollment $enrollment)
    {
        if ($enrollment->user_id !== auth()->id()) {
            abort(403);
        }

        return response()->json(
            $enrollment->load([
                'course.lessons',
                'lessonProgress.lesson',
                'assessmentAttempts.assessment'
            ])
        );
    }

    public function updateProgress(Request $request, Enrollment $enrollment)
    {
        if ($enrollment->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'lesson_id' => ['required', 'exists:lessons,id'],
            'time_spent_seconds' => ['nullable', 'integer', 'min:0'],
            'is_completed' => ['required', 'boolean'],
        ]);

        $lessonProgress = LessonProgress::where('enrollment_id', $enrollment->id)
            ->where('lesson_id', $validated['lesson_id'])
            ->firstOrFail();

        if ($validated['is_completed'] && !$lessonProgress->is_completed) {
            $lessonProgress->update([
                'is_completed' => true,
                'completed_at' => now(),
                'time_spent_seconds' => $lessonProgress->time_spent_seconds + ($validated['time_spent_seconds'] ?? 0),
            ]);
        } else {
            $lessonProgress->increment('time_spent_seconds', $validated['time_spent_seconds'] ?? 0);
        }

        $totalLessons = $enrollment->lessonProgress()->count();
        $completedLessons = $enrollment->lessonProgress()->where('is_completed', true)->count();
        $progressPercent = $totalLessons > 0 ? ($completedLessons / $totalLessons) * 100 : 0;

        $enrollment->update([
            'progress_percent' => $progressPercent,
            'status' => $progressPercent === 100 ? 'completed' : 'in_progress',
            'started_at' => $enrollment->started_at ?? now(),
            'completed_at' => $progressPercent === 100 ? now() : null,
        ]);

        return response()->json($enrollment->load(['lessonProgress']));
    }

    public function withdraw(Enrollment $enrollment)
    {
        if ($enrollment->user_id !== auth()->id()) {
            abort(403);
        }

        if ($enrollment->status === 'completed') {
            return response()->json([
                'message' => 'Cannot withdraw from completed course'
            ], 422);
        }

        $enrollment->update(['status' => 'withdrawn']);

        return response()->json(['message' => 'Enrollment withdrawn successfully']);
    }

    public function myEnrollments(Request $request)
    {
        $enrollments = Enrollment::with(['course'])
            ->where('user_id', auth()->id())
            ->whereNotIn('status', ['withdrawn'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'in_progress' => $enrollments->where('status', 'in_progress')->values(),
            'enrolled' => $enrollments->where('status', 'enrolled')->values(),
            'completed' => $enrollments->where('status', 'completed')->values(),
            'overdue' => Enrollment::where('user_id', auth()->id())
                ->overdue()
                ->with('course')
                ->get(),
        ]);
    }
}
