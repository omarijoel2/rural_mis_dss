<?php

namespace App\Services;

use App\Models\SecurityAlert;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UploadScanService
{
    protected AuditService $auditService;
    protected SecurityAlertService $alertService;

    public function __construct(AuditService $auditService, SecurityAlertService $alertService)
    {
        $this->auditService = $auditService;
        $this->alertService = $alertService;
    }

    /**
     * Scan uploaded file for threats
     */
    public function scanFile(UploadedFile $file): array
    {
        $results = [
            'safe' => true,
            'threats' => [],
            'file_hash' => hash_file('sha256', $file->getRealPath()),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ];

        if ($this->isSizeExceeded($file)) {
            $results['safe'] = false;
            $results['threats'][] = 'File size exceeds limit';
        }

        if (!$this->isAllowedMimeType($file)) {
            $results['safe'] = false;
            $results['threats'][] = 'Disallowed file type: ' . $file->getMimeType();
        }

        if ($this->hasDisallowedExtension($file)) {
            $results['safe'] = false;
            $results['threats'][] = 'Disallowed file extension';
        }

        $clamavResult = $this->scanWithClamAV($file);
        if (!$clamavResult['safe']) {
            $results['safe'] = false;
            $results['threats'] = array_merge($results['threats'], $clamavResult['threats']);
        }

        if (!$results['safe']) {
            $this->alertService->createAlert(
                'file_upload_threat',
                'high',
                'Malicious File Upload Blocked',
                'A potentially dangerous file was blocked during upload',
                [
                    'file_hash' => $results['file_hash'],
                    'mime_type' => $results['mime_type'],
                    'threats' => $results['threats'],
                ]
            );

            $this->auditService->log(
                'upload.threat.detected',
                null,
                null,
                null,
                [
                    'file_hash' => $results['file_hash'],
                    'threats' => $results['threats'],
                ],
                'critical'
            );
        }

        return $results;
    }

    /**
     * Scan file with ClamAV (stub implementation)
     */
    protected function scanWithClamAV(UploadedFile $file): array
    {
        if (!config('security.clamav_enabled', false)) {
            return ['safe' => true, 'threats' => []];
        }

        return ['safe' => true, 'threats' => []];
    }

    /**
     * Check if file size is within limits
     */
    protected function isSizeExceeded(UploadedFile $file): bool
    {
        $maxSize = config('security.max_upload_size', 10 * 1024 * 1024);
        return $file->getSize() > $maxSize;
    }

    /**
     * Check if MIME type is allowed
     */
    protected function isAllowedMimeType(UploadedFile $file): bool
    {
        $allowedMimeTypes = config('security.allowed_mime_types', [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/csv',
        ]);

        return in_array($file->getMimeType(), $allowedMimeTypes);
    }

    /**
     * Check if file extension is not on blocklist
     */
    protected function hasDisallowedExtension(UploadedFile $file): bool
    {
        $disallowedExtensions = config('security.disallowed_extensions', [
            'exe', 'bat', 'cmd', 'sh', 'ps1', 'vbs', 'js', 'jar',
            'com', 'pif', 'application', 'gadget', 'msi', 'msp',
            'scr', 'hta', 'cpl', 'msc', 'inf', 'reg',
        ]);

        $extension = strtolower($file->getClientOriginalExtension());
        
        return in_array($extension, $disallowedExtensions);
    }

    /**
     * Quarantine suspicious file
     */
    public function quarantineFile(UploadedFile $file, string $reason): string
    {
        $quarantinePath = 'quarantine/' . date('Y/m/d');
        $filename = time() . '_' . hash('sha256', $file->getClientOriginalName());
        
        $path = Storage::put($quarantinePath . '/' . $filename, file_get_contents($file->getRealPath()));

        $this->auditService->log(
            'upload.file.quarantined',
            null,
            null,
            null,
            [
                'original_name' => $file->getClientOriginalName(),
                'quarantine_path' => $path,
                'reason' => $reason,
            ],
            'warning'
        );

        return $path;
    }

    /**
     * Get quarantine statistics
     */
    public function getQuarantineStats(): array
    {
        $files = Storage::files('quarantine');
        
        return [
            'total_files' => count($files),
            'total_size' => array_sum(array_map(fn($f) => Storage::size($f), $files)),
            'oldest_file' => count($files) > 0 ? min(array_map(fn($f) => Storage::lastModified($f), $files)) : null,
        ];
    }
}
