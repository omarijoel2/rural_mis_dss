import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { GlobalSidebar } from './GlobalSidebar';
import { 
  Droplet, 
  MapPin, 
  Calendar, 
  TestTube, 
  FileText, 
  BarChart3
} from 'lucide-react';

const navItems = [
  { path: '/water-quality/parameters', label: 'Parameters', icon: TestTube },
  { path: '/water-quality/sampling-points', label: 'Sampling Points', icon: MapPin },
  { path: '/water-quality/plans', label: 'Sampling Plans', icon: Calendar },
  { path: '/water-quality/samples', label: 'Samples', icon: Droplet },
  { path: '/water-quality/results', label: 'Lab Results', icon: FileText },
  { path: '/water-quality/compliance', label: 'Compliance', icon: BarChart3 },
];

export function WaterQualityLayout() {
  return (
    <div className="flex min-h-screen">
      <GlobalSidebar />
      <div className="flex flex-1">
        <aside className="w-64 bg-card border-r">
          <div className="p-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blue-500" />
              Water Quality
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Lab & QA/QC Management</p>
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
