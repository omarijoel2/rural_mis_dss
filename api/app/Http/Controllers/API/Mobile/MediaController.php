<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function presign(Request $req)
    {
        $req->validate(["filename" => "required|string", "content_type" => "required|string", "size_bytes" => "nullable|integer"]);
        $key = 'mobile/media/' . uniqid() . '_' . basename($req->input('filename'));

        // Example: use S3 temporary URL
        $disk = Storage::disk(config('filesystems.default'));
        $url = $disk->temporaryUrl($key, now()->addMinutes(15));

        return response()->json(['upload_url' => $url, 'key' => $key]);
    }
}
