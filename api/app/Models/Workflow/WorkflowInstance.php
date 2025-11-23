<?php
namespace App\Models\Workflow;

use Illuminate\Database\Eloquent\Model;

class WorkflowInstance extends Model
{
    protected $table = 'wf_instances';
    protected $casts = ['context' => 'json'];
    public $timestamps = false;
}
