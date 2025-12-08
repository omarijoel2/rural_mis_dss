import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function GISSettingsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">GIS Settings</h1>
        <p className="text-gray-600">Configure GIS module settings and defaults</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Default Projection</h4>
              <p className="text-sm text-gray-600">EPSG:4326 (WGS84 - Latitude/Longitude)</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Supported Formats</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Shapefile (.zip containing .shp, .shx, .dbf)</li>
                <li>• GeoJSON (.geojson, .json)</li>
                <li>• GeoPackage (.gpkg)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Maximum File Size</h4>
              <p className="text-sm text-gray-600">100 MB per file</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
