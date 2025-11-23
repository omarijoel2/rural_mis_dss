<?php
namespace App\Services\Workflows;

use App\Models\Workflow\WorkflowDefinition;

/**
 * Compiles workflow specs into executable state machines
 */
class WfCompiler
{
    public function compile(array $spec): array
    {
        $states = [];
        foreach ($spec['states'] ?? [] as $stateConfig) {
            $states[$stateConfig['name']] = [
                'on_enter' => $stateConfig['on_enter'] ?? [],
                'on_exit' => $stateConfig['on_exit'] ?? [],
                'transitions' => [],
            ];
            foreach ($stateConfig['transitions'] ?? [] as $trans) {
                $states[$stateConfig['name']]['transitions'][] = [
                    'to' => $trans['to'],
                    'trigger' => $trans['trigger'],
                    'guard' => $trans['guard'] ?? null,
                ];
            }
        }
        return $states;
    }

    public function validate(array $spec): bool
    {
        if (!isset($spec['key']) || !isset($spec['states'])) {
            return false;
        }
        return true;
    }
}
