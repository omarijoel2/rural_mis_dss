<?php

namespace App\Services;

use App\Models\Part;
use App\Models\StockTxn;
use App\Models\Supplier;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function receiveStock(string $partId, float $qty, float $unitCost, ?string $supplierRef = null): StockTxn
    {
        return StockTxn::create([
            'part_id' => $partId,
            'kind' => 'receipt',
            'qty' => $qty,
            'unit_cost' => $unitCost,
            'ref' => $supplierRef,
            'occurred_at' => now()
        ]);
    }

    public function issueStock(string $partId, float $qty, ?string $workOrderId = null): array
    {
        $part = Part::findOrFail($partId);
        $currentStock = $this->getCurrentStock($partId);
        
        if ($currentStock < $qty) {
            return [
                'success' => false,
                'error' => 'Insufficient stock',
                'available' => $currentStock,
                'requested' => $qty
            ];
        }
        
        $fifoCalculation = $this->calculateFifoCost($partId, $qty);
        
        $txn = StockTxn::create([
            'part_id' => $partId,
            'kind' => 'issue',
            'qty' => -$qty,
            'unit_cost' => $fifoCalculation['avg_cost'],
            'ref' => $workOrderId ? "WO-{$workOrderId}" : null,
            'work_order_id' => $workOrderId,
            'occurred_at' => now()
        ]);
        
        return [
            'success' => true,
            'transaction' => $txn,
            'cost_breakdown' => $fifoCalculation
        ];
    }

    public function adjustStock(string $partId, float $qty, string $reason): StockTxn
    {
        return StockTxn::create([
            'part_id' => $partId,
            'kind' => 'adjustment',
            'qty' => $qty,
            'unit_cost' => 0,
            'ref' => $reason,
            'occurred_at' => now()
        ]);
    }

    public function getCurrentStock(string $partId): float
    {
        return StockTxn::where('part_id', $partId)
            ->sum('qty');
    }

    public function getStockValue(string $partId): array
    {
        $currentStock = $this->getCurrentStock($partId);
        
        if ($currentStock <= 0) {
            return [
                'part_id' => $partId,
                'qty' => 0,
                'value' => 0,
                'avg_cost' => 0
            ];
        }
        
        $receipts = StockTxn::where('part_id', $partId)
            ->where('kind', 'receipt')
            ->where('qty', '>', 0)
            ->orderBy('occurred_at')
            ->get();
        
        $issues = StockTxn::where('part_id', $partId)
            ->where('kind', 'issue')
            ->sum('qty');
        
        $remainingQty = $currentStock;
        $totalValue = 0;
        
        foreach ($receipts as $receipt) {
            if ($remainingQty <= 0) break;
            
            $qtyFromThisReceipt = min($receipt->qty, $remainingQty);
            $totalValue += $qtyFromThisReceipt * $receipt->unit_cost;
            $remainingQty -= $qtyFromThisReceipt;
        }
        
        $avgCost = $currentStock > 0 ? $totalValue / $currentStock : 0;
        
        return [
            'part_id' => $partId,
            'qty' => $currentStock,
            'value' => round($totalValue, 2),
            'avg_cost' => round($avgCost, 2)
        ];
    }

    public function calculateFifoCost(string $partId, float $qtyToIssue): array
    {
        $receipts = StockTxn::where('part_id', $partId)
            ->where('kind', 'receipt')
            ->where('qty', '>', 0)
            ->orderBy('occurred_at')
            ->get();
        
        $issued = abs(StockTxn::where('part_id', $partId)
            ->where('kind', 'issue')
            ->sum('qty'));
        
        $remainingToAllocate = $qtyToIssue;
        $totalCost = 0;
        $allocations = [];
        
        foreach ($receipts as $receipt) {
            if ($remainingToAllocate <= 0) break;
            
            $receiptRemaining = $receipt->qty;
            
            $previousIssues = StockTxn::where('part_id', $partId)
                ->where('kind', 'issue')
                ->where('occurred_at', '<', $receipt->occurred_at)
                ->sum('qty');
            
            if ($previousIssues > 0) {
                continue;
            }
            
            $qtyFromReceipt = min($receiptRemaining, $remainingToAllocate);
            $cost = $qtyFromReceipt * $receipt->unit_cost;
            
            $allocations[] = [
                'receipt_date' => $receipt->occurred_at,
                'qty' => $qtyFromReceipt,
                'unit_cost' => $receipt->unit_cost,
                'cost' => round($cost, 2)
            ];
            
            $totalCost += $cost;
            $remainingToAllocate -= $qtyFromReceipt;
        }
        
        $avgCost = $qtyToIssue > 0 ? $totalCost / $qtyToIssue : 0;
        
        return [
            'qty_issued' => $qtyToIssue,
            'total_cost' => round($totalCost, 2),
            'avg_cost' => round($avgCost, 2),
            'allocations' => $allocations
        ];
    }

    public function getPartsWithLowStock(): Collection
    {
        return Part::all()->filter(function ($part) {
            $currentStock = $this->getCurrentStock($part->id);
            return $part->min_qty && $currentStock < $part->min_qty;
        })->map(function ($part) {
            $current = $this->getCurrentStock($part->id);
            return [
                'part' => $part,
                'current_stock' => $current,
                'min_stock' => $part->min_qty,
                'reorder_qty' => $part->reorder_qty,
                'deficit' => $part->min_qty - $current
            ];
        });
    }

    public function getStockMovementHistory(string $partId, ?\DateTime $from = null, ?\DateTime $to = null): Collection
    {
        $query = StockTxn::where('part_id', $partId);
        
        if ($from) {
            $query->where('occurred_at', '>=', $from);
        }
        
        if ($to) {
            $query->where('occurred_at', '<=', $to);
        }
        
        return $query->orderBy('occurred_at', 'desc')->get();
    }

    public function getInventoryValuation(): array
    {
        $parts = Part::all();
        $totalValue = 0;
        $partValues = [];
        
        foreach ($parts as $part) {
            $valuation = $this->getStockValue($part->id);
            $totalValue += $valuation['value'];
            
            if ($valuation['qty'] > 0) {
                $partValues[] = [
                    'part' => $part,
                    'valuation' => $valuation
                ];
            }
        }
        
        return [
            'total_value' => round($totalValue, 2),
            'parts_count' => count($partValues),
            'parts' => $partValues
        ];
    }

    public function getStockTurnoverRate(string $partId, \DateTime $from, \DateTime $to): array
    {
        $avgStock = $this->getAverageStock($partId, $from, $to);
        
        $issued = abs(StockTxn::where('part_id', $partId)
            ->where('kind', 'issue')
            ->whereBetween('occurred_at', [$from, $to])
            ->sum('qty'));
        
        $turnoverRate = $avgStock > 0 ? $issued / $avgStock : 0;
        
        return [
            'part_id' => $partId,
            'period' => ['from' => $from, 'to' => $to],
            'avg_stock' => $avgStock,
            'issued_qty' => $issued,
            'turnover_rate' => round($turnoverRate, 2)
        ];
    }

    protected function getAverageStock(string $partId, \DateTime $from, \DateTime $to): float
    {
        $startStock = StockTxn::where('part_id', $partId)
            ->where('occurred_at', '<', $from)
            ->sum('qty');
        
        $endStock = $this->getCurrentStock($partId);
        
        return ($startStock + $endStock) / 2;
    }
}
