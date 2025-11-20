import { Outlet } from 'react-router-dom';
import { ExpandableSidebar } from './ExpandableSidebar';

export function TrainingLayout() {
  return (
    <div className="flex h-screen bg-background">
      <ExpandableSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
