<?php
namespace App\Http\Controllers\Api\Admin;
use Illuminate\Http\Request;
use App\Models\Role;
use App\Http\Controllers\Controller;
class RoleController extends Controller {
    public function index() { return response()->json(Role::all()); }
    public function show($id) { return response()->json(Role::findOrFail($id)); }
    public function store(Request $req) { $role = Role::create($req->all()); return response()->json($role, 201); }
    public function update(Request $req, $id) { $role = Role::findOrFail($id); $role->update($req->all()); return response()->json($role); }
    public function destroy($id) { Role::destroy($id); return response()->json(['ok'=>true]); }
}
