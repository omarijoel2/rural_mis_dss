<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Services\Crm\DunningService;
use App\Services\Crm\PaymentService;
use Illuminate\Http\Request;

class DunningController extends Controller
{
    public function __construct(
        private DunningService $dunningService,
        private PaymentService $paymentService
    ) {
    }

    public function agingReport()
    {
        $report = $this->dunningService->getAgingReport(auth()->user());
        return response()->json($report);
    }

    public function disconnectionList()
    {
        $accounts = $this->dunningService->getAccountsForDisconnection(auth()->user());
        return response()->json($accounts);
    }

    public function generateNotices(Request $request)
    {
        $request->validate(['aging_bucket' => 'required|in:30_days,60_days,90_days,over_90']);
        
        $notices = $this->dunningService->generateDunningNotices($request->aging_bucket, auth()->user());
        return response()->json($notices);
    }

    public function markForDisconnection(Request $request)
    {
        $request->validate([
            'account_no' => 'required|string',
            'reason' => 'required|string',
        ]);

        $result = $this->dunningService->markForDisconnection(
            $request->account_no,
            $request->reason,
            auth()->user()
        );

        return response()->json(['success' => $result]);
    }

    public function disconnect(Request $request)
    {
        $request->validate(['account_no' => 'required|string']);
        
        $result = $this->dunningService->disconnectAccount($request->account_no, auth()->user());
        return response()->json(['success' => $result]);
    }

    public function reconnect(Request $request)
    {
        $request->validate(['account_no' => 'required|string']);
        
        $result = $this->dunningService->reconnectAccount($request->account_no, auth()->user());
        return response()->json(['success' => $result]);
    }

    public function paymentHistory(string $accountNo, Request $request)
    {
        $months = $request->get('months', 12);
        $payments = $this->paymentService->getPaymentHistory($accountNo, $months, auth()->user());
        return response()->json($payments);
    }
}
