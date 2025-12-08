import { FileManager } from '@/components/gis/FileManager';

export function GISFilesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Files & Layers</h1>
        <p className="text-gray-600">Manage shape files, GeoJSON files, and vector layers</p>
      </div>
      <FileManager />
    </div>
  );
}
