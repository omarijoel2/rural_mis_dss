<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\SyncItem;
use App\Services\Mobile\SyncProcessor;

class SyncProcessorTest extends TestCase
{
    use RefreshDatabase;

    public function test_process_submission_create()
    {
        $processor = new SyncProcessor();

        $item = SyncItem::factory()->create([
            'resource_type' => 'submission',
            'action' => 'create',
            'payload' => [
                'form_id' => 'f-1',
                'form_version' => 'v1',
                'data' => ['a' => 1],
                'device_id' => 'device-1',
            ],
        ]);

        $result = $processor->processItem($item);

        $this->assertEquals('ok', $result['status']);
        $this->assertArrayHasKey('server_id', $result);
    }
}
