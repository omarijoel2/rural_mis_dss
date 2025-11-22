<?php

namespace App\Http\Controllers\API\V1\Attachments;

use App\Models\WorkOrder;
use App\Models\WorkOrderAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class WorkOrderPhotoController extends Controller
{
    /**
     * Upload photo for work order
     */
    public function store(Request $request, WorkOrder $workOrder): JsonResponse
    {
        // Verify tenant access
        $tenantId = auth()->user()->active_tenant_id ?? auth()->user()->tenant_id;
        if ($workOrder->tenant_id !== $tenantId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'photo' => 'required|image|max:10240', // 10MB max
            'description' => 'nullable|string|max:500',
            'phase' => 'nullable|in:before,during,after', // Work order phase
        ]);

        try {
            $file = $request->file('photo');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            
            // Store in S3 or local storage based on config
            $path = Storage::disk(config('filesystems.default'))
                ->putFileAs(
                    "work-orders/{$workOrder->id}/photos",
                    $file,
                    $filename,
                    'public'
                );

            // Create attachment record
            $attachment = WorkOrderAttachment::create([
                'work_order_id' => $workOrder->id,
                'tenant_id' => $tenantId,
                'type' => 'photo',
                'url' => Storage::disk(config('filesystems.default'))->url($path),
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'description' => $validated['description'] ?? null,
                'metadata' => [
                    'phase' => $validated['phase'] ?? null,
                    'uploaded_by' => auth()->user()->name,
                    'uploaded_at' => now()->toIso8601String(),
                ],
                'uploaded_by' => auth()->id(),
            ]);

            return response()->json([
                'data' => [
                    'id' => $attachment->id,
                    'url' => $attachment->url,
                    'uploaded_at' => $attachment->created_at,
                    'metadata' => $attachment->metadata,
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Photo upload failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * List photos for work order
     */
    public function index(WorkOrder $workOrder): JsonResponse
    {
        $tenantId = auth()->user()->active_tenant_id ?? auth()->user()->tenant_id;
        if ($workOrder->tenant_id !== $tenantId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $photos = WorkOrderAttachment::where('work_order_id', $workOrder->id)
            ->where('type', 'photo')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $photos->map(function ($photo) {
                return [
                    'id' => $photo->id,
                    'url' => $photo->url,
                    'description' => $photo->description,
                    'uploaded_by' => $photo->uploadedBy?->name,
                    'uploaded_at' => $photo->created_at,
                    'metadata' => $photo->metadata,
                ];
            })
        ]);
    }

    /**
     * Delete photo from work order
     */
    public function destroy(WorkOrder $workOrder, WorkOrderAttachment $attachment): JsonResponse
    {
        $tenantId = auth()->user()->active_tenant_id ?? auth()->user()->tenant_id;
        if ($workOrder->tenant_id !== $tenantId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($attachment->work_order_id !== $workOrder->id) {
            return response()->json(['message' => 'Not found'], 404);
        }

        // Delete from storage
        Storage::disk(config('filesystems.default'))->delete(
            "work-orders/{$workOrder->id}/photos/{$attachment->original_name}"
        );

        $attachment->delete();

        return response()->json(null, 204);
    }
}
