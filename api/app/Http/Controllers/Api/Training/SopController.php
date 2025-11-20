<?php

namespace App\Http\Controllers\Api\Training;

use App\Http\Controllers\Controller;
use App\Models\Sop;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class SopController extends Controller
{
    public function index(Request $request)
    {
        $query = Sop::with(['approver']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            $query->published();
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
            });
        }

        $sops = $query->orderBy('code')->paginate(20);

        return response()->json($sops);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'metadata' => ['nullable', 'array'],
            'content' => ['required', 'array'],
        ]);

        $validated['tenant_id'] = auth()->user()->current_tenant_id;
        $validated['code'] = 'SOP-' . strtoupper(Str::random(6));
        $validated['status'] = 'draft';
        $validated['version'] = 1;

        $sop = Sop::create($validated);

        return response()->json($sop, 201);
    }

    public function show(Sop $sop)
    {
        return response()->json($sop->load(['approver']));
    }

    public function update(Request $request, Sop $sop)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'string', 'max:100'],
            'metadata' => ['nullable', 'array'],
            'content' => ['sometimes', 'array'],
            'status' => ['sometimes', 'string', Rule::in(['draft', 'review', 'published', 'archived'])],
            'next_review_due' => ['nullable', 'date'],
        ]);

        if (isset($validated['content']) && $validated['content'] !== $sop->content) {
            $validated['version'] = $sop->version + 1;
        }

        $sop->update($validated);

        return response()->json($sop);
    }

    public function destroy(Sop $sop)
    {
        $sop->delete();

        return response()->json(['message' => 'SOP deleted successfully']);
    }

    public function publish(Sop $sop)
    {
        $sop->update([
            'status' => 'published',
            'published_at' => now(),
            'approver_id' => auth()->id(),
            'next_review_due' => now()->addYear(),
        ]);

        return response()->json($sop);
    }

    public function attest(Sop $sop)
    {
        $sop->addAttestation(auth()->id());

        return response()->json(['message' => 'Attestation recorded']);
    }

    public function dueForReview()
    {
        $sops = Sop::dueForReview()
            ->with('approver')
            ->orderBy('next_review_due')
            ->get();

        return response()->json($sops);
    }
}
