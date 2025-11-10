<?php

namespace App\Http\Requests\Projects;

use Illuminate\Foundation\Http\FormRequest;

class CreateAppraisalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'costs' => 'required|array',
            'benefits' => 'required|array',
            'discount_rate' => 'required|numeric|min:0|max:100',
            'project_life' => 'required|integer|min:1|max:100',
        ];
    }
}
