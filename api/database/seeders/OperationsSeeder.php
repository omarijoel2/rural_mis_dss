<?php

namespace Database\Seeders;

use App\Models\Shift;
use App\Models\ShiftEntry;
use App\Models\Checklist;
use App\Models\ChecklistRun;
use App\Models\Event;
use App\Models\EventAction;
use App\Models\Playbook;
use App\Models\EscalationPolicy;
use App\Models\Notification;
use App\Models\Organization;
use App\Models\Facility;
use App\Models\Scheme;
use App\Models\User;
use Illuminate\Database\Seeder;
use MatanYadaev\EloquentSpatial\Objects\Point;

class OperationsSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Starting Operations module seeder...');

        $tenant = Organization::first();
        if (!$tenant) {
            $this->command->error('No organization found. Please run core seeder first.');
            return;
        }

        $user = User::where('email', 'admin@kwu.test')->first();
        if (!$user) {
            $user = User::first();
        }

        $facility = Facility::first();
        $scheme = Scheme::first();

        $this->seedChecklists($tenant);
        $this->seedPlaybooks($tenant);
        $this->seedEscalationPolicies($tenant);
        $this->seedShifts($tenant, $user);
        $this->seedEvents($tenant, $facility, $scheme, $user);

        $this->command->info('Operations seeder completed successfully!');
    }

    protected function seedChecklists($tenant): void
    {
        $this->command->info('Creating checklists...');

        $checklists = [
            [
                'title' => 'Shift Handover Checklist',
                'frequency' => 'shift_start',
                'schema' => [
                    ['question' => 'Review active events and alarms', 'type' => 'boolean', 'required' => true, 'options' => []],
                    ['question' => 'Check critical asset statuses', 'type' => 'boolean', 'required' => true, 'options' => []],
                    ['question' => 'Review outstanding work orders', 'type' => 'boolean', 'required' => true, 'options' => []],
                    ['question' => 'Brief incoming operator on key issues', 'type' => 'boolean', 'required' => true, 'options' => []],
                    ['question' => 'Sign handover log', 'type' => 'boolean', 'required' => true, 'options' => []],
                ],
            ],
            [
                'title' => 'Daily System Check',
                'frequency' => 'daily',
                'schema' => [
                    ['question' => 'Verify reservoir levels are within normal range', 'type' => 'boolean', 'required' => true, 'options' => []],
                    ['question' => 'Check pump station pressures', 'type' => 'boolean', 'required' => true, 'options' => []],
                    ['question' => 'Review water quality readings', 'type' => 'boolean', 'required' => true, 'options' => []],
                    ['question' => 'Current chlorine residual (mg/L)', 'type' => 'number', 'required' => true, 'options' => []],
                    ['question' => 'Check DMA flow rates', 'type' => 'boolean', 'required' => true, 'options' => []],
                    ['question' => 'Energy consumption notes', 'type' => 'text', 'required' => false, 'options' => []],
                ],
            ],
            [
                'title' => 'Emergency Response Checklist',
                'frequency' => 'on_demand',
                'schema' => [
                    ['question' => 'Situation severity assessment', 'type' => 'choice', 'required' => true, 'options' => ['Low', 'Medium', 'High', 'Critical']],
                    ['question' => 'Shift supervisor notified', 'type' => 'boolean', 'required' => true, 'options' => []],
                    ['question' => 'Emergency playbook activated', 'type' => 'boolean', 'required' => true, 'options' => []],
                    ['question' => 'Affected zone isolated if needed', 'type' => 'boolean', 'required' => true, 'options' => []],
                    ['question' => 'Actions taken (document all)', 'type' => 'text', 'required' => true, 'options' => []],
                    ['question' => 'Field teams coordination status', 'type' => 'choice', 'required' => true, 'options' => ['Not Required', 'Coordinating', 'Dispatched', 'On Site']],
                ],
            ],
            [
                'title' => 'Pump Station Inspection',
                'frequency' => 'weekly',
                'schema' => [
                    ['question' => 'Check all pump operating indicators', 'type' => 'boolean', 'required' => true, 'options' => []],
                    ['question' => 'Inspect motor temperature readings', 'type' => 'boolean', 'required' => true, 'options' => []],
                    ['question' => 'Verify pressure gauge accuracy', 'type' => 'boolean', 'required' => true, 'options' => []],
                    ['question' => 'Check for oil/water leaks', 'type' => 'boolean', 'required' => true, 'options' => []],
                    ['question' => 'Overall pump condition rating (1-5)', 'type' => 'rating', 'required' => true, 'options' => []],
                    ['question' => 'Additional notes or concerns', 'type' => 'text', 'required' => false, 'options' => []],
                ],
            ],
            [
                'title' => 'Water Treatment Plant Daily Log',
                'frequency' => 'daily',
                'schema' => [
                    ['question' => 'Raw water turbidity (NTU)', 'type' => 'number', 'required' => true, 'options' => []],
                    ['question' => 'Treated water turbidity (NTU)', 'type' => 'number', 'required' => true, 'options' => []],
                    ['question' => 'pH level', 'type' => 'number', 'required' => true, 'options' => []],
                    ['question' => 'Chlorine dosing rate (mg/L)', 'type' => 'number', 'required' => true, 'options' => []],
                    ['question' => 'Chemical stock levels adequate', 'type' => 'boolean', 'required' => true, 'options' => []],
                    ['question' => 'Production volume (m³)', 'type' => 'number', 'required' => true, 'options' => []],
                ],
            ],
        ];

        foreach ($checklists as $checklistData) {
            Checklist::firstOrCreate(
                ['title' => $checklistData['title'], 'tenant_id' => $tenant->id],
                array_merge($checklistData, ['tenant_id' => $tenant->id])
            );
        }

        $this->command->info('Checklists created.');
    }

    protected function seedPlaybooks($tenant): void
    {
        $this->command->info('Creating playbooks...');

        $playbooks = [
            [
                'name' => 'High Pressure Alarm Response',
                'for_category' => 'pressure',
                'for_severity' => 'high',
                'steps' => [
                    ['order' => 1, 'action' => 'Verify alarm source and affected zone'],
                    ['order' => 2, 'action' => 'Check upstream pump station status'],
                    ['order' => 3, 'action' => 'Inspect PRV (Pressure Reducing Valve) operation'],
                    ['order' => 4, 'action' => 'If pressure >6 bar, partially close isolation valve'],
                    ['order' => 5, 'action' => 'Dispatch field team if manual intervention needed'],
                    ['order' => 6, 'action' => 'Monitor pressure for 15 minutes'],
                    ['order' => 7, 'action' => 'Document resolution and close event'],
                ],
            ],
            [
                'name' => 'Water Quality Alert Response',
                'for_category' => 'quality',
                'for_severity' => 'critical',
                'steps' => [
                    ['order' => 1, 'action' => 'Immediately notify water quality officer'],
                    ['order' => 2, 'action' => 'Review chlorine residual readings'],
                    ['order' => 3, 'action' => 'Check turbidity and pH levels'],
                    ['order' => 4, 'action' => 'If contamination suspected, isolate affected zone'],
                    ['order' => 5, 'action' => 'Issue boil water advisory if needed'],
                    ['order' => 6, 'action' => 'Collect samples for lab testing'],
                    ['order' => 7, 'action' => 'Increase chlorination if safe to do so'],
                    ['order' => 8, 'action' => 'Update all stakeholders hourly'],
                ],
            ],
            [
                'name' => 'Pump Failure Response',
                'for_category' => 'equipment',
                'for_severity' => 'high',
                'steps' => [
                    ['order' => 1, 'action' => 'Verify pump trip and confirm no manual shutdown'],
                    ['order' => 2, 'action' => 'Check electrical supply and circuit breakers'],
                    ['order' => 3, 'action' => 'Start standby pump if available'],
                    ['order' => 4, 'action' => 'Create high-priority work order for repair'],
                    ['order' => 5, 'action' => 'Monitor downstream pressure and reservoir levels'],
                    ['order' => 6, 'action' => 'Notify maintenance team for immediate response'],
                ],
            ],
            [
                'name' => 'DMA Night Flow Anomaly',
                'for_category' => 'nrw',
                'for_severity' => 'medium',
                'steps' => [
                    ['order' => 1, 'action' => 'Review night flow pattern vs baseline'],
                    ['order' => 2, 'action' => 'Check for meter reading errors'],
                    ['order' => 3, 'action' => 'Inspect for known customer activities (e.g., night irrigation)'],
                    ['order' => 4, 'action' => 'If >20% increase, flag for leak detection team'],
                    ['order' => 5, 'action' => 'Schedule acoustic survey if persistent'],
                    ['order' => 6, 'action' => 'Log anomaly in NRW tracking system'],
                ],
            ],
        ];

        foreach ($playbooks as $playbook) {
            Playbook::firstOrCreate(
                ['name' => $playbook['name'], 'tenant_id' => $tenant->id],
                array_merge($playbook, ['tenant_id' => $tenant->id])
            );
        }

        $this->command->info('Playbooks created.');
    }

    protected function seedEscalationPolicies($tenant): void
    {
        $this->command->info('Creating escalation policies...');

        $policies = [
            [
                'name' => 'Critical Event Escalation',
                'rules' => [
                    'for_severity' => 'critical',
                    'delay_minutes' => 15,
                    'notify_roles' => ['Manager', 'Admin'],
                    'notify_channels' => ['email', 'sms'],
                ],
            ],
            [
                'name' => 'High Priority Escalation',
                'rules' => [
                    'for_severity' => 'high',
                    'delay_minutes' => 60,
                    'notify_roles' => ['Manager'],
                    'notify_channels' => ['email'],
                ],
            ],
            [
                'name' => 'Medium Priority Escalation',
                'rules' => [
                    'for_severity' => 'medium',
                    'delay_minutes' => 240,
                    'notify_roles' => ['Manager'],
                    'notify_channels' => ['email'],
                ],
            ],
        ];

        foreach ($policies as $policy) {
            EscalationPolicy::firstOrCreate(
                ['name' => $policy['name'], 'tenant_id' => $tenant->id],
                array_merge($policy, ['tenant_id' => $tenant->id])
            );
        }

        $this->command->info('Escalation policies created.');
    }

    protected function seedShifts($tenant, $user): void
    {
        if (!$user) {
            $this->command->warn('No user found. Skipping shift seeding.');
            return;
        }

        $this->command->info('Creating shifts...');

        $activeShift = Shift::create([
            'tenant_id' => $tenant->id,
            'name' => 'Night Shift - Nov 9',
            'starts_at' => now()->subHours(3),
            'ends_at' => now()->addHours(5),
            'supervisor_id' => $user->id,
            'status' => 'active',
        ]);

        ShiftEntry::create([
            'shift_id' => $activeShift->id,
            'kind' => 'note',
            'title' => 'Shift Started',
            'body' => 'All systems operational. 3 active events under monitoring.',
            'created_by' => $user->id,
        ]);

        ShiftEntry::create([
            'shift_id' => $activeShift->id,
            'kind' => 'note',
            'title' => 'High Pressure Alarm',
            'body' => 'Acknowledged high pressure alarm at Westlands DMA. Activated playbook.',
            'created_by' => $user->id,
        ]);

        $pastShift = Shift::create([
            'tenant_id' => $tenant->id,
            'name' => 'Day Shift - Nov 8',
            'starts_at' => now()->subDay()->hour(6)->minute(0),
            'ends_at' => now()->subDay()->hour(18)->minute(0),
            'supervisor_id' => $user->id,
            'status' => 'closed',
        ]);

        ShiftEntry::create([
            'shift_id' => $pastShift->id,
            'kind' => 'handover',
            'title' => 'Shift Handover Report',
            'body' => 'Routine shift. Resolved 5 events. One pump scheduled for PM tomorrow.',
            'created_by' => $user->id,
        ]);

        $this->command->info('Shifts created.');
    }

    protected function seedEvents($tenant, $facility, $scheme, $user): void
    {
        $this->command->info('Creating events...');

        $events = [
            [
                'tenant_id' => $tenant->id,
                'source' => 'scada',
                'external_id' => 'SCADA-2024-001',
                'facility_id' => $facility?->id,
                'scheme_id' => $scheme?->id,
                'category' => 'pressure',
                'subcategory' => 'high',
                'severity' => 'high',
                'description' => 'High pressure detected in Westlands DMA - 6.8 bar',
                'status' => 'ack',
                'detected_at' => now()->subHours(2),
                'acknowledged_at' => now()->subHours(2)->addMinutes(5),
                'location' => $facility ? $facility->geom : new Point(-1.2921, 36.8219),
                'attributes' => ['reading' => 6.8, 'threshold' => 6.0, 'unit' => 'bar'],
            ],
            [
                'tenant_id' => $tenant->id,
                'source' => 'ami',
                'external_id' => 'AMI-2024-042',
                'scheme_id' => $scheme?->id,
                'category' => 'nrw',
                'subcategory' => 'night_flow',
                'severity' => 'medium',
                'description' => 'Abnormal night flow detected - 35% above baseline',
                'status' => 'new',
                'detected_at' => now()->subHour(),
                'location' => new Point(-1.2864, 36.8172),
                'attributes' => ['flow_rate' => 12.5, 'baseline' => 9.2, 'unit' => 'm3/h'],
            ],
            [
                'tenant_id' => $tenant->id,
                'source' => 'manual',
                'category' => 'quality',
                'subcategory' => 'chlorine',
                'severity' => 'low',
                'description' => 'Chlorine residual slightly below target - 0.4 mg/L',
                'status' => 'resolved',
                'detected_at' => now()->subHours(4),
                'acknowledged_at' => now()->subHours(4)->addMinutes(10),
                'resolved_at' => now()->subHours(3),
                'location' => new Point(-1.2833, 36.8250),
                'attributes' => ['reading' => 0.4, 'target' => 0.5, 'unit' => 'mg/L'],
            ],
            [
                'tenant_id' => $tenant->id,
                'source' => 'scada',
                'external_id' => 'SCADA-2024-002',
                'facility_id' => $facility?->id,
                'category' => 'equipment',
                'subcategory' => 'pump',
                'severity' => 'critical',
                'description' => 'Primary pump trip at Kariobangi station',
                'status' => 'in_progress',
                'detected_at' => now()->subMinutes(30),
                'acknowledged_at' => now()->subMinutes(28),
                'location' => $facility ? $facility->geom : new Point(-1.2587, 36.8563),
                'attributes' => ['pump_id' => 'PMP-003', 'cause' => 'overcurrent'],
            ],
            [
                'tenant_id' => $tenant->id,
                'source' => 'energy',
                'category' => 'energy',
                'subcategory' => 'consumption',
                'severity' => 'low',
                'description' => 'Energy consumption 15% above forecast',
                'status' => 'new',
                'detected_at' => now()->subMinutes(45),
                'location' => new Point(-1.2700, 36.8400),
                'attributes' => ['consumption' => 234.5, 'forecast' => 204.0, 'unit' => 'kWh'],
            ],
        ];

        foreach ($events as $eventData) {
            $uniqueKeys = ['tenant_id' => $eventData['tenant_id'], 'source' => $eventData['source']];
            if (isset($eventData['external_id'])) {
                $uniqueKeys['external_id'] = $eventData['external_id'];
            }
            $event = Event::firstOrCreate($uniqueKeys, $eventData);
            
            EventAction::firstOrCreate([
                'event_id' => $event->id,
                'action' => 'created',
            ], [
                'actor_id' => $user?->id,
                'occurred_at' => $event->detected_at,
            ]);

            if ($event->acknowledged_at) {
                EventAction::firstOrCreate([
                    'event_id' => $event->id,
                    'action' => 'acknowledged',
                ], [
                    'actor_id' => $user?->id,
                    'payload' => ['note' => 'Investigating issue'],
                    'occurred_at' => $event->acknowledged_at,
                ]);
            }

            if ($event->resolved_at) {
                EventAction::firstOrCreate([
                    'event_id' => $event->id,
                    'action' => 'resolved',
                ], [
                    'actor_id' => $user?->id,
                    'payload' => ['resolution' => 'Increased chlorination rate'],
                    'occurred_at' => $event->resolved_at,
                ]);
            }
        }

        $this->command->info('Events created with action history.');
    }
}
