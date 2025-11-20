<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SpatialEditLayer;
use App\Models\Redline;
use App\Models\SpatialChangeLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SpatialEditController extends Controller
{
    public function index(Request $request)
    {
        $query = SpatialEditLayer::with(['user', 'reviewedBy', 'approvedBy']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('layer_name')) {
            $query->where('layer_name', $request->layer_name);
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate(20)
        );
    }

    public function show(SpatialEditLayer $spatialEdit)
    {
        $spatialEdit->load(['user', 'reviewedBy', 'approvedBy', 'redlines']);
        
        return response()->json($spatialEdit);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'layer_name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'change_type' => ['required', Rule::in(['create', 'update', 'delete'])],
            'metadata' => ['nullable', 'array'],
        ]);

        $spatialEdit = SpatialEditLayer::create([
            'layer_name' => $validated['layer_name'],
            'description' => $validated['description'] ?? null,
            'change_type' => $validated['change_type'],
            'status' => 'draft',
            'user_id' => auth()->id(),
            'metadata' => $validated['metadata'] ?? [],
        ]);

        $this->logChange($spatialEdit, 'created', null, 'draft');

        return response()->json($spatialEdit, 201);
    }

    public function submitForReview(SpatialEditLayer $spatialEdit)
    {
        if ($spatialEdit->status !== 'draft') {
            return response()->json([
                'message' => 'Only draft edits can be submitted for review'
            ], 422);
        }

        if ($spatialEdit->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'You can only submit your own edits'
            ], 403);
        }

        $redlinesCount = $spatialEdit->redlines()->count();
        if ($redlinesCount === 0) {
            return response()->json([
                'message' => 'Cannot submit edit with no redlines'
            ], 422);
        }

        $oldStatus = $spatialEdit->status;
        $spatialEdit->update([
            'status' => 'review',
            'submitted_at' => now(),
        ]);

        $this->logChange($spatialEdit, 'status_changed', $oldStatus, 'review');

        return response()->json([
            'message' => 'Edit submitted for review',
            'data' => $spatialEdit->fresh(['user', 'reviewedBy', 'approvedBy'])
        ]);
    }

    public function approve(Request $request, SpatialEditLayer $spatialEdit)
    {
        if ($spatialEdit->status !== 'review') {
            return response()->json([
                'message' => 'Only edits in review can be approved'
            ], 422);
        }

        if (!$request->user()->can('approve spatial edits')) {
            return response()->json([
                'message' => 'You do not have permission to approve edits'
            ], 403);
        }

        $validated = $request->validate([
            'notes' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($spatialEdit, $validated) {
            $oldStatus = $spatialEdit->status;
            
            $spatialEdit->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'approval_notes' => $validated['notes'] ?? null,
            ]);

            $spatialEdit->redlines()->update(['status' => 'applied']);

            $this->logChange($spatialEdit, 'approved', $oldStatus, 'approved');
        });

        return response()->json([
            'message' => 'Edit approved successfully',
            'data' => $spatialEdit->fresh(['user', 'reviewedBy', 'approvedBy'])
        ]);
    }

    public function reject(Request $request, SpatialEditLayer $spatialEdit)
    {
        if (!in_array($spatialEdit->status, ['review', 'draft'])) {
            return response()->json([
                'message' => 'Cannot reject already processed edits'
            ], 422);
        }

        if (!$request->user()->can('review spatial edits')) {
            return response()->json([
                'message' => 'You do not have permission to reject edits'
            ], 403);
        }

        $validated = $request->validate([
            'notes' => ['required', 'string'],
        ]);

        $oldStatus = $spatialEdit->status;
        
        $spatialEdit->update([
            'status' => 'rejected',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'approval_notes' => $validated['notes'],
        ]);

        $spatialEdit->redlines()->update(['status' => 'rejected']);

        $this->logChange($spatialEdit, 'rejected', $oldStatus, 'rejected');

        return response()->json([
            'message' => 'Edit rejected',
            'data' => $spatialEdit->fresh(['user', 'reviewedBy', 'approvedBy'])
        ]);
    }

    public function destroy(SpatialEditLayer $spatialEdit)
    {
        if ($spatialEdit->status === 'approved') {
            return response()->json([
                'message' => 'Cannot delete approved edits'
            ], 422);
        }

        if ($spatialEdit->user_id !== auth()->id() && !auth()->user()->can('delete any spatial edits')) {
            return response()->json([
                'message' => 'You can only delete your own draft edits'
            ], 403);
        }

        $this->logChange($spatialEdit, 'deleted', $spatialEdit->status, null);

        $spatialEdit->delete();

        return response()->json([
            'message' => 'Edit deleted successfully'
        ]);
    }

    private function logChange(SpatialEditLayer $spatialEdit, string $action, ?string $oldStatus, ?string $newStatus)
    {
        SpatialChangeLog::create([
            'layer_id' => $spatialEdit->id,
            'user_id' => auth()->id(),
            'action' => $action,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'metadata' => [
                'layer_name' => $spatialEdit->layer_name,
                'change_type' => $spatialEdit->change_type,
            ],
        ]);
    }
}
