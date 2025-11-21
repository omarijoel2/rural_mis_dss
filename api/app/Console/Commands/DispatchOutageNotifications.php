<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Outage;
use App\Notifications\OutageApprovedNotification;
use App\Notifications\OutageLiveNotification;
use App\Notifications\OutageRestoredNotification;
use Illuminate\Support\Facades\Notification;
use Carbon\Carbon;

class DispatchOutageNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'core-ops:dispatch-outage-notifications {--check-interval=5}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatch outage notifications based on schedule (every 5 minutes)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for outage notifications to dispatch...');
        
        $now = Carbon::now();
        $checkInterval = (int) $this->option('check-interval');
        $windowStart = $now->copy()->subMinutes($checkInterval);
        
        $notificationsSent = 0;

        // 1. Check for newly approved outages that need advance notification
        $approvedOutages = Outage::where('state', 'approved')
            ->where('notified_at', null)
            ->where('starts_at', '>', $now)
            ->where('starts_at', '<=', $now->copy()->addHours(24))
            ->get();

        foreach ($approvedOutages as $outage) {
            try {
                $this->dispatchApprovalNotification($outage);
                
                $outage->update(['notified_at' => $now]);
                
                $this->line("  ✓ Approval notification sent for outage #{$outage->id}");
                $notificationsSent++;
                
            } catch (\Exception $e) {
                $this->error("  ✗ Failed to send approval notification: {$e->getMessage()}");
            }
        }

        // 2. Check for outages that should transition to 'live' state
        $goingLive = Outage::where('state', 'approved')
            ->where('starts_at', '<=', $now)
            ->where('starts_at', '>', $windowStart)
            ->get();

        foreach ($goingLive as $outage) {
            try {
                $outage->update(['state' => 'live']);
                
                $this->dispatchLiveNotification($outage);
                
                $this->line("  ✓ Live notification sent for outage #{$outage->id}");
                $notificationsSent++;
                
            } catch (\Exception $e) {
                $this->error("  ✗ Failed to send live notification: {$e->getMessage()}");
            }
        }

        // 3. Check for outages that should be marked as 'restored'
        $restored = Outage::where('state', 'live')
            ->where('ends_at', '<=', $now)
            ->where('ends_at', '>', $windowStart)
            ->get();

        foreach ($restored as $outage) {
            try {
                $outage->update(['state' => 'restored']);
                
                $this->dispatchRestoredNotification($outage);
                
                $this->line("  ✓ Restoration notification sent for outage #{$outage->id}");
                $notificationsSent++;
                
            } catch (\Exception $e) {
                $this->error("  ✗ Failed to send restoration notification: {$e->getMessage()}");
            }
        }

        // 4. Send reminder notifications for long-running outages
        $longRunning = Outage::where('state', 'live')
            ->where('starts_at', '<=', $now->copy()->subHours(6))
            ->whereNull('last_reminder_at')
            ->orWhere('last_reminder_at', '<=', $now->copy()->subHours(6))
            ->get();

        foreach ($longRunning as $outage) {
            try {
                $this->dispatchReminderNotification($outage);
                
                $outage->update(['last_reminder_at' => $now]);
                
                $this->line("  ✓ Reminder notification sent for outage #{$outage->id}");
                $notificationsSent++;
                
            } catch (\Exception $e) {
                $this->error("  ✗ Failed to send reminder notification: {$e->getMessage()}");
            }
        }

        if ($notificationsSent === 0) {
            $this->info('No outage notifications to send at this time.');
        } else {
            $this->info("Completed! Sent {$notificationsSent} notifications.");
        }
        
        return Command::SUCCESS;
    }

    /**
     * Dispatch approval notification to affected customers
     */
    private function dispatchApprovalNotification(Outage $outage): void
    {
        // Get affected customers from the scheme/DMA
        $affectedCustomers = $this->getAffectedCustomers($outage);
        
        if ($affectedCustomers->isEmpty()) {
            return;
        }

        // Dispatch via multiple channels (SMS, Email, Push)
        Notification::send(
            $affectedCustomers,
            new OutageApprovedNotification($outage)
        );

        // Log notification dispatch
        \Log::info("Outage approval notification dispatched", [
            'outage_id' => $outage->id,
            'customers_notified' => $affectedCustomers->count(),
        ]);
    }

    /**
     * Dispatch live notification (outage has started)
     */
    private function dispatchLiveNotification(Outage $outage): void
    {
        $affectedCustomers = $this->getAffectedCustomers($outage);
        
        if ($affectedCustomers->isEmpty()) {
            return;
        }

        Notification::send(
            $affectedCustomers,
            new OutageLiveNotification($outage)
        );

        \Log::info("Outage live notification dispatched", [
            'outage_id' => $outage->id,
            'customers_notified' => $affectedCustomers->count(),
        ]);
    }

    /**
     * Dispatch restoration notification (service restored)
     */
    private function dispatchRestoredNotification(Outage $outage): void
    {
        $affectedCustomers = $this->getAffectedCustomers($outage);
        
        if ($affectedCustomers->isEmpty()) {
            return;
        }

        Notification::send(
            $affectedCustomers,
            new OutageRestoredNotification($outage)
        );

        \Log::info("Outage restoration notification dispatched", [
            'outage_id' => $outage->id,
            'customers_notified' => $affectedCustomers->count(),
        ]);
    }

    /**
     * Dispatch reminder notification for long-running outages
     */
    private function dispatchReminderNotification(Outage $outage): void
    {
        $affectedCustomers = $this->getAffectedCustomers($outage);
        
        if ($affectedCustomers->isEmpty()) {
            return;
        }

        $durationHours = Carbon::parse($outage->starts_at)->diffInHours(Carbon::now());

        Notification::send(
            $affectedCustomers,
            new OutageLiveNotification($outage, [
                'is_reminder' => true,
                'duration_hours' => $durationHours,
            ])
        );

        \Log::info("Outage reminder notification dispatched", [
            'outage_id' => $outage->id,
            'duration_hours' => $durationHours,
            'customers_notified' => $affectedCustomers->count(),
        ]);
    }

    /**
     * Get customers affected by an outage
     */
    private function getAffectedCustomers(Outage $outage): \Illuminate\Support\Collection
    {
        // If outage is scheme-wide
        if ($outage->scheme_id && !$outage->dma_id) {
            return \App\Models\Account::whereHas('premise', function ($query) use ($outage) {
                $query->whereHas('dma', function ($q) use ($outage) {
                    $q->where('scheme_id', $outage->scheme_id);
                });
            })
            ->where('status', 'active')
            ->get();
        }

        // If outage is DMA-specific
        if ($outage->dma_id) {
            return \App\Models\Account::whereHas('premise', function ($query) use ($outage) {
                $query->where('dma_id', $outage->dma_id);
            })
            ->where('status', 'active')
            ->get();
        }

        return collect();
    }
}
