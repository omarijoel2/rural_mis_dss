import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Network, 
  Droplets, 
  AlertTriangle, 
  TrendingDown, 
  Power, 
  Calendar 
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Operations Console', href: '/core-ops/console', icon: Activity },
  { name: 'Network Topology', href: '/core-ops/topology', icon: Network },
  { name: 'Telemetry & SCADA', href: '/core-ops/telemetry', icon: Activity },
  { name: 'Outage Management', href: '/core-ops/outages', icon: AlertTriangle },
  { name: 'NRW & Water Balance', href: '/core-ops/nrw', icon: TrendingDown },
  { name: 'Dosing Control', href: '/core-ops/dosing', icon: Droplets },
  { name: 'Pump Scheduling', href: '/core-ops/scheduling', icon: Power },
];

export function CoreOpsLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Core Operations</h2>
          <p className="text-sm text-muted-foreground mt-1">Network Management</p>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
