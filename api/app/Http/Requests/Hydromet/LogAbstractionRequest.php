<?php

namespace App\Http\Requests\Hydromet;

use Illuminate\Foundation\Http\FormRequest;

class LogAbstractionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'scheme_id' => 'nullable|uuid|exists:schemes,id',
            'logged_at' => 'required|date',
            'volume_m3' => 'required|numeric|min:0|max:1000000',
            'method' => 'required|string|max:20',
            'quality' => 'required|string|max:20',
            'logged_by' => 'nullable|uuid|exists:users,id',
            'meta' => 'nullable|array',
        ];
    }
}
