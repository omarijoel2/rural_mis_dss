<?php
namespace App\Models\Workflow;

use Illuminate\Database\Eloquent\Model;

class WorkflowTransition extends Model
{
    protected $table = 'wf_transitions';
    protected $casts = ['payload' => 'json'];
    public $timestamps = false;
}
