<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\KmsService;
use App\Models\KmsKey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KmsController extends Controller
{
    protected KmsService $kmsService;

    public function __construct(KmsService $kmsService)
    {
        $this->kmsService = $kmsService;
    }

    public function index()
    {
        $keys = KmsKey::active()->get();
        return response()->json(['keys' => $keys]);
    }

    public function generateKey(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'purpose' => 'required|string',
            'algorithm' => 'string|in:AES-256,AES-128,RSA-2048',
            'expiry_days' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            $key = $this->kmsService->generateKey(
                $request->purpose,
                $request->algorithm ?? 'AES-256',
                $request->expiry_days
            );

            return response()->json(['key' => $key], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function rotateKey(string $id)
    {
        try {
            $oldKey = KmsKey::findOrFail($id);
            $newKey = $this->kmsService->rotateKey($oldKey);

            return response()->json([
                'message' => 'Key rotated successfully',
                'old_key_id' => $oldKey->key_id,
                'new_key' => $newKey,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function getKeysNeedingRotation(Request $request)
    {
        $threshold = $request->input('days_threshold', 90);
        $keys = $this->kmsService->getKeysNeedingRotation($threshold);

        return response()->json(['keys' => $keys]);
    }

    public function rotateAllExpiredKeys(Request $request)
    {
        $threshold = $request->input('days_threshold', 90);
        
        try {
            $rotatedKeys = $this->kmsService->rotateAllExpiredKeys($threshold);

            return response()->json([
                'message' => 'Keys rotated successfully',
                'rotated_keys' => $rotatedKeys,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function encrypt(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'data' => 'required|string',
            'purpose' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->kmsService->encrypt($request->data, $request->purpose);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function decrypt(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'encrypted_data' => 'required|string',
            'iv' => 'required|string',
            'key_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            $decrypted = $this->kmsService->decrypt(
                $request->encrypted_data,
                $request->iv,
                $request->key_id
            );

            return response()->json(['data' => $decrypted]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
