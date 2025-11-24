import { Outlet } from 'react-router-dom';
import { ExpandableSidebar } from './ExpandableSidebar';

export function RiskComplianceLayout() {
  return (
    <div className="flex min-h-screen">
      <ExpandableSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
