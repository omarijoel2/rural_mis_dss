import { Link, NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  Calculator, 
  Database, 
  Users, 
  Droplet, 
  Wrench, 
  Shield, 
  Map, 
  Briefcase, 
  CloudRain,
  PieChart,
  TrendingUp,
  DollarSign,
  Building2,
  Home,
  Receipt,
  AlertTriangle,
  Upload,
  Package,
  ClipboardList,
  BarChart3,
  Settings,
  MapPin,
  Calendar,
  TestTube,
  FileText,
  Key,
  Lock,
  Clock,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

const moduleNavigation = [
  {
    name: 'Core Registry',
    href: '/core',
    icon: Database,
    color: 'text-blue-500',
    subPages: [
      { name: 'Schemes', href: '/core/schemes' },
      { name: 'Facilities', href: '/core/facilities' },
      { name: 'DMAs', href: '/core/dmas' },
      { name: 'Pipelines', href: '/core/pipelines' },
      { name: 'Zones', href: '/core/zones' },
      { name: 'Addresses', href: '/core/addresses' },
    ]
  },
  {
    name: 'CRM & Revenue',
    href: '/crm',
    icon: Users,
    color: 'text-green-500',
    subPages: [
      { name: 'Customers', href: '/crm/customers', icon: Users },
      { name: 'Account Search', href: '/crm/accounts/search', icon: Home },
      { name: 'Revenue Assurance', href: '/crm/ra', icon: AlertTriangle },
      { name: 'Dunning & Collections', href: '/crm/dunning', icon: Receipt },
      { name: 'Import Center', href: '/crm/import', icon: Upload },
    ]
  },
  {
    name: 'Hydro-Met',
    href: '/hydromet',
    icon: CloudRain,
    color: 'text-cyan-500',
    subPages: [
      { name: 'Water Sources', href: '/hydromet/sources' },
      { name: 'Stations Registry', href: '/hydromet/stations' },
    ]
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: Briefcase,
    color: 'text-purple-500',
    subPages: []
  },
  {
    name: 'Costing',
    href: '/costing',
    icon: Calculator,
    color: 'text-orange-500',
    subPages: [
      { name: 'Budgets', href: '/costing/budgets', icon: Calculator },
      { name: 'Allocation Console', href: '/costing/allocations', icon: PieChart },
      { name: 'Cost-to-Serve', href: '/costing/cost-to-serve', icon: TrendingUp },
      { name: 'GL Accounts', href: '/costing/gl-accounts', icon: DollarSign },
      { name: 'Cost Centers', href: '/costing/cost-centers', icon: Building2 },
    ]
  },
  {
    name: 'CMMS',
    href: '/cmms',
    icon: Wrench,
    color: 'text-yellow-500',
    subPages: [
      { name: 'Dashboard', href: '/cmms/dashboard', icon: BarChart3 },
      { name: 'Assets', href: '/cmms/assets', icon: Settings },
      { name: 'Work Orders', href: '/cmms/work-orders', icon: ClipboardList },
      { name: 'Parts Inventory', href: '/cmms/parts', icon: Package },
      { name: 'Asset Map', href: '/cmms/map', icon: Map },
    ]
  },
  {
    name: 'Water Quality',
    href: '/water-quality',
    icon: Droplet,
    color: 'text-blue-400',
    subPages: [
      { name: 'Parameters', href: '/water-quality/parameters', icon: TestTube },
      { name: 'Sampling Points', href: '/water-quality/sampling-points', icon: MapPin },
      { name: 'Sampling Plans', href: '/water-quality/plans', icon: Calendar },
      { name: 'Samples', href: '/water-quality/samples', icon: Droplet },
      { name: 'Lab Results', href: '/water-quality/results', icon: FileText },
      { name: 'Compliance', href: '/water-quality/compliance', icon: BarChart3 },
    ]
  },
  {
    name: 'GIS Map',
    href: '/gis/map',
    icon: Map,
    color: 'text-red-500',
    subPages: []
  },
  {
    name: 'Security',
    href: '/security',
    icon: Shield,
    color: 'text-gray-500',
    subPages: [
      { name: 'Audit Logs', href: '/security/audit', icon: FileText },
      { name: 'Security Alerts', href: '/security/alerts', icon: AlertTriangle },
      { name: 'Roles & Permissions', href: '/security/roles', icon: Users },
      { name: 'API Keys', href: '/security/api-keys', icon: Key },
      { name: 'DSR Requests', href: '/security/dsr', icon: Database },
      { name: 'Consents', href: '/security/consents', icon: Shield },
      { name: 'Encryption Keys', href: '/security/kms', icon: Lock },
      { name: 'Retention Policies', href: '/security/retention', icon: Clock },
      { name: 'Data Catalog', href: '/security/data-catalog', icon: Settings },
    ]
  },
];

export function ExpandableSidebar() {
  const location = useLocation();
  
  const getActiveModule = () => {
    const basePath = '/' + location.pathname.split('/')[1];
    return moduleNavigation.find(module => module.href.startsWith(basePath));
  };

  const activeModule = getActiveModule();

  return (
    <aside className="w-64 bg-card border-r overflow-y-auto">
      {/* Logo/Title */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">RW</span>
          </div>
          <div>
            <h1 className="text-sm font-bold">Rural Water MIS</h1>
            <p className="text-[10px] text-muted-foreground">Management Information System</p>
          </div>
        </div>
      </div>

      {/* Module Navigation */}
      <nav className="p-3 space-y-1">
        {moduleNavigation.map((module) => {
          const isActive = activeModule?.href === module.href;
          const hasSubPages = module.subPages.length > 0;
          
          return (
            <div key={module.name}>
              {/* Module Main Link */}
              <Link
                to={module.subPages[0]?.href || module.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors group',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <module.icon className={cn('h-5 w-5 flex-shrink-0', isActive && module.color)} />
                <span className="flex-1">{module.name}</span>
                {hasSubPages && (
                  isActive 
                    ? <ChevronDown className="h-4 w-4" />
                    : <ChevronRight className="h-4 w-4" />
                )}
              </Link>

              {/* Sub-pages (only shown when module is active) */}
              {isActive && hasSubPages && (
                <div className="mt-1 ml-6 space-y-0.5">
                  {module.subPages.map((subPage) => {
                    const SubPageIcon = 'icon' in subPage ? subPage.icon : null;
                    return (
                      <NavLink
                        key={subPage.href}
                        to={subPage.href}
                        className={({ isActive: isSubActive }) =>
                          cn(
                            'flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors',
                            isSubActive
                              ? 'bg-primary text-primary-foreground font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          )
                        }
                      >
                        {SubPageIcon && <SubPageIcon className="h-4 w-4" />}
                        <span>{subPage.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
