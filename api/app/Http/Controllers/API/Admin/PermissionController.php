<?php
namespace App\Http\Controllers\Api\Admin;
use Illuminate\Http\Request;
use App\Models\Permission;
use App\Http\Controllers\Controller;
class PermissionController extends Controller {
    public function index() { return response()->json(Permission::all()); }
    public function show($id) { return response()->json(Permission::findOrFail($id)); }
    public function store(Request $req) { $perm = Permission::create($req->all()); return response()->json($perm, 201); }
    public function update(Request $req, $id) { $perm = Permission::findOrFail($id); $perm->update($req->all()); return response()->json($perm); }
    public function destroy($id) { Permission::destroy($id); return response()->json(['ok'=>true]); }
}
