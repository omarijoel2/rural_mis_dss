<?php
namespace App\Services\Workflows;

use App\Models\Workflow\WorkflowInstance;
use App\Models\Workflow\WorkflowTransition;
use App\Models\Workflow\WorkflowDefinition;

/**
 * Executes workflow state transitions and side effects
 */
class WfRuntime
{
    public function __construct(
        protected WfCompiler $compiler,
        protected WfNotifier $notifier,
    ) {}

    public function trigger(WorkflowInstance $instance, string $trigger, array $payload = [], ?string $actorId = null): bool
    {
        $def = WorkflowDefinition::find($instance->def_id);
        $spec = $this->compiler->compile($def->spec);
        $currentState = $spec[$instance->state] ?? null;

        if (!$currentState) {
            return false;
        }

        // Find matching transition
        $transition = null;
        foreach ($currentState['transitions'] as $t) {
            if ($t['trigger'] === $trigger) {
                $transition = $t;
                break;
            }
        }

        if (!$transition) {
            return false;
        }

        // Execute on_exit actions
        $this->executeActions($instance, $currentState['on_exit'], $payload);

        // Record transition
        WorkflowTransition::create([
            'instance_id' => $instance->id,
            'from_state' => $instance->state,
            'to_state' => $transition['to'],
            'trigger' => $trigger,
            'actor_id' => $actorId,
            'payload' => $payload,
        ]);

        // Update instance state
        $instance->update([
            'state' => $transition['to'],
            'updated_at' => now(),
        ]);

        // Execute on_enter actions
        $newState = $spec[$transition['to']] ?? null;
        if ($newState) {
            $this->executeActions($instance, $newState['on_enter'], $payload);
        }

        return true;
    }

    protected function executeActions(WorkflowInstance $instance, array $actions, array $payload = []): void
    {
        foreach ($actions as $action) {
            if (is_string($action)) {
                [$type, $args] = $this->parseAction($action);
                $this->executeAction($type, $args, $instance, $payload);
            }
        }
    }

    protected function parseAction(string $action): array
    {
        if (str_contains($action, '(')) {
            preg_match('/(\w+)\.(\w+)\((.*)\)/', $action, $matches);
            return [$matches[1] . '.' . $matches[2], $matches[3] ?? ''];
        }
        return [$action, ''];
    }

    protected function executeAction(string $type, string $args, WorkflowInstance $instance, array $payload): void
    {
        match($type) {
            'notify.requester' => $this->notifier->notifyRequester($instance),
            'notify.assignee' => $this->notifier->notifyAssignee($instance),
            default => null,
        };
    }
}
