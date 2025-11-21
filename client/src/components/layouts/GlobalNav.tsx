import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Calculator, Database, Users, Droplet, Wrench, Shield, Map, Briefcase, CloudRain } from 'lucide-react';

const globalModules = [
  { name: 'Core Registry', href: '/core', icon: Database },
  { name: 'CRM & Revenue', href: '/crm/customers', icon: Users },
  { name: 'Hydro-Met', href: '/hydromet/sources', icon: CloudRain },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Costing', href: '/costing/budgets', icon: Calculator },
  { name: 'CMMS', href: '/cmms/dashboard', icon: Wrench },
  { name: 'Water Quality', href: '/water-quality/samples', icon: Droplet },
  { name: 'GIS Map', href: '/gis/map', icon: Map },
  { name: 'M&E', href: '/me/kpis', icon: Calculator },
  { name: 'Customer', href: '/customer/tariffs', icon: Users },
  { name: 'Community', href: '/community/committees', icon: Users },
  { name: 'Core Ops', href: '/core-ops/console', icon: Calculator },
  { name: 'DSA', href: '/dsa/forecast', icon: Calculator },
  { name: 'Security', href: '/security/audit', icon: Shield },
  { name: 'Admin', href: '/admin/users', icon: Shield },
  { name: 'Integration', href: '/integration/api', icon: Shield },
  { name: 'Training', href: '/training/courses', icon: Shield },
];

export function GlobalNav() {
  const location = useLocation();
  
  const isActive = (href: string) => {
    const basePath = '/' + location.pathname.split('/')[1];
    const moduleBasePath = '/' + href.split('/')[1];
    return basePath === moduleBasePath;
  };

  return (
    <header className="bg-card border-b">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Rural Water Supply MIS</h1>
            <p className="text-xs text-muted-foreground">Management Information System</p>
          </div>
          <nav className="flex gap-2 flex-wrap">
            {globalModules.map((module) => (
              <Link
                key={module.name}
                to={module.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors',
                  isActive(module.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                title={module.name}
              >
                <module.icon className="h-4 w-4" />
                <span className="hidden xl:inline">{module.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
