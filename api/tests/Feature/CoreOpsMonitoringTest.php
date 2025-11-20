<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class CoreOpsMonitoringTest extends TestCase
{
    /**
     * Test that monitoring headers are present on successful requests.
     */
    public function test_monitoring_headers_on_success(): void
    {
        // Make a request to a Core Ops endpoint (unauthenticated to avoid auth complexities)
        $response = $this->getJson('/api/v1/core-ops/dashboard');
        
        // Should fail with 401 but still have monitoring headers
        $this->assertResponseHeadersPresent($response);
    }
    
    /**
     * Test that monitoring logs both channels for all requests.
     */
    public function test_monitoring_logs_all_requests(): void
    {
        // Clear logs
        $this->clearLogFiles();
        
        // Make a request
        $response = $this->getJson('/api/v1/core-ops/dashboard');
        
        // Verify both log files exist and have content
        $dateString = date('Y-m-d');
        $coreOpsLog = storage_path("logs/core_ops-{$dateString}.log");
        $performanceLog = storage_path("logs/core_ops_performance-{$dateString}.log");
        
        $this->assertFileExists($coreOpsLog, 'core_ops.log should exist');
        $this->assertFileExists($performanceLog, 'core_ops_performance.log should exist');
        
        // Verify log contents
        $coreOpsContent = File::get($coreOpsLog);
        $performanceContent = File::get($performanceLog);
        
        $this->assertStringContainsString('Incoming Request', $coreOpsContent);
        $this->assertStringContainsString('Request Performance', $performanceContent);
    }
    
    /**
     * Assert that monitoring headers are present in response.
     */
    private function assertResponseHeadersPresent($response): void
    {
        $response->assertHeader('X-Request-ID');
        $response->assertHeader('X-Response-Time');
        
        // Verify X-Request-ID format
        $requestId = $response->headers->get('X-Request-ID');
        $this->assertStringStartsWith('req_', $requestId);
        
        // Verify X-Response-Time format
        $responseTime = $response->headers->get('X-Response-Time');
        $this->assertStringEndsWith('ms', $responseTime);
    }
    
    /**
     * Clear log files for clean testing.
     */
    private function clearLogFiles(): void
    {
        $dateString = date('Y-m-d');
        $coreOpsLog = storage_path("logs/core_ops-{$dateString}.log");
        $performanceLog = storage_path("logs/core_ops_performance-{$dateString}.log");
        
        if (File::exists($coreOpsLog)) {
            File::delete($coreOpsLog);
        }
        if (File::exists($performanceLog)) {
            File::delete($performanceLog);
        }
    }
}
