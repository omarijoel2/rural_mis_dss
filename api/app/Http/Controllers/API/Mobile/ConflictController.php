<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Mobile\ConflictResolveRequest;
use App\Models\Conflict;
use Illuminate\Http\Request;

class ConflictController extends Controller
{
    public function index(Request $req)
    {
        $conflicts = Conflict::paginate($req->get('per_page', 50));
        return response()->json($conflicts);
    }

    public function show($id)
    {
        $c = Conflict::findOrFail($id);
        return response()->json($c);
    }

    public function resolve(ConflictResolveRequest $req, $id)
    {
        $c = Conflict::findOrFail($id);
        $c->resolution = 'resolved';
        $c->resolution_action = $req->input('resolution');
        $c->notes = $req->input('notes');
        $c->resolved_by = $req->user()?->id;
        $c->resolved_at = now();
        $c->save();

        // TODO: apply resolution to resource and notify device/channel
        return response()->json(['ok' => true]);
    }
}
