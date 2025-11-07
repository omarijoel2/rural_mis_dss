<?php

namespace App\Jobs;

use App\Services\KmsService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RotateEncryptionKeysJob implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function handle(KmsService $kmsService): void
    {
        $rotatedKeys = $kmsService->rotateAllExpiredKeys(90);

        \Log::info('Encryption keys rotated', ['rotated_keys' => $rotatedKeys]);
    }
}
