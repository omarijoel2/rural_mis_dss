<?php
namespace Database\Seeders;

use App\Models\Workflow\WorkflowDefinition;
use Illuminate\Database\Seeder;

class WorkflowSeeder extends Seeder
{
    public function run(): void
    {
        $workOrderSpec = [
            'key' => 'work_order.v1',
            'name' => 'Work Order Workflow',
            'states' => [
                [
                    'name' => 'new',
                    'on_enter' => ['notify.requester'],
                    'transitions' => [
                        ['to' => 'assigned', 'trigger' => 'assign', 'guard' => "role('Planner')"],
                    ],
                ],
                [
                    'name' => 'assigned',
                    'on_enter' => ['create.task'],
                    'sla' => ['threshold' => 86400, 'escalate' => ['supervisor', 'manager']],
                    'transitions' => [
                        ['to' => 'in_progress', 'trigger' => 'start'],
                        ['to' => 'closed', 'trigger' => 'cancel'],
                    ],
                ],
                [
                    'name' => 'in_progress',
                    'transitions' => [
                        ['to' => 'done', 'trigger' => 'complete'],
                        ['to' => 'assigned', 'trigger' => 'reopen'],
                    ],
                ],
                [
                    'name' => 'done',
                    'transitions' => [
                        ['to' => 'closed', 'trigger' => 'close'],
                    ],
                ],
                [
                    'name' => 'closed',
                    'transitions' => [],
                ],
            ],
        ];

        WorkflowDefinition::create([
            'tenant_id' => 'a06b8d83-18d4-4241-95c6-66216c4dc431',
            'key' => 'work_order.v1',
            'name' => 'Work Order Workflow',
            'version' => 1,
            'spec' => $workOrderSpec,
            'active' => true,
        ]);

        $incidentSpec = [
            'key' => 'incident.v1',
            'name' => 'Incident Workflow',
            'states' => [
                ['name' => 'reported', 'transitions' => [['to' => 'triaged', 'trigger' => 'triage']]],
                ['name' => 'triaged', 'transitions' => [['to' => 'resolved', 'trigger' => 'resolve']]],
                ['name' => 'resolved', 'transitions' => [['to' => 'closed', 'trigger' => 'close']]],
                ['name' => 'closed', 'transitions' => []],
            ],
        ];

        WorkflowDefinition::create([
            'tenant_id' => 'a06b8d83-18d4-4241-95c6-66216c4dc431',
            'key' => 'incident.v1',
            'name' => 'Incident Workflow',
            'version' => 1,
            'spec' => $incidentSpec,
            'active' => true,
        ]);
    }
}
