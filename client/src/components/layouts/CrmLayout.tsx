import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Users, Home, Receipt, AlertTriangle, FileText, Upload } from 'lucide-react';

const navigation = [
  { name: 'Customers', href: '/crm/customers', icon: Users },
  { name: 'Account 360', href: '/crm/accounts', icon: Home },
  { name: 'Revenue Assurance', href: '/crm/ra', icon: AlertTriangle },
  { name: 'Dunning & Collections', href: '/crm/dunning', icon: Receipt },
  { name: 'Import Center', href: '/crm/import', icon: Upload },
];

export function CrmLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-card border-r">
        <div className="p-6">
          <h2 className="text-xl font-bold">CRM & Billing</h2>
          <p className="text-sm text-muted-foreground mt-1">Customer & Revenue Management</p>
        </div>
        <nav className="px-3 space-y-1">
          {navigation.map((item) => (
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
  );
}
