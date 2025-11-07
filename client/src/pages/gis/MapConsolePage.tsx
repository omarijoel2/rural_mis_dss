import { MapConsole } from '@/components/gis/MapConsole';

export function MapConsolePage() {
  return (
    <div className="h-screen w-full flex flex-col">
      <div className="flex-1">
        <MapConsole />
      </div>
    </div>
  );
}
