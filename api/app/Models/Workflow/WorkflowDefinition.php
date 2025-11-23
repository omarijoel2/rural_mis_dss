<?php
namespace App\Models\Workflow;

use Illuminate\Database\Eloquent\Model;

class WorkflowDefinition extends Model
{
    protected $table = 'wf_definitions';
    protected $casts = [
        'spec' => 'json',
        'active' => 'boolean',
    ];
    public $timestamps = false;
}
