<?php

namespace App\Services\Cmms;

use App\Models\Store;
use App\Models\Bin;
use App\Models\InventoryLocation;
use App\Models\StockTxn;
use App\Models\Part;
use App\Models\Kit;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class StoresService
{
    public function getAllStores(array $filters = []): Collection
    {
        $query = Store::with(['manager']);
        
        if (isset($filters['scheme_id'])) {
            $query->where('scheme_id', $filters['scheme_id']);
        }
        
        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        
        return $query->orderBy('name')->get();
    }

    public function getStore(int $id): Store
    {
        return Store::with(['manager', 'bins'])->findOrFail($id);
    }

    public function createStore(array $data): Store
    {
        $data['tenant_id'] = auth()->user()->tenant_id;
        return Store::create($data);
    }

    public function updateStore(int $id, array $data): Store
    {
        $store = Store::findOrFail($id);
        $store->update($data);
        return $store->fresh(['manager']);
    }

    public function createBin(int $storeId, array $data): Bin
    {
        $data['store_id'] = $storeId;
        return Bin::create($data);
    }

    public function updateInventoryLocation(int $locationId, array $data): InventoryLocation
    {
        $location = InventoryLocation::findOrFail($locationId);
        $location->update($data);
        
        return $location->fresh(['part', 'bin']);
    }

    public function receiveStock(int $partId, int $binId, float $qty, float $unitCost, ?string $poRef = null): StockTxn
    {
        return DB::transaction(function () use ($partId, $binId, $qty, $unitCost, $poRef) {
            $location = InventoryLocation::firstOrCreate(
                ['part_id' => $partId, 'bin_id' => $binId],
                ['qty_on_hand' => 0, 'reorder_point' => 0, 'reorder_qty' => 0]
            );
            
            $location->increment('qty_on_hand', $qty);
            
            return StockTxn::create([
                'part_id' => $partId,
                'kind' => 'receipt',
                'qty' => $qty,
                'unit_cost' => $unitCost,
                'bin_id' => $binId,
                'ref_doc' => $poRef,
                'occurred_at' => now()
            ]);
        });
    }

    public function issueStock(int $partId, int $binId, float $qty, string $workOrderId): StockTxn
    {
        return DB::transaction(function () use ($partId, $binId, $qty, $workOrderId) {
            $location = InventoryLocation::where('part_id', $partId)
                ->where('bin_id', $binId)
                ->firstOrFail();
            
            if ($location->qty_on_hand < $qty) {
                throw new \Exception("Insufficient stock. Available: {$location->qty_on_hand}, Requested: {$qty}");
            }
            
            $location->decrement('qty_on_hand', $qty);
            
            return StockTxn::create([
                'part_id' => $partId,
                'kind' => 'issue',
                'qty' => -$qty,
                'unit_cost' => 0,
                'bin_id' => $binId,
                'work_order_id' => $workOrderId,
                'occurred_at' => now()
            ]);
        });
    }

    public function createKit(array $data): Kit
    {
        $data['tenant_id'] = auth()->user()->tenant_id;
        return Kit::create($data);
    }

    public function updateKit(int $id, array $data): Kit
    {
        $kit = Kit::findOrFail($id);
        $kit->update($data);
        return $kit->fresh();
    }

    public function getStockValuation(): array
    {
        $tenantId = auth()->user()->tenant_id;
        
        $locations = InventoryLocation::with(['part', 'bin.store'])
            ->whereHas('bin.store', function ($q) use ($tenantId) {
                $q->where('tenant_id', $tenantId);
            })
            ->get();
        
        $totalValue = 0;
        $breakdown = [];
        
        foreach ($locations as $location) {
            if ($location->part) {
                $value = $location->qty_on_hand * ($location->part->unit_cost ?? 0);
                $totalValue += $value;
                
                $breakdown[] = [
                    'part_id' => $location->part_id,
                    'part_name' => $location->part->name,
                    'qty' => $location->qty_on_hand,
                    'unit_cost' => $location->part->unit_cost,
                    'value' => round($value, 2)
                ];
            }
        }
        
        return [
            'total_value' => round($totalValue, 2),
            'total_items' => count($breakdown),
            'breakdown' => $breakdown
        ];
    }

    public function getLowStockAlerts(): Collection
    {
        return InventoryLocation::with(['part', 'bin'])
            ->whereColumn('qty_on_hand', '<=', 'reorder_point')
            ->where('reorder_point', '>', 0)
            ->get();
    }
}
