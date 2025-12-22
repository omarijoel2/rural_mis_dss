<?php

namespace App\Http\Controllers\Api\Integration;

use Illuminate\Http\Request;

class MdmController extends IntegrationBaseController
{
    public function listEntities() { return response()->json(['message' => 'MDM entity list']); }
    public function merge($id1, $id2) { return response()->json(['message' => "Entities $id1 and $id2 merged"]); }
    public function unmerge($id1, $mergeId) { return response()->json(['message' => "Entity $id1 unmerged from $mergeId"]); }
}
