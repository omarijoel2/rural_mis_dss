<?php

namespace App\Http\Controllers\Api\V1\Operations;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\Operations\EventService;
use Illuminate\Http\Request;

class EventController extends Controller
{
    protected $eventService;

    public function __construct(EventService $eventService)
    {
        $this->eventService = $eventService;
    }

    /**
     * List events with filters
     */
    public function index(Request $request)
    {
        $query = Event::with(['facility', 'scheme', 'dma', 'links', 'actions']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->has('source')) {
            $query->where('source', $request->source);
        }

        if ($request->has('category')) {
            $query->where('category', 'like', "%{$request->category}%");
        }

        if ($request->has('facility_id')) {
            $query->where('facility_id', $request->facility_id);
        }

        // Bbox spatial filter
        if ($request->has('bbox')) {
            $bbox = explode(',', $request->bbox);
            if (count($bbox) === 4) {
                $query->whereRaw("ST_Within(location, ST_MakeEnvelope(?, ?, ?, ?, 4326))", $bbox);
            }
        }

        $events = $query->orderBy('detected_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($events);
    }

    /**
     * Ingest event from external source
     */
    public function ingest(Request $request)
    {
        $validated = $request->validate([
            'source' => 'required|in:scada,ami,nrw,energy,manual,webhook',
            'external_id' => 'nullable|string',
            'facility_id' => 'nullable|uuid',
            'scheme_id' => 'nullable|uuid',
            'dma_id' => 'nullable|uuid',
            'category' => 'required|string',
            'subcategory' => 'nullable|string',
            'severity' => 'required|in:low,medium,high,critical',
            'description' => 'nullable|string',
            'attributes' => 'nullable|array',
            'detected_at' => 'nullable|date',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;
        
        $event = $this->eventService->ingestEvent($validated);

        return response()->json($event, $event->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Get single event
     */
    public function show(Event $event)
    {
        $event->load(['facility', 'scheme', 'dma', 'links', 'actions.actor']);
        return response()->json($event);
    }

    /**
     * Acknowledge event
     */
    public function acknowledge(Request $request, Event $event)
    {
        $event = $this->eventService->acknowledgeEvent($event->id, $request->input('note'));
        return response()->json($event);
    }

    /**
     * Resolve event
     */
    public function resolve(Request $request, Event $event)
    {
        $event = $this->eventService->resolveEvent($event->id, $request->input('resolution'));
        return response()->json($event);
    }

    /**
     * Link event to entity
     */
    public function link(Request $request, Event $event)
    {
        $validated = $request->validate([
            'entity_type' => 'required|string',
            'entity_id' => 'required|integer',
        ]);

        $this->eventService->linkEvent($event->id, $validated['entity_type'], $validated['entity_id']);
        
        return response()->json(['message' => 'Event linked successfully']);
    }
}
