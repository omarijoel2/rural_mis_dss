import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { GlobalSidebar } from './GlobalSidebar';
import { 
  Wrench, 
  Package, 
  ClipboardList, 
  BarChart3, 
  Settings,
  Map
} from 'lucide-react';

const navItems = [
  { path: '/cmms/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/cmms/assets', label: 'Assets', icon: Settings },
  { path: '/cmms/work-orders', label: 'Work Orders', icon: ClipboardList },
  { path: '/cmms/parts', label: 'Parts Inventory', icon: Package },
  { path: '/cmms/map', label: 'Asset Map', icon: Map },
];

export function CmmsLayout() {
  return (
    <div className="flex min-h-screen">
      <GlobalSidebar />
      <div className="flex flex-1">
        <aside className="w-64 bg-card border-r">
          <div className="p-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              CMMS
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Asset & Maintenance Management</p>
          </div>
          <nav className="px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
