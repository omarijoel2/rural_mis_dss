import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { GlobalSidebar } from './GlobalSidebar';
import { 
  Shield, 
  Key, 
  FileText, 
  AlertTriangle, 
  Users, 
  Database,
  Lock,
  Settings,
  Clock
} from 'lucide-react';

const navItems = [
  { path: '/security/audit', label: 'Audit Logs', icon: FileText },
  { path: '/security/alerts', label: 'Security Alerts', icon: AlertTriangle },
  { path: '/security/roles', label: 'Roles & Permissions', icon: Users },
  { path: '/security/api-keys', label: 'API Keys', icon: Key },
  { path: '/security/dsr', label: 'DSR Requests', icon: Database },
  { path: '/security/consents', label: 'Consents', icon: Shield },
  { path: '/security/kms', label: 'Encryption Keys', icon: Lock },
  { path: '/security/retention', label: 'Retention Policies', icon: Clock },
  { path: '/security/data-catalog', label: 'Data Catalog', icon: Settings },
];

export function SecurityLayout() {
  return (
    <div className="flex min-h-screen">
      <GlobalSidebar />
      <div className="flex flex-1">
        <aside className="w-64 bg-card border-r">
          <div className="p-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Compliance & Audit Console</p>
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
