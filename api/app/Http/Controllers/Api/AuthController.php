<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Login with email and password
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
            'device_fingerprint' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $result = $this->authService->login(
                $request->email,
                $request->password,
                $request->device_fingerprint
            );

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 401);
        }
    }

    /**
     * Verify 2FA code
     */
    public function verifyTwoFactor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|uuid',
            'code' => 'required|string|size:6',
            'device_fingerprint' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $result = $this->authService->verifyTwoFactor(
                $request->user_id,
                $request->code,
                $request->device_fingerprint
            );

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 401);
        }
    }

    /**
     * Logout current user
     */
    public function logout(Request $request)
    {
        try {
            $this->authService->logout($request->user());

            return response()->json([
                'message' => 'Logged out successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get current authenticated user
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load(['currentTenant', 'roles', 'permissions']),
        ]);
    }

    /**
     * Refresh access token
     */
    public function refresh(Request $request)
    {
        try {
            $token = $this->authService->refreshToken($request->user());

            return response()->json([
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Enroll in 2FA
     */
    public function enrollTwoFactor(Request $request)
    {
        try {
            $result = $this->authService->enrollTwoFactor($request->user());

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Enable 2FA after enrollment
     */
    public function enableTwoFactor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $result = $this->authService->enableTwoFactor($request->user(), $request->code);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Disable 2FA
     */
    public function disableTwoFactor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $this->authService->disableTwoFactor($request->user(), $request->password);

            return response()->json([
                'message' => '2FA disabled successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Switch tenant context
     */
    public function switchTenant(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tenant_id' => 'required|uuid|exists:tenants,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $request->user()->switchTenant($request->tenant_id);

            return response()->json([
                'message' => 'Tenant switched successfully',
                'current_tenant' => $request->user()->load('currentTenant')->currentTenant,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    /**
     * Get user's tenants
     */
    public function getTenants(Request $request)
    {
        return response()->json([
            'tenants' => $request->user()->tenants,
        ]);
    }
}
