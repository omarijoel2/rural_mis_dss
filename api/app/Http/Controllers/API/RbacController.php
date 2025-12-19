<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RbacService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;

class RbacController extends Controller
{
    protected RbacService $rbacService;

    public function __construct(RbacService $rbacService)
    {
        $this->rbacService = $rbacService;
    }

    public function getRoles(Request $request)
    {
        $tenantId = $request->user()->current_tenant_id;
        $roles = $this->rbacService->getAllRoles($tenantId);

        return response()->json(['roles' => $roles]);
    }

    public function createRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            $role = $this->rbacService->createRole(
                $request->name,
                $request->user()->current_tenant_id,
                $request->permissions ?? []
            );

            return response()->json(['role' => $role], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function updateRole(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            $role = Role::findOrFail($id);
            $this->rbacService->updateRolePermissions($role, $request->permissions);

            return response()->json(['role' => $role->load('permissions')]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function deleteRole(string $id)
    {
        try {
            $role = Role::findOrFail($id);
            $this->rbacService->deleteRole($role);

            return response()->json(['message' => 'Role deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function getPermissions()
    {
        $permissions = $this->rbacService->getAllPermissions();
        return response()->json(['permissions' => $permissions]);
    }

    public function assignRole(Request $request, string $userId)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|string|exists:roles,name',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            $user = \App\Models\User::findOrFail($userId);
            $this->rbacService->assignRole($user, $request->role, $request->user()->current_tenant_id);

            return response()->json(['message' => 'Role assigned successfully', 'user' => $user->load('roles')]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function removeRole(Request $request, string $userId)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            $user = \App\Models\User::findOrFail($userId);
            $this->rbacService->removeRole($user, $request->role);

            return response()->json(['message' => 'Role removed successfully', 'user' => $user->load('roles')]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function getUserPermissions(string $userId)
    {
        try {
            $user = \App\Models\User::findOrFail($userId);
            $permissions = $this->rbacService->getUserPermissions($user);

            return response()->json(['permissions' => $permissions]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}
