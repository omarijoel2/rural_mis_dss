<?php
namespace App\Http\Controllers\Api\Admin;
use Illuminate\Http\Request;
use App\Models\Setting;
use App\Http\Controllers\Controller;
class SettingController extends Controller {
    public function index() { return response()->json(Setting::all()); }
    public function show($id) { return response()->json(Setting::findOrFail($id)); }
    public function store(Request $req) { $setting = Setting::create($req->all()); return response()->json($setting, 201); }
    public function update(Request $req, $id) { $setting = Setting::findOrFail($id); $setting->update($req->all()); return response()->json($setting); }
    public function destroy($id) { Setting::destroy($id); return response()->json(['ok'=>true]); }
}
