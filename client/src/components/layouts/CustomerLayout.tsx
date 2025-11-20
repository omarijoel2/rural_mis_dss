import { Outlet } from 'react-router-dom';
import { ExpandableSidebar } from './ExpandableSidebar';

export function CustomerLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <ExpandableSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
