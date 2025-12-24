<?php
namespace App\Http\Controllers\Api\Admin;
use Illuminate\Http\Request;
use App\Models\User;
use App\Http\Controllers\Controller;
class UserController extends Controller {
    public function index() { return response()->json(User::all()); }
    public function show($id) { return response()->json(User::findOrFail($id)); }
    public function store(Request $req) { $user = User::create($req->all()); return response()->json($user, 201); }
    public function update(Request $req, $id) { $user = User::findOrFail($id); $user->update($req->all()); return response()->json($user); }
    public function destroy($id) { User::destroy($id); return response()->json(['ok'=>true]); }
}
