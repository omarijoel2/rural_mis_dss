import { useState } from 'react';
import { MapConsole } from '@/components/gis/MapConsole';
import { FileManager } from '@/components/gis/FileManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Map, FileJson, Settings } from 'lucide-react';

export function GISPage() {
  const [activeTab, setActiveTab] = useState('map');

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="border-b bg-white p-4">
        <h1 className="text-2xl font-bold">GIS Module</h1>
        <p className="text-gray-600">Manage shape files, vector layers, and spatial data</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="px-4 pt-4 w-full justify-start border-b bg-white">
          <TabsTrigger value="map" className="gap-2">
            <Map className="w-4 h-4" />
            Map Console
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-2">
            <FileJson className="w-4 h-4" />
            Files & Layers
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="flex-1">
          <div className="h-full">
            <MapConsole />
          </div>
        </TabsContent>

        <TabsContent value="files" className="flex-1 overflow-auto">
          <div className="p-6">
            <FileManager />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 overflow-auto">
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>GIS Settings</CardTitle>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
