<?php

namespace App\Services\Mobile;

use App\Models\SyncItem;
use App\Models\Submission;
use App\Models\SubmissionMedia;
use App\Models\Conflict;
use App\Models\User;
use App\Notifications\ConflictCreated;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\DB;
use Exception;

class SyncProcessor
{
    /**
     * Process a single SyncItem and return an array result
     * @return array ['status' => 'ok'|'conflict'|'error', 'server_id' => string|null, 'server_version' => int|null, 'error' => string|null]
     */
    public function processItem(SyncItem $item): array
    {
        $resource = strtolower($item->resource_type);
        $action = strtolower($item->action);

        try {
            if ($resource === 'submission') {
                return $this->processSubmission($item, $action);
            }

            // Add other resource handlers here (e.g., 'meter', 'asset', etc.)

            return ['status' => 'error', 'error' => "Unsupported resource: {$item->resource_type}"];
        } catch (Exception $e) {
            return ['status' => 'error', 'error' => $e->getMessage()];
        }
    }

    protected function processSubmission(SyncItem $item, string $action): array
    {
        $payload = $item->payload ?? [];

        if ($action === 'create') {
            return DB::transaction(function () use ($payload) {
                $submission = Submission::create([
                    'form_id' => $payload['form_id'] ?? null,
                    'form_version' => $payload['form_version'] ?? null,
                    'data' => $payload['data'] ?? [],
                    'device_id' => $payload['device_id'] ?? null,
                    'metadata' => $payload['metadata'] ?? null,
                ]);

                // attach media if keys provided
                if (!empty($payload['media_keys']) && is_array($payload['media_keys'])) {
                    foreach ($payload['media_keys'] as $key) {
                        SubmissionMedia::create([
                            'submission_id' => $submission->id,
                            'key' => $key,
                            'filename' => basename($key),
                        ]);
                    }
                }

                return ['status' => 'ok', 'server_id' => $submission->id, 'server_version' => time()];
            });
        }

        if ($action === 'update') {
            $id = $payload['id'] ?? null;
            if (!$id) {
                return ['status' => 'error', 'error' => 'Missing id for update'];
            }
            $submission = Submission::find($id);
            if (!$submission) {
                return ['status' => 'error', 'error' => 'Submission not found'];
            }

            // Conflict detection: if payload contains last_known_updated_at and server updated_at is newer, mark conflict
            if (!empty($payload['last_known_updated_at'])) {
                $clientTs = strtotime($payload['last_known_updated_at']);
                $serverTs = $submission->updated_at ? $submission->updated_at->getTimestamp() : 0;
                if ($serverTs > $clientTs) {
                    // Create Conflict record
                    $conflict = Conflict::create([
                        'resource_type' => 'submission',
                        'resource_id' => $submission->id,
                        'server_payload' => $submission->toArray(),
                        'client_payload' => $payload,
                    ]);

                    // Notify admin users about the new conflict (DB + broadcast)
                    try {
                        $admins = User::role(['Super Admin', 'Admin'])->get();
                        if ($admins->isNotEmpty()) {
                            Notification::send($admins, new ConflictCreated($conflict));
                        }
                    } catch (Exception $e) {
                        // swallow notification errors but include in returned message for visibility
                        return ['status' => 'conflict', 'server_id' => $submission->id, 'error' => 'Version conflict detected; notification failed: ' . $e->getMessage()];
                    }

                    return ['status' => 'conflict', 'server_id' => $submission->id, 'error' => 'Version conflict detected'];
                }
            }

            $submission->update(['data' => $payload['data'] ?? $submission->data, 'metadata' => $payload['metadata'] ?? $submission->metadata]);
            return ['status' => 'ok', 'server_id' => $submission->id, 'server_version' => time()];
        }

        if ($action === 'delete') {
            $id = $payload['id'] ?? null;
            if (!$id) {
                return ['status' => 'error', 'error' => 'Missing id for delete'];
            }
            $submission = Submission::find($id);
            if (!$submission) {
                return ['status' => 'ok', 'server_id' => $id, 'server_version' => time()]; // already gone
            }
            $submission->delete();
            return ['status' => 'ok', 'server_id' => $id, 'server_version' => time()];
        }

        return ['status' => 'error', 'error' => 'Unknown action'];
    }
}
