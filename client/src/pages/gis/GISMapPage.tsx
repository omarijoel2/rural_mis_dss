import { MapConsole } from '@/components/gis/MapConsole';

export function GISMapPage() {
  return (
    <div className="h-[calc(100vh-0px)] w-full flex flex-col">
      <div className="border-b bg-white p-4">
        <h1 className="text-2xl font-bold">Map Console</h1>
        <p className="text-gray-600">Interactive map viewer with layer management</p>
      </div>
      <div className="flex-1">
        <MapConsole />
      </div>
    </div>
  );
}
