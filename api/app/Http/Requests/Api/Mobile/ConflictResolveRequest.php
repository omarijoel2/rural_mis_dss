<?php

namespace App\Http\Requests\Api\Mobile;

use Illuminate\Foundation\Http\FormRequest;

class ConflictResolveRequest extends FormRequest
{
    public function authorize()
    {
        return true; // add RBAC checks in controller or via middleware
    }

    public function rules()
    {
        return [
            'resolution' => 'required|in:accept_server,accept_client,manual',
            'merged_payload' => 'nullable|array',
            'notes' => 'nullable|string',
        ];
    }
}
