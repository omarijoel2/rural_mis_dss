import { Link, useLocation } from 'react-router-dom';
import { Database, Droplets, Activity, Gauge, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ExpandableSidebarCoreRegistry() {
  const location = useLocation();
  
  const items = [
    { name: 'Schemes', href: '/core/schemes', icon: Droplets },
    { name: 'Assets', href: '/core/assets', icon: Gauge },
    { name: 'DMAs', href: '/core/dmas', icon: Activity },
    { name: 'Network Topology', href: '/core/network', icon: MapPin },
  ];

  return (
    <div className="space-y-1 mb-4 border-t pt-4">
      <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Core Registry</h3>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm',
              isActive
                ? 'bg-blue-500/20 text-blue-400 font-medium'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
