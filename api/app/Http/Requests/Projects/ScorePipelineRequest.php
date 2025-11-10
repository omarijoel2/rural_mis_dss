<?php

namespace App\Http\Requests\Projects;

use Illuminate\Foundation\Http\FormRequest;

class ScorePipelineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'criterion_id' => 'required|exists:investment_criteria,id',
            'raw_score' => 'required|numeric|min:0|max:100',
            'weighted_score' => 'required|numeric|min:0|max:100',
            'rationale' => 'nullable|string',
        ];
    }
}
