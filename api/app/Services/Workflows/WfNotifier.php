<?php
namespace App\Services\Workflows;

use App\Models\Workflow\WorkflowInstance;

/**
 * Sends notifications from workflow state transitions
 */
class WfNotifier
{
    public function notifyRequester(WorkflowInstance $instance): void
    {
        // Integration with NotificationService
    }

    public function notifyAssignee(WorkflowInstance $instance): void
    {
        // Integration with NotificationService
    }
}
