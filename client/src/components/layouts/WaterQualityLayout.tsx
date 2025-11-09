import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { 
  Droplet, 
  MapPin, 
  Calendar, 
  TestTube, 
  FileText, 
  BarChart3,
  LogOut
} from 'lucide-react';

const navItems = [
  { path: '/water-quality/parameters', label: 'Parameters', icon: TestTube, permission: 'view water quality parameters' },
  { path: '/water-quality/sampling-points', label: 'Sampling Points', icon: MapPin, permission: 'view water quality sampling points' },
  { path: '/water-quality/plans', label: 'Sampling Plans', icon: Calendar, permission: 'view water quality plans' },
  { path: '/water-quality/samples', label: 'Samples', icon: Droplet, permission: 'view water quality samples' },
  { path: '/water-quality/results', label: 'Lab Results', icon: FileText, permission: 'view water quality results' },
  { path: '/water-quality/compliance', label: 'Compliance', icon: BarChart3, permission: 'view water quality compliance' },
];

export function WaterQualityLayout() {
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();

  const visibleNavItems = navItems.filter(item => hasPermission(item.permission));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold">Water Quality & Lab QA/QC</h1>
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
