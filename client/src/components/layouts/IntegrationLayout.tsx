import { Outlet } from 'react-router-dom';
import { ExpandableSidebar } from './ExpandableSidebar';

export function IntegrationLayout() {
  return (
    <div className="flex h-screen bg-background">
      <ExpandableSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
