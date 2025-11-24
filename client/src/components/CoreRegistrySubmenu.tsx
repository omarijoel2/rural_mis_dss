import { NavLink } from 'react-router-dom';
import { Droplets, Gauge, Zap, Activity, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CoreRegistrySubmenu() {
  const items = [
    { name: 'Schemes', href: '/core/schemes', icon: Droplets },
    { name: 'Assets', href: '/core/assets', icon: Gauge },
    { name: 'DMAs', href: '/core/dmas', icon: Activity },
    { name: 'Telemetry', href: '/core/telemetry', icon: Zap },
    { name: 'Network', href: '/core/network', icon: Activity },
  ];

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
              isActive
                ? 'bg-blue-500/20 text-blue-500 font-medium'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            )
          }
        >
          <item.icon className="h-4 w-4" />
          <span>{item.name}</span>
        </NavLink>
      ))}
    </div>
  );
}
