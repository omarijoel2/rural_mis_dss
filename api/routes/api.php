<?php

use App\Http\Controllers\Api\SchemeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'service' => 'Rural Water Supply MIS/DSS API',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::prefix('v1')->group(function () {
    Route::apiResource('schemes', SchemeController::class);
});
