import { useQuery } from '@tanstack/react-query';
import { assetService } from '../../services/asset.service';
import { workOrderService } from '../../services/workOrder.service';
import { partService } from '../../services/part.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Settings, ClipboardList, Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function CmmsDashboard() {
  const { data: assets } = useQuery({
    queryKey: ['assets', { per_page: 1 }],
    queryFn: () => assetService.getAssets({ per_page: 1 }),
  });

  const { data: workOrders } = useQuery({
    queryKey: ['work-orders', { per_page: 1 }],
    queryFn: () => workOrderService.getWorkOrders({ per_page: 1 }),
  });

  const { data: openWOs } = useQuery({
    queryKey: ['work-orders', { status: 'open', per_page: 1 }],
    queryFn: () => workOrderService.getWorkOrders({ status: 'open', per_page: 1 }),
  });

  const { data: inProgressWOs } = useQuery({
    queryKey: ['work-orders', { status: 'in_progress', per_page: 1 }],
    queryFn: () => workOrderService.getWorkOrders({ status: 'in_progress', per_page: 1 }),
  });

  const { data: parts } = useQuery({
    queryKey: ['parts', { per_page: 100 }],
    queryFn: () => partService.getParts({ per_page: 100 }),
  });

  const lowStockParts = parts?.data.filter(part => {
    const stock = part.stock_balance || 0;
    const reorder = part.reorder_level || 0;
    return stock <= reorder && stock > 0;
  }).length || 0;

  const outOfStockParts = parts?.data.filter(part => 
    (part.stock_balance || 0) === 0
  ).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CMMS Dashboard</h1>
        <p className="text-muted-foreground">Overview of assets, maintenance, and inventory</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Infrastructure and equipment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workOrders?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              All maintenance tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Work Orders</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{openWOs?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pending assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{inProgressWOs?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parts?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Inventory items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{lowStockParts}</div>
            <p className="text-xs text-muted-foreground">
              Need reordering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{outOfStockParts}</div>
            <p className="text-xs text-muted-foreground">
              Urgent action needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Online</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/cmms/work-orders" className="block p-3 border rounded hover:bg-accent transition-colors">
              <div className="font-medium">Create Work Order</div>
              <div className="text-sm text-muted-foreground">Schedule maintenance task</div>
            </a>
            <a href="/cmms/assets" className="block p-3 border rounded hover:bg-accent transition-colors">
              <div className="font-medium">Add New Asset</div>
              <div className="text-sm text-muted-foreground">Register infrastructure or equipment</div>
            </a>
            <a href="/cmms/parts" className="block p-3 border rounded hover:bg-accent transition-colors">
              <div className="font-medium">Manage Inventory</div>
              <div className="text-sm text-muted-foreground">Update parts and stock levels</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>System is ready to track your maintenance activities.</p>
              <p className="mt-2">Start by adding assets, creating work orders, or managing inventory.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
