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
  ChevronDown,
  Target,
  Activity,
  Globe,
  Phone,
  CreditCard,
  Gauge,
  Truck,
  HandHeart,
  MessageSquare,
  Handshake,
  BarChart2,
  FolderOpen
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
    name: 'M&E & Service Levels',
    href: '/me',
    icon: Target,
    color: 'text-teal-500',
    subPages: [
      { name: 'KPI Dashboard', href: '/me/kpis', icon: Gauge },
      { name: 'Coverage Analytics', href: '/me/coverage', icon: Globe },
      { name: 'NRW Tracker', href: '/me/nrw', icon: Droplet },
      { name: 'CX Analytics', href: '/me/cx', icon: Activity },
      { name: 'Results Framework', href: '/me/indicators', icon: Target },
    ]
  },
  {
    name: 'Customer & Commercial',
    href: '/customer',
    icon: Phone,
    color: 'text-pink-500',
    subPages: [
      { name: 'Tariffs', href: '/customer/tariffs', icon: DollarSign },
      { name: 'Billing Runs', href: '/customer/billing', icon: Receipt },
      { name: 'Payment Reconciliation', href: '/customer/payments', icon: CreditCard },
      { name: 'Meter Routes', href: '/customer/meter-routes', icon: MapPin },
      { name: 'Tickets (CRM)', href: '/customer/tickets', icon: Phone },
      { name: 'Kiosks', href: '/customer/kiosks', icon: Home },
      { name: 'Water Trucking', href: '/customer/trucking', icon: Truck },
      { name: 'Connections', href: '/customer/connections', icon: Package },
    ]
  },
  {
    name: 'Community & Stakeholder',
    href: '/community',
    icon: HandHeart,
    color: 'text-purple-500',
    subPages: [
      { name: 'RWSS Committees', href: '/community/committees', icon: Users },
      { name: 'Committee Finance', href: '/community/finance', icon: DollarSign },
      { name: 'Vendor Portal', href: '/community/vendors', icon: Handshake },
      { name: 'Bids & RFQs', href: '/community/bids', icon: FileText },
      { name: 'Vendor Deliveries', href: '/community/deliveries', icon: Package },
      { name: 'Stakeholder Map', href: '/community/stakeholders', icon: Users },
      { name: 'Engagement Planner', href: '/community/engagements', icon: Calendar },
      { name: 'GRM Console', href: '/community/grm', icon: MessageSquare },
      { name: 'Open Data Catalog', href: '/community/open-data', icon: FolderOpen },
      { name: 'Dataset Builder', href: '/community/dataset-builder', icon: Settings },
      { name: 'Public Maps', href: '/community/public-maps', icon: Map },
    ]
  },
  {
    name: 'Security & Admin',
    href: '/admin',
    icon: Shield,
    color: 'text-gray-500',
    subPages: [
      { name: 'Users Management', href: '/admin/users', icon: Users },
      { name: 'Roles & Permissions', href: '/admin/rbac/roles', icon: Key },
      { name: 'Permission Matrix', href: '/admin/rbac/matrix', icon: Settings },
      { name: 'Audit Logs', href: '/admin/audit', icon: FileText },
      { name: 'Security Alerts', href: '/admin/security/alerts', icon: AlertTriangle },
      { name: 'API Keys', href: '/admin/security/api-keys', icon: Lock },
    ]
  },
  {
    name: 'Integration',
    href: '/integration',
    icon: Settings,
    color: 'text-indigo-500',
    subPages: [
      { name: 'API Catalog', href: '/integration/api', icon: Database },
      { name: 'Connector Gallery', href: '/integration/connectors', icon: Settings },
      { name: 'Webhook Manager', href: '/integration/webhooks', icon: Settings },
      { name: 'ETL Jobs', href: '/integration/etl', icon: Settings },
      { name: 'Data Warehouse', href: '/integration/dw', icon: Database },
      { name: 'Communication Templates', href: '/integration/comms', icon: Settings },
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
