<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Mobile\SubmissionCreateRequest;
use App\Models\Submission;
use Illuminate\Http\Request;

class SubmissionController extends Controller
{
    public function store(SubmissionCreateRequest $req)
    {
        $data = $req->validated();
        $submission = Submission::create([
            'form_id' => $data['form_id'],
            'form_version' => $data['form_version'] ?? null,
            'data' => $data['data'],
            'device_id' => $data['device_id'],
            'metadata' => $data['metadata'] ?? null,
        ]);

        // Attach media records if provided (keys only)
        if (!empty($data['media_keys'])) {
            foreach ($data['media_keys'] as $key) {
                $submission->media()->create(['key' => $key, 'filename' => basename($key)]);
            }
        }

        return response()->json($submission, 201);
    }

    public function show($id)
    {
        $s = Submission::with('media')->findOrFail($id);
        return response()->json($s);
    }
}
