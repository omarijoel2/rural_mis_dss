<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmNote;
use App\Models\CrmCustomer;
use App\Models\CrmServiceConnection;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class NoteController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = auth()->user()->currentTenantId();
        $query = CrmNote::where('tenant_id', $tenantId);

        if ($request->has('account_no')) {
            $query->where('account_no', $request->account_no);
        }

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        $notes = $query->orderBy('created_at', 'desc')
            ->with(['customer', 'createdBy'])
            ->paginate($request->get('per_page', 15));

        return response()->json($notes);
    }

    public function store(Request $request)
    {
        $tenantId = auth()->user()->currentTenantId();

        $request->validate([
            'customer_id' => 'nullable|integer',
            'account_no' => 'nullable|string',
            'content' => 'required|string',
        ]);

        if ($request->filled('customer_id')) {
            $customer = CrmCustomer::where('tenant_id', $tenantId)
                ->where('id', $request->customer_id)
                ->first();

            if (!$customer) {
                throw ValidationException::withMessages([
                    'customer_id' => ['The selected customer does not exist or does not belong to your organization.']
                ]);
            }
        }

        if ($request->filled('account_no')) {
            $connection = CrmServiceConnection::where('account_no', $request->account_no)->first();

            if (!$connection) {
                throw ValidationException::withMessages([
                    'account_no' => ['The selected account does not exist.']
                ]);
            }
        }

        $note = CrmNote::create([
            'tenant_id' => $tenantId,
            'customer_id' => $request->customer_id,
            'account_no' => $request->account_no,
            'content' => $request->content,
            'created_by' => auth()->id(),
        ]);

        $note->load(['customer', 'createdBy']);

        activity()
            ->performedOn($note)
            ->causedBy(auth()->user())
            ->withProperties(['content_preview' => substr($request->content, 0, 100)])
            ->log('Note created');

        return response()->json($note, 201);
    }

    public function show(int $id)
    {
        $note = CrmNote::where('tenant_id', auth()->user()->currentTenantId())
            ->with(['customer', 'createdBy'])
            ->findOrFail($id);

        return response()->json($note);
    }

    public function update(Request $request, int $id)
    {
        $tenantId = auth()->user()->currentTenantId();
        
        $note = CrmNote::where('tenant_id', $tenantId)
            ->findOrFail($id);

        if ($note->created_by !== auth()->id()) {
            return response()->json(['message' => 'You can only edit your own notes.'], 403);
        }

        $request->validate([
            'content' => 'required|string',
        ]);

        $note->update([
            'content' => $request->content,
        ]);

        $note->load(['customer', 'createdBy']);

        activity()
            ->performedOn($note)
            ->causedBy(auth()->user())
            ->withProperties(['content_preview' => substr($request->content, 0, 100)])
            ->log('Note updated');

        return response()->json($note);
    }

    public function destroy(int $id)
    {
        $tenantId = auth()->user()->currentTenantId();
        
        $note = CrmNote::where('tenant_id', $tenantId)
            ->findOrFail($id);

        if ($note->created_by !== auth()->id()) {
            return response()->json(['message' => 'You can only delete your own notes.'], 403);
        }

        activity()
            ->performedOn($note)
            ->causedBy(auth()->user())
            ->withProperties(['content_preview' => substr($note->content, 0, 100)])
            ->log('Note deleted');

        $note->delete();

        return response()->json(['message' => 'Note deleted successfully'], 204);
    }
}
