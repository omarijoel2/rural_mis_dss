import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { 
  Shield, 
  Key, 
  FileText, 
  AlertTriangle, 
  Users, 
  Database,
  Lock,
  Settings,
  Clock,
  LogOut
} from 'lucide-react';

const navItems = [
  { path: '/security/audit', label: 'Audit Logs', icon: FileText, permission: 'view audit' },
  { path: '/security/alerts', label: 'Security Alerts', icon: AlertTriangle, permission: 'view security alerts' },
  { path: '/security/roles', label: 'Roles & Permissions', icon: Users, permission: 'view roles' },
  { path: '/security/api-keys', label: 'API Keys', icon: Key, permission: 'view api keys' },
  { path: '/security/dsr', label: 'DSR Requests', icon: Database, permission: 'view dsr requests' },
  { path: '/security/consents', label: 'Consents', icon: Shield, permission: 'view consents' },
  { path: '/security/kms', label: 'Encryption Keys', icon: Lock, permission: 'view kms keys' },
  { path: '/security/retention', label: 'Retention Policies', icon: Clock, permission: 'manage retention policies' },
  { path: '/security/data-catalog', label: 'Data Catalog', icon: Settings, permission: 'view data catalog' },
];

export function SecurityLayout() {
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();

  const visibleNavItems = navItems.filter(item => hasPermission(item.permission));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Security & Compliance Console</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">{user?.name}</p>
              <p>{user?.email}</p>
            </div>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 border-r bg-card min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            <Link to="/core">
              <Button variant="ghost" className="w-full justify-start mb-4">
                ← Back to Core Registry
              </Button>
            </Link>
            
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
