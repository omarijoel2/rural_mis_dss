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
     * Super admins can optionally select a tenant during login
     * County admins are auto-assigned to their tenant
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
            'device_fingerprint' => 'nullable|string',
            'tenant_id' => 'nullable|uuid|exists:tenants,id',
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
                $request->device_fingerprint,
                $request->tenant_id
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
     * Accepts optional tenant_id for super admins
     */
    public function verifyTwoFactor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|uuid',
            'code' => 'required|string|size:6',
            'device_fingerprint' => 'nullable|string',
            'tenant_id' => 'nullable|uuid|exists:tenants,id',
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
                $request->device_fingerprint,
                $request->tenant_id
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
     * Get current authenticated user with tenant context
     */
    public function me(Request $request)
    {
        $user = $request->user()->load(['currentTenant', 'roles.permissions']);
        
        $roleNames = $user->roles->pluck('name')->toArray();
        $permissionNames = $user->getAllPermissions()->pluck('name')->unique()->values()->toArray();
        
        $isSuperAdmin = $user->isSuperAdmin();
        $accessibleTenants = $user->getAccessibleTenants();
        $currentTenant = $user->currentTenant;
        
        // Super Admin: Auto-select first tenant if none selected (county selection disabled temporarily)
        if ($isSuperAdmin && !$currentTenant && $accessibleTenants->count() > 0) {
            $user->switchTenant($accessibleTenants->first()->id);
            $user->refresh();
            $currentTenant = $user->load('currentTenant')->currentTenant;
        }
        
        // Tenant selection is disabled for Super Admin users temporarily
        $requiresTenantSelection = !$isSuperAdmin && !$currentTenant && $accessibleTenants->count() > 0;
        
        return response()->json([
            'user' => array_merge($user->toArray(), [
                'role_names' => $roleNames,
                'permission_names' => $permissionNames,
            ]),
            'tenant' => $currentTenant,
            'is_super_admin' => $isSuperAdmin,
            'accessible_tenants' => $requiresTenantSelection ? $accessibleTenants : [],
            'requires_tenant_selection' => $requiresTenantSelection,
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
     * Super admins can switch to any tenant
     * County admins can only switch to their assigned tenants
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

        $user = $request->user();

        // Check if user can access this tenant
        if (!$user->canAccessTenant($request->tenant_id)) {
            return response()->json([
                'message' => 'You do not have access to this county',
            ], 403);
        }

        try {
            $user->switchTenant($request->tenant_id);

            return response()->json([
                'message' => 'County switched successfully',
                'current_tenant' => $user->load('currentTenant')->currentTenant,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    /**
     * Get user's accessible tenants
     * Super admins get all active tenants
     * County admins get only their assigned tenants
     */
    public function getTenants(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'tenants' => $user->getAccessibleTenants(),
            'is_super_admin' => $user->isSuperAdmin(),
            'current_tenant' => $user->currentTenant,
        ]);
    }

    /**
     * Select tenant after initial login
     * Used when super admin needs to select a county after authentication
     */
    public function selectTenant(Request $request)
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

        $user = $request->user();

        // Check if user can access this tenant
        if (!$user->canAccessTenant($request->tenant_id)) {
            return response()->json([
                'message' => 'You do not have access to this county',
            ], 403);
        }

        try {
            $user->switchTenant($request->tenant_id);
            $user->refresh();
            $user->load(['currentTenant', 'roles.permissions']);

            // Get flattened role and permission names
            $roleNames = $user->roles->pluck('name')->toArray();
            $permissionNames = $user->getAllPermissions()->pluck('name')->unique()->values()->toArray();

            return response()->json([
                'message' => 'County selected successfully',
                'user' => array_merge($user->toArray(), [
                    'role_names' => $roleNames,
                    'permission_names' => $permissionNames,
                ]),
                'tenant' => $user->currentTenant,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 403);
        }
    }
}
