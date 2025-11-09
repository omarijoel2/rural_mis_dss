<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Services\Crm\Account360Service;
use Illuminate\Http\Request;

class Account360Controller extends Controller
{
    public function __construct(private Account360Service $account360Service)
    {
    }

    public function overview(string $accountNo)
    {
        $overview = $this->account360Service->getAccountOverview($accountNo, auth()->user());
        return response()->json($overview);
    }

    public function billingHistory(string $accountNo, Request $request)
    {
        $months = $request->get('months', 12);
        $history = $this->account360Service->getBillingHistory($accountNo, $months, auth()->user());
        return response()->json($history);
    }

    public function consumptionAnalytics(string $accountNo, Request $request)
    {
        $months = $request->get('months', 12);
        $analytics = $this->account360Service->getConsumptionAnalytics($accountNo, $months, auth()->user());
        return response()->json($analytics);
    }
}
