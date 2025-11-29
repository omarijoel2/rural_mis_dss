import { Link, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  FolderOpen,
  Zap,
  FileBarChart,
  ShoppingCart,
  Brain,
  LineChart,
  Cpu,
  Sparkles,
  Bell,
  BookOpen,
  AlertCircle,
  GitBranch,
  Trophy,
  CheckCircle2,
  Gavel
} from 'lucide-react';

const moduleNavigation = [
  // INFRASTRUCTURE & ASSETS
  {
    name: 'Core Registry',
    href: '/core',
    icon: Database,
    color: 'text-blue-500',
    category: 'Infrastructure & Assets',
    subPages: [
      { name: 'Home', href: '/core' },
      { name: 'Schemes', href: '/core/schemes' },
      { name: 'Assets', href: '/core/assets' },
      { name: 'Facilities', href: '/core/facilities' },
      { name: 'DMAs', href: '/core/dmas' },
      { name: 'Pipelines', href: '/core/pipelines' },
      { name: 'Zones', href: '/core/zones' },
      { name: 'Addresses', href: '/core/addresses' },
      { name: 'Meters', href: '/core/meters' },
    ]
  },
  {
    name: 'CMMS',
    href: '/cmms',
    icon: Wrench,
    color: 'text-yellow-500',
    category: 'Infrastructure & Assets',
    subPages: [
      { name: 'Dashboard', href: '/cmms/dashboard', icon: BarChart3 },
      { name: 'Assets', href: '/cmms/assets', icon: Settings },
      { name: 'Work Orders', href: '/cmms/work-orders', icon: ClipboardList },
      { name: 'Job Plans', href: '/cmms/job-plans', icon: FileText },
      { name: 'Preventive Maintenance', href: '/cmms/pm', icon: Calendar },
      { name: 'Condition Monitoring', href: '/cmms/condition-monitoring', icon: Activity },
      { name: 'Stores & Inventory', href: '/cmms/stores', icon: Package },
      { name: 'Fleet Management', href: '/cmms/fleet', icon: Truck },
      { name: 'Contractors & SLA', href: '/cmms/contractors', icon: Handshake },
      { name: 'HSE Safety', href: '/cmms/hse', icon: Shield },
      { name: 'Parts Catalog', href: '/cmms/parts', icon: Database },
      { name: 'Asset Map', href: '/cmms/map', icon: Map },
    ]
  },
  {
    name: 'Water Quality',
    href: '/water-quality',
    icon: Droplet,
    color: 'text-blue-400',
    category: 'Infrastructure & Assets',
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
    name: 'Hydro-Met',
    href: '/hydromet',
    icon: CloudRain,
    color: 'text-cyan-500',
    category: 'Infrastructure & Assets',
    subPages: [
      { name: 'Water Sources', href: '/hydromet/sources' },
      { name: 'Stations Registry', href: '/hydromet/stations' },
      { name: 'Aquifer Management', href: '/hydromet/aquifers', icon: Droplet },
    ]
  },
  {
    name: 'GIS',
    href: '/gis',
    icon: Map,
    color: 'text-red-500',
    category: 'Infrastructure & Assets',
    subPages: [
      { name: 'Map Console', href: '/gis', icon: Map },
      { name: 'Files & Layers', href: '/gis', icon: Upload },
      { name: 'Settings', href: '/gis', icon: Settings },
    ]
  },

  // OPERATIONS & CUSTOMER MANAGEMENT
  {
    name: 'CRM & Revenue',
    href: '/crm',
    icon: Users,
    color: 'text-green-500',
    category: 'Operations & Customer',
    subPages: [
      { name: 'Customers', href: '/crm/customers', icon: Users },
      { name: 'Account Search', href: '/crm/accounts/search', icon: Home },
      { name: 'Complaints', href: '/crm/complaints', icon: AlertTriangle },
      { name: 'Interactions', href: '/crm/interactions', icon: MessageSquare },
      { name: 'Segmentation', href: '/crm/segmentation', icon: BarChart3 },
      { name: 'Revenue Assurance', href: '/crm/ra', icon: AlertTriangle },
      { name: 'Dunning & Collections', href: '/crm/dunning', icon: Receipt },
      { name: 'Import Center', href: '/crm/import', icon: Upload },
    ]
  },
  {
    name: 'Customer & Commercial',
    href: '/customer',
    icon: Phone,
    color: 'text-pink-500',
    category: 'Operations & Customer',
    subPages: [
      { name: 'Tariffs', href: '/customer/tariffs', icon: DollarSign },
      { name: 'Billing Runs', href: '/customer/billing', icon: Receipt },
      { name: 'Payment Reconciliation', href: '/customer/payments', icon: CreditCard },
      { name: 'Meter Routes', href: '/customer/meter-routes', icon: MapPin },
      { name: 'Tickets & Support', href: '/customer/tickets', icon: Phone },
      { name: 'Kiosks', href: '/customer/kiosks', icon: Home },
      { name: 'Water Trucking', href: '/customer/trucking', icon: Truck },
      { name: 'Connections', href: '/customer/connections', icon: Package },
    ]
  },
  {
    name: 'Core Operations',
    href: '/core-ops',
    icon: Activity,
    color: 'text-emerald-500',
    category: 'Operations & Customer',
    subPages: [
      { name: 'Operations Console', href: '/core-ops/console', icon: Gauge },
      { name: 'Topology Viewer', href: '/core-ops/topology', icon: Globe },
      { name: 'Telemetry Dashboard', href: '/core-ops/telemetry', icon: BarChart2 },
      { name: 'Outage Planner', href: '/core-ops/outages', icon: AlertTriangle },
      { name: 'NRW Dashboard', href: '/core-ops/nrw', icon: Droplet },
      { name: 'Dosing Control', href: '/core-ops/dosing', icon: TestTube },
      { name: 'Pump Scheduling', href: '/core-ops/scheduling', icon: Clock },
      { name: 'Pressure & Leak', href: '/core-ops/pressure-leak', icon: Gauge },
      { name: 'Shifts & Events', href: '/core-ops/shifts', icon: Clock },
      { name: 'Alerts & Events', href: '/core-ops/events', icon: AlertCircle },
      { name: 'Checklists', href: '/core-ops/checklists', icon: ClipboardList },
      { name: 'Playbooks', href: '/core-ops/playbooks', icon: BookOpen },
      { name: 'Escalation Policies', href: '/core-ops/escalation-policies', icon: Bell },
      { name: 'Workflows', href: '/core-ops/workflows/definitions', icon: GitBranch, subMenu: [
        { name: 'Definitions', href: '/core-ops/workflows/definitions' },
        { name: 'Instances', href: '/core-ops/workflows/instances' },
      ]},
      { name: 'Drought Response', href: '/core-ops/droughts', icon: AlertTriangle },
      { name: 'Predictions', href: '/core-ops/predictions', icon: TrendingUp },
    ]
  },

  // PLANNING & FINANCE
  {
    name: 'Projects',
    href: '/projects',
    icon: Briefcase,
    color: 'text-purple-500',
    category: 'Planning & Finance',
    subPages: []
  },
  {
    name: 'Costing & Procurement',
    href: '/costing',
    icon: Calculator,
    color: 'text-orange-500',
    category: 'Planning & Finance',
    subPages: [
      { name: 'Budgets', href: '/costing/budgets', icon: Calculator },
      { name: 'Allocation Console', href: '/costing/allocations', icon: PieChart },
      { name: 'Cost-to-Serve', href: '/costing/cost-to-serve', icon: TrendingUp },
      { name: 'GL Accounts', href: '/costing/gl-accounts', icon: DollarSign },
      { name: 'Cost Centers', href: '/costing/cost-centers', icon: Building2 },
      { name: 'Energy Tariffs', href: '/costing/energy/tariffs', icon: Zap },
      { name: 'Energy Readings', href: '/costing/energy/readings', icon: Upload },
      { name: 'Energy Dashboard', href: '/costing/energy/dashboard', icon: FileBarChart },
      { name: 'Requisitions', href: '/procurement/requisitions', icon: ClipboardList },
      { name: 'RFQ Builder', href: '/procurement/rfqs', icon: FileText },
      { name: 'LPO Management', href: '/procurement/lpos', icon: ShoppingCart },
    ]
  },
  {
    name: 'Decision Support & Analytics',
    href: '/dsa',
    icon: Brain,
    color: 'text-violet-500',
    category: 'Planning & Finance',
    subPages: [
      { name: 'Forecast Studio', href: '/dsa/forecast', icon: LineChart },
      { name: 'Scenario Workbench', href: '/dsa/scenarios', icon: Cpu },
      { name: 'Optimization Console', href: '/dsa/optimize', icon: Sparkles },
      { name: 'Anomalies Inbox', href: '/dsa/anomalies', icon: AlertTriangle },
      { name: 'Aquifer Dashboard', href: '/dsa/aquifer', icon: Droplet },
      { name: 'Tariff Sandbox', href: '/dsa/tariffs', icon: DollarSign },
      { name: 'EWS Console', href: '/dsa/ews', icon: Bell },
    ]
  },

  // MONITORING & REPORTING
  {
    name: 'M&E & Service Levels',
    href: '/me',
    icon: Target,
    color: 'text-teal-500',
    category: 'Monitoring & Reporting',
    subPages: [
      { name: 'KPI Dashboard', href: '/me/kpis', icon: Gauge },
      { name: 'Coverage Analytics', href: '/me/coverage', icon: Globe },
      { name: 'NRW Tracker', href: '/me/nrw', icon: Droplet },
      { name: 'CX Analytics', href: '/me/cx', icon: Activity },
      { name: 'Results Framework', href: '/me/indicators', icon: Target },
      { name: 'Gender & Equity', href: '/me/gender-equity', icon: Users },
    ]
  },

  // COMMUNITY & ENGAGEMENT
  {
    name: 'Community & Stakeholder',
    href: '/community',
    icon: HandHeart,
    color: 'text-purple-500',
    category: 'Community & Engagement',
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

  // GOVERNANCE & SECURITY
  {
    name: 'Risk, Compliance & Governance',
    href: '/risk-compliance',
    icon: Gavel,
    color: 'text-orange-500',
    category: 'Governance & Security',
    subPages: [
      { name: 'Dashboard', href: '/risk-compliance/home', icon: Activity },
      { name: 'Risk Register', href: '/risk-compliance/risks', icon: AlertTriangle },
      { name: 'Incidents & Issues', href: '/risk-compliance/incidents', icon: Shield },
      { name: 'Business Continuity', href: '/risk-compliance/bcp', icon: CheckCircle2 },
      { name: 'Regulatory Reporting', href: '/risk-compliance/regulatory-reporting', icon: FileText },
      { name: 'Policies & SOPs', href: '/risk-compliance/policies', icon: BookOpen },
      { name: 'Internal Audit', href: '/risk-compliance/audit', icon: FileText },
      { name: 'HSE', href: '/risk-compliance/hse', icon: Shield },
      { name: 'Data Privacy (DPO)', href: '/risk-compliance/dpo', icon: Lock },
    ]
  },
  {
    name: 'Security & Access',
    href: '/security',
    icon: Shield,
    color: 'text-red-500',
    category: 'Governance & Security',
    subPages: [
      { name: 'Audit Logs', href: '/security/audit', icon: FileText },
      { name: 'Security Alerts', href: '/security/alerts', icon: AlertTriangle },
      { name: 'Roles & Permissions', href: '/security/roles', icon: Key },
      { name: 'API Keys', href: '/security/api-keys', icon: Lock },
      { name: 'DSR Requests', href: '/security/dsr', icon: FileText },
      { name: 'Consents', href: '/security/consents', icon: Shield },
      { name: 'Key Management', href: '/security/kms', icon: Lock },
      { name: 'Retention Policies', href: '/security/retention', icon: Clock },
      { name: 'Data Catalog', href: '/security/data-catalog', icon: Database },
      { name: '2FA Setup', href: '/security/2fa', icon: Shield },
    ]
  },
  {
    name: 'Admin & Configuration',
    href: '/admin',
    icon: Settings,
    color: 'text-gray-500',
    category: 'Governance & Security',
    subPages: [
      { name: 'Users Management', href: '/admin/users', icon: Users },
      { name: 'Roles & Permissions', href: '/admin/rbac/roles', icon: Key },
      { name: 'Role & Menu Access', href: '/admin/rbac/menu-access', icon: Shield },
      { name: 'Permission Matrix', href: '/admin/rbac/matrix', icon: Settings },
      { name: 'Module Settings', href: '/admin/settings', icon: Zap },
      { name: 'Audit Logs', href: '/admin/audit', icon: FileText },
      { name: 'Security Alerts', href: '/admin/security/alerts', icon: AlertTriangle },
      { name: 'API Keys', href: '/admin/security/api-keys', icon: Lock },
    ]
  },

  // INTEGRATION & ENABLEMENT
  {
    name: 'Integration',
    href: '/integration',
    icon: Settings,
    color: 'text-indigo-500',
    category: 'Integration & Enablement',
    subPages: [
      { name: 'API Catalog', href: '/integration/api', icon: Database },
      { name: 'Connector Gallery', href: '/integration/connectors', icon: Settings },
      { name: 'Webhook Manager', href: '/integration/webhooks', icon: Settings },
      { name: 'ETL Jobs', href: '/integration/etl', icon: Settings },
      { name: 'Data Warehouse', href: '/integration/dw', icon: Database },
      { name: 'Communication Templates', href: '/integration/comms', icon: Settings },
    ]
  },
  {
    name: 'Training & Knowledge',
    href: '/training',
    icon: FileText,
    color: 'text-amber-500',
    category: 'Integration & Enablement',
    subPages: [
      { name: 'Course Catalog', href: '/training/courses', icon: FileText },
      { name: 'My Learning', href: '/training/my-learning', icon: Activity },
      { name: 'Knowledge Base', href: '/training/kb', icon: Database },
      { name: 'SOPs', href: '/training/sops', icon: ClipboardList },
      { name: 'Skills Matrix', href: '/training/skills', icon: Target },
      { name: 'Certificates', href: '/training/certificates', icon: Shield },
      { name: 'Capacity Assessments', href: '/training/assessments', icon: Trophy },
    ]
  },
];

export function ExpandableSidebar() {
  const location = useLocation();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedNestedMenus, setExpandedNestedMenus] = useState<Set<string>>(new Set());
  const [isCompactMode, setIsCompactMode] = useState(false);
  
  const getActiveModule = () => {
    const basePath = '/' + location.pathname.split('/')[1];
    return moduleNavigation.find(module => module.href.startsWith(basePath));
  };

  const activeModule = getActiveModule();

  useEffect(() => {
    const checkViewportHeight = () => {
      const height = window.innerHeight;
      const shouldBeCompact = height < 800;
      setIsCompactMode(shouldBeCompact);
      
      if (shouldBeCompact && activeModule) {
        setExpandedModules(new Set([activeModule.name]));
      } else if (!shouldBeCompact && activeModule) {
        setExpandedModules(new Set([activeModule.name]));
      }
    };

    checkViewportHeight();

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkViewportHeight, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [activeModule]);

  const toggleModule = (moduleName: string) => {
    if (isCompactMode) {
      setExpandedModules(new Set([moduleName]));
    } else {
      const newExpanded = new Set(expandedModules);
      if (newExpanded.has(moduleName)) {
        newExpanded.delete(moduleName);
      } else {
        newExpanded.add(moduleName);
      }
      setExpandedModules(newExpanded);
    }
  };

  const groupedModules = moduleNavigation.reduce((acc, module) => {
    const category = module.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(module);
    return acc;
  }, {} as Record<string, typeof moduleNavigation>);

  const categoryOrder = [
    'Infrastructure & Assets',
    'Operations & Customer',
    'Planning & Finance',
    'Monitoring & Reporting',
    'Community & Engagement',
    'Governance & Security',
    'Integration & Enablement'
  ];

  return (
    <aside className="w-64 bg-card border-r flex flex-col h-screen">
      {/* Logo/Title */}
      <div className="p-6 border-b flex-shrink-0">
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
      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-4">
          {categoryOrder.map((category) => {
            const modules = groupedModules[category] || [];
            if (modules.length === 0) return null;

            return (
              <div key={category}>
                {/* Category Header */}
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {category}
                </div>
                
                {/* Modules in Category */}
                <div className="space-y-1">
                  {modules.map((module) => {
                    const isActive = activeModule?.href === module.href;
                    const hasSubPages = module.subPages.length > 0;
                    const isExpanded = expandedModules.has(module.name);
                    const shouldShowSubPages = hasSubPages && isExpanded;
                    
                    const moduleButtonClass = cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors group',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    );
                    
                    return (
                      <div key={module.name}>
                        {/* Module Main Link */}
                        {hasSubPages ? (
                          <button
                            onClick={() => toggleModule(module.name)}
                            className={moduleButtonClass}
                            aria-expanded={shouldShowSubPages}
                            aria-label={`${module.name} ${isExpanded ? 'expanded' : 'collapsed'}`}
                          >
                            <module.icon className={cn('h-5 w-5 flex-shrink-0', isActive && module.color)} />
                            <span className="flex-1 text-left">{module.name}</span>
                            {isExpanded 
                              ? <ChevronDown className="h-4 w-4" />
                              : <ChevronRight className="h-4 w-4" />
                            }
                          </button>
                        ) : (
                          <NavLink
                            to={module.href}
                            className={({ isActive: isNavActive }) =>
                              cn(
                                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors group',
                                isNavActive
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              )
                            }
                          >
                            <module.icon className={cn('h-5 w-5 flex-shrink-0', isActive && module.color)} />
                            <span className="flex-1 text-left">{module.name}</span>
                          </NavLink>
                        )}

                        {/* Sub-pages (only shown when expanded) */}
                        {shouldShowSubPages && (
                          <div 
                            className="mt-1 ml-6 space-y-0.5 animate-in slide-in-from-top-2 duration-200"
                            role="group"
                            aria-label={`${module.name} submenu`}
                          >
                            {module.subPages.map((subPage) => {
                              const SubPageIcon = 'icon' in subPage ? subPage.icon : null;
                              const hasNestedMenu = 'subMenu' in subPage && subPage.subMenu;
                              const nestedMenuKey = `${module.name}-${subPage.name}`;
                              const isNestedExpanded = expandedNestedMenus.has(nestedMenuKey);
                              
                              const toggleNestedMenu = () => {
                                const newExpanded = new Set(expandedNestedMenus);
                                if (newExpanded.has(nestedMenuKey)) {
                                  newExpanded.delete(nestedMenuKey);
                                } else {
                                  newExpanded.add(nestedMenuKey);
                                }
                                setExpandedNestedMenus(newExpanded);
                              };
                              
                              return (
                                <div key={subPage.href}>
                                  {hasNestedMenu ? (
                                    <button
                                      onClick={toggleNestedMenu}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                                    >
                                      {SubPageIcon && <SubPageIcon className="h-4 w-4" />}
                                      <span className="flex-1 text-left">{subPage.name}</span>
                                      {isNestedExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                    </button>
                                  ) : (
                                    <NavLink
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
                                  )}
                                  
                                  {/* Nested submenu for items like Workflows */}
                                  {hasNestedMenu && isNestedExpanded && (
                                    <div className="ml-4 space-y-0.5 mt-0.5">
                                      {subPage.subMenu?.map((nested) => (
                                        <NavLink
                                          key={nested.href}
                                          to={nested.href}
                                          className={({ isActive: isNestedActive }) =>
                                            cn(
                                              'block px-3 py-1 text-xs rounded-md transition-colors',
                                              isNestedActive
                                                ? 'bg-primary text-primary-foreground font-medium'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                            )
                                          }
                                        >
                                          {nested.name}
                                        </NavLink>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>
      
      {/* Compact Mode Indicator (for debugging, can be removed) */}
      {isCompactMode && (
        <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/50 border-t flex-shrink-0">
          <p className="leading-tight">Compact mode active - single section expanded</p>
        </div>
      )}
    </aside>
  );
}
