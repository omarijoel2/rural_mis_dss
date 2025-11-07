<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RbacService
{
    protected AuditService $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Create a new role
     */
    public function createRole(string $name, ?string $tenantId = null, array $permissions = []): Role
    {
        $role = Role::create([
            'name' => $name,
            'guard_name' => 'web',
            'team_id' => $tenantId,
        ]);

        if (!empty($permissions)) {
            $role->syncPermissions($permissions);
        }

        $this->auditService->log(
            'rbac.role.created',
            Auth::id(),
            Role::class,
            $role->id,
            ['name' => $name, 'permissions' => $permissions]
        );

        return $role;
    }

    /**
     * Update role permissions
     */
    public function updateRolePermissions(Role $role, array $permissions): void
    {
        $oldPermissions = $role->permissions->pluck('name')->toArray();
        $role->syncPermissions($permissions);

        $this->auditService->log(
            'rbac.role.permissions_updated',
            Auth::id(),
            Role::class,
            $role->id,
            [
                'old_permissions' => $oldPermissions,
                'new_permissions' => $permissions,
            ]
        );
    }

    /**
     * Delete a role
     */
    public function deleteRole(Role $role): void
    {
        $roleName = $role->name;
        $role->delete();

        $this->auditService->log(
            'rbac.role.deleted',
            Auth::id(),
            Role::class,
            $role->id,
            ['name' => $roleName],
            'warning'
        );
    }

    /**
     * Assign role to user
     */
    public function assignRole(User $user, string $roleName, ?string $tenantId = null): void
    {
        $user->assignRole($roleName);

        $this->auditService->log(
            'rbac.user.role_assigned',
            Auth::id(),
            User::class,
            $user->id,
            ['role' => $roleName, 'tenant_id' => $tenantId]
        );
    }

    /**
     * Remove role from user
     */
    public function removeRole(User $user, string $roleName): void
    {
        $user->removeRole($roleName);

        $this->auditService->log(
            'rbac.user.role_removed',
            Auth::id(),
            User::class,
            $user->id,
            ['role' => $roleName]
        );
    }

    /**
     * Grant permission to user
     */
    public function grantPermission(User $user, string $permissionName): void
    {
        $user->givePermissionTo($permissionName);

        $this->auditService->log(
            'rbac.user.permission_granted',
            Auth::id(),
            User::class,
            $user->id,
            ['permission' => $permissionName]
        );
    }

    /**
     * Revoke permission from user
     */
    public function revokePermission(User $user, string $permissionName): void
    {
        $user->revokePermissionTo($permissionName);

        $this->auditService->log(
            'rbac.user.permission_revoked',
            Auth::id(),
            User::class,
            $user->id,
            ['permission' => $permissionName]
        );
    }

    /**
     * Check if user has permission
     */
    public function hasPermission(User $user, string $permission): bool
    {
        return $user->hasPermissionTo($permission);
    }

    /**
     * Check if user has role
     */
    public function hasRole(User $user, string $role): bool
    {
        return $user->hasRole($role);
    }

    /**
     * Check if user has any of the given roles
     */
    public function hasAnyRole(User $user, array $roles): bool
    {
        return $user->hasAnyRole($roles);
    }

    /**
     * Get all permissions for user
     */
    public function getUserPermissions(User $user): array
    {
        return $user->getAllPermissions()->pluck('name')->toArray();
    }

    /**
     * Get all roles for user
     */
    public function getUserRoles(User $user): array
    {
        return $user->getRoleNames()->toArray();
    }

    /**
     * Create a permission
     */
    public function createPermission(string $name, ?string $description = null): Permission
    {
        $permission = Permission::create([
            'name' => $name,
            'guard_name' => 'web',
        ]);

        $this->auditService->log(
            'rbac.permission.created',
            Auth::id(),
            Permission::class,
            $permission->id,
            ['name' => $name, 'description' => $description]
        );

        return $permission;
    }

    /**
     * Get all available roles
     */
    public function getAllRoles(?string $tenantId = null)
    {
        $query = Role::query();

        if ($tenantId) {
            $query->where('team_id', $tenantId);
        }

        return $query->with('permissions')->get();
    }

    /**
     * Get all available permissions
     */
    public function getAllPermissions()
    {
        return Permission::all();
    }
}
