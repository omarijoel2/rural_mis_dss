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
            'criteria_id' => 'required|exists:scoring_criteria,id',
            'score' => 'required|numeric|min:0|max:100',
            'notes' => 'nullable|string',
        ];
    }
}
