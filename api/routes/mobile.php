<?php

/**
 * Mobile-specific API routes
 * These routes are used by the React Native Expo mobile app
 * All routes require authentication and X-Tenant-ID header
 */

use App\Http\Controllers\Api\V1\Attachments\WorkOrderPhotoController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    // Work Order Photos
    Route::prefix('work-orders/{workOrder}/photos')->group(function () {
        Route::get('/', [WorkOrderPhotoController::class, 'index']);
        Route::post('/', [WorkOrderPhotoController::class, 'store']);
        Route::delete('/{attachment}', [WorkOrderPhotoController::class, 'destroy']);
    });
});
