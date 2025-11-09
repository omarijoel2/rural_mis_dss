<?php

namespace App\Jobs\Crm;

use App\Models\CrmPaymentPlan;
use App\Models\User;
use App\Services\Crm\PaymentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ApplyPaymentPlansJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private int $tenantId,
        private int $userId
    ) {
    }

    public function handle(PaymentService $paymentService): void
    {
        Log::info("Applying payment plans for tenant {$this->tenantId}");

        $user = User::where('id', $this->userId)
            ->whereHas('tenant', function ($q) {
                $q->where('id', $this->tenantId);
            })
            ->firstOrFail();

        try {
            $activePlans = CrmPaymentPlan::where('tenant_id', $this->tenantId)
                ->where('status', 'active')
                ->where('next_payment_date', '<=', Carbon::now())
                ->with('connection')
                ->get();

            $processed = 0;
            foreach ($activePlans as $plan) {
                if ($plan->installments_paid < $plan->total_installments) {
                    try {
                        $paymentService->recordPayment([
                            'account_no' => $plan->connection->account_no,
                            'amount' => $plan->installment_amount,
                            'channel' => 'payment_plan',
                            'reference' => "PLAN-{$plan->id}-" . ($plan->installments_paid + 1),
                            'paid_at' => now()->toDateTimeString(),
                        ], $user);

                        $plan->increment('installments_paid');
                        $nextDate = Carbon::parse($plan->next_payment_date)->addMonth();
                        $plan->update(['next_payment_date' => $nextDate]);
                        $processed++;

                        Log::debug("Payment plan {$plan->id}: installment {$plan->installments_paid}/{$plan->total_installments} paid and applied");
                    } catch (\Exception $e) {
                        Log::error("Failed to apply installment for plan {$plan->id}: " . $e->getMessage());
                        continue;
                    }
                }

                if ($plan->installments_paid >= $plan->total_installments) {
                    $plan->update(['status' => 'completed']);
                    Log::info("Payment plan {$plan->id} completed");
                }
            }

            Log::info("Payment plans applied: {$processed} plans processed");
        } catch (\Exception $e) {
            Log::error("Apply payment plans failed for tenant {$this->tenantId}: " . $e->getMessage());
            throw $e;
        }
    }
}
