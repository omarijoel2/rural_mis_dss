import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { 
  Wrench, 
  Package, 
  ClipboardList, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';

const navItems = [
  { path: '/cmms/dashboard', label: 'Dashboard', icon: BarChart3, permission: 'view assets' },
  { path: '/cmms/assets', label: 'Assets', icon: Settings, permission: 'view assets' },
  { path: '/cmms/work-orders', label: 'Work Orders', icon: ClipboardList, permission: 'view work orders' },
  { path: '/cmms/parts', label: 'Parts Inventory', icon: Package, permission: 'view parts inventory' },
];

export function CmmsLayout() {
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();

  const visibleNavItems = navItems.filter(item => hasPermission(item.permission));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Asset & Maintenance Management</h1>
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
