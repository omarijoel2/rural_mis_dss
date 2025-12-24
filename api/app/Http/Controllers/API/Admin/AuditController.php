<?php
namespace App\Http\Controllers\Api\Admin;
use Illuminate\Http\Request;
use App\Models\Audit;
use App\Http\Controllers\Controller;
class AuditController extends Controller {
    public function index() { return response()->json(Audit::all()); }
    public function show($id) { return response()->json(Audit::findOrFail($id)); }
    public function destroy($id) { Audit::destroy($id); return response()->json(['ok'=>true]); }
}
