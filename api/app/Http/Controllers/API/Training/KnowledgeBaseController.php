<?php

namespace App\Http\Controllers\Api\Training;

use App\Http\Controllers\Controller;
use App\Models\KbArticle;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KnowledgeBaseController extends Controller
{
    public function index(Request $request)
    {
        $query = KbArticle::with(['author', 'approver'])->published();

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        if ($request->filled('search')) {
            $query->whereFullText(['title', 'content'], $request->search);
        }

        if ($request->filled('tags')) {
            $tags = is_array($request->tags) ? $request->tags : [$request->tags];
            $query->where(function ($q) use ($tags) {
                foreach ($tags as $tag) {
                    $q->orWhereJsonContains('tags', $tag);
                }
            });
        }

        $articles = $query->orderBy('published_at', 'desc')->paginate(20);

        return response()->json($articles);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', Rule::in(['Assets', 'Treatment', 'Safety', 'Customer', 'Finance', 'IT'])],
            'tags' => ['nullable', 'array'],
            'content' => ['required', 'string'],
            'attachments' => ['nullable', 'array'],
        ]);

        $validated['tenant_id'] = auth()->user()->current_tenant_id;
        $validated['author_id'] = auth()->id();
        $validated['status'] = 'draft';
        $validated['version'] = 1;

        $article = KbArticle::create($validated);

        return response()->json($article->load(['author']), 201);
    }

    public function show(KbArticle $kbArticle)
    {
        $kbArticle->incrementViews();

        return response()->json($kbArticle->load(['author', 'approver']));
    }

    public function update(Request $request, KbArticle $kbArticle)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'string', Rule::in(['Assets', 'Treatment', 'Safety', 'Customer', 'Finance', 'IT'])],
            'tags' => ['nullable', 'array'],
            'content' => ['sometimes', 'string'],
            'attachments' => ['nullable', 'array'],
            'status' => ['sometimes', 'string', Rule::in(['draft', 'review', 'published'])],
        ]);

        if (isset($validated['content']) && $validated['content'] !== $kbArticle->content) {
            $validated['version'] = $kbArticle->version + 1;
        }

        $kbArticle->update($validated);

        return response()->json($kbArticle->load(['author', 'approver']));
    }

    public function destroy(KbArticle $kbArticle)
    {
        $kbArticle->delete();

        return response()->json(['message' => 'Article deleted successfully']);
    }

    public function publish(KbArticle $kbArticle)
    {
        $kbArticle->update([
            'status' => 'published',
            'published_at' => now(),
            'approver_id' => auth()->id(),
        ]);

        return response()->json($kbArticle);
    }

    public function markHelpful(KbArticle $kbArticle)
    {
        $kbArticle->markHelpful();

        return response()->json(['message' => 'Feedback recorded']);
    }

    public function markNotHelpful(KbArticle $kbArticle)
    {
        $kbArticle->markNotHelpful();

        return response()->json(['message' => 'Feedback recorded']);
    }

    public function categories()
    {
        $categories = KbArticle::published()
            ->select('category')
            ->distinct()
            ->pluck('category');

        return response()->json($categories);
    }

    public function popularArticles()
    {
        $articles = KbArticle::published()
            ->orderBy('views_count', 'desc')
            ->limit(10)
            ->get();

        return response()->json($articles);
    }
}
