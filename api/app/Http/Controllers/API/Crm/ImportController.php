<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Services\Crm\BillingImportService;
use App\Services\Crm\MpesaImportService;
use Illuminate\Http\Request;

class ImportController extends Controller
{
    public function __construct(
        private BillingImportService $billingImportService,
        private MpesaImportService $mpesaImportService
    ) {
    }

    public function importBilling(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        $file = $request->file('file');
        $result = $this->billingImportService->importBillingCsv($file->getRealPath(), auth()->user());

        return response()->json($result);
    }

    public function importMpesa(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        $file = $request->file('file');
        $result = $this->mpesaImportService->importMpesaCsv($file->getRealPath(), auth()->user());

        return response()->json($result);
    }
}
