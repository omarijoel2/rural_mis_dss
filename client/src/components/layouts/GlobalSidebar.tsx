import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Calculator, Database, Users, Droplet, Wrench, Shield, Map, Briefcase, CloudRain, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const globalModules = [
  { name: 'Core Registry', href: '/core', icon: Database, color: 'text-blue-500' },
  { name: 'CRM & Revenue', href: '/crm/customers', icon: Users, color: 'text-green-500' },
  { name: 'Hydro-Met', href: '/hydromet/sources', icon: CloudRain, color: 'text-cyan-500' },
  { name: 'Projects', href: '/projects', icon: Briefcase, color: 'text-purple-500' },
  { name: 'Costing', href: '/costing/budgets', icon: Calculator, color: 'text-orange-500' },
  { name: 'CMMS', href: '/cmms/dashboard', icon: Wrench, color: 'text-yellow-500' },
  { name: 'Water Quality', href: '/water-quality/samples', icon: Droplet, color: 'text-blue-400' },
  { name: 'GIS Map', href: '/gis/map', icon: Map, color: 'text-red-500' },
  { name: 'M&E', href: '/me/kpis', icon: Calculator, color: 'text-teal-500' },
  { name: 'Customer', href: '/customer/tariffs', icon: Users, color: 'text-pink-500' },
  { name: 'Community', href: '/community/committees', icon: Users, color: 'text-purple-500' },
  { name: 'Core Ops', href: '/core-ops/console', icon: Calculator, color: 'text-emerald-500' },
  { name: 'DSA', href: '/dsa/forecast', icon: Calculator, color: 'text-violet-500' },
  { name: 'Security', href: '/security/audit', icon: Shield, color: 'text-red-500' },
  { name: 'Admin', href: '/admin/users', icon: Shield, color: 'text-gray-500' },
  { name: 'Integration', href: '/integration/api', icon: Shield, color: 'text-indigo-500' },
  { name: 'Training', href: '/training/courses', icon: Shield, color: 'text-amber-500' },
];

export function GlobalSidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };
  
  const isActive = (href: string) => {
    const basePath = '/' + location.pathname.split('/')[1];
    const moduleBasePath = '/' + href.split('/')[1];
    return basePath === moduleBasePath;
  };

  return (
    <aside className="w-20 bg-card border-r flex flex-col items-center py-6 space-y-1">
      {/* Logo/Title */}
      <div className="mb-6 px-3">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">RW</span>
        </div>
        <p className="text-[8px] text-center text-muted-foreground mt-1 leading-tight">
          Rural Water MIS
        </p>
      </div>

      {/* Module Navigation */}
      <nav className="flex-1 flex flex-col space-y-2">
        {globalModules.map((module) => {
          const active = isActive(module.href);
          return (
            <Link
              key={module.name}
              to={module.href}
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-3 rounded-md transition-all group relative',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              title={module.name}
            >
              <module.icon className={cn('h-6 w-6', active && module.color)} />
              <span className="text-[9px] leading-tight text-center font-medium">
                {module.name.split(' ')[0]}
              </span>
              
              {/* Tooltip on hover */}
              <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {module.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-1 px-2 py-3 rounded-md transition-all text-muted-foreground hover:text-foreground hover:bg-muted mt-auto"
        title="Logout"
      >
        <LogOut className="h-6 w-6 text-red-500" />
        <span className="text-[9px] leading-tight text-center font-medium">
          Logout
        </span>
      </button>
    </aside>
  );
}
