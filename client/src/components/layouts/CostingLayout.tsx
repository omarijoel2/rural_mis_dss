import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Calculator, PieChart, TrendingUp, DollarSign, Building2 } from 'lucide-react';
import { GlobalNav } from './GlobalNav';

const costingNav = [
  { name: 'Budgets', href: '/costing/budgets', icon: Calculator },
  { name: 'Allocation Console', href: '/costing/allocations', icon: PieChart },
  { name: 'Cost-to-Serve', href: '/costing/cost-to-serve', icon: TrendingUp },
  { name: 'GL Accounts', href: '/costing/gl-accounts', icon: DollarSign },
  { name: 'Cost Centers', href: '/costing/cost-centers', icon: Building2 },
];

export function CostingLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <GlobalNav />

      <div className="flex flex-1">
        {/* Module-specific Sidebar */}
        <aside className="w-64 bg-card border-r">
          <div className="p-6">
            <h2 className="text-xl font-bold">Costing & Budgets</h2>
            <p className="text-sm text-muted-foreground mt-1">Financial Planning & Analytics</p>
          </div>
          <nav className="px-3 space-y-1">
            {costingNav.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
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
                {item.name}
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
