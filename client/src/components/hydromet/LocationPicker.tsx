import { useState, useCallback, useEffect } from 'react';
import Map, { Marker, NavigationControl, ScaleControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number | undefined, lon: number | undefined) => void;
}

export function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
  const [viewState, setViewState] = useState({
    longitude: longitude !== undefined ? longitude : 36.8219,
    latitude: latitude !== undefined ? latitude : -1.2921,
    zoom: 10,
  });

  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lon: number } | null>(
    latitude !== undefined && longitude !== undefined ? { lat: latitude, lon: longitude } : null
  );

  const [manualLat, setManualLat] = useState(latitude !== undefined ? latitude.toString() : '');
  const [manualLon, setManualLon] = useState(longitude !== undefined ? longitude.toString() : '');

  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      setMarkerPosition({ lat: latitude, lon: longitude });
      setViewState(prev => ({ ...prev, latitude, longitude }));
      setManualLat(latitude.toString());
      setManualLon(longitude.toString());
    }
  }, [latitude, longitude]);

  const handleMapClick = useCallback((event: any) => {
    const { lng, lat } = event.lngLat;
    setMarkerPosition({ lat, lon: lng });
    setManualLat(lat.toFixed(6));
    setManualLon(lng.toFixed(6));
    onLocationChange(lat, lng);
  }, [onLocationChange]);

  const handleManualUpdate = useCallback(() => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      setMarkerPosition({ lat, lon });
      setViewState(prev => ({ ...prev, latitude: lat, longitude: lon }));
      onLocationChange(lat, lon);
    }
  }, [manualLat, manualLon, onLocationChange]);

  const handleClear = useCallback(() => {
    setMarkerPosition(null);
    setManualLat('');
    setManualLon('');
    onLocationChange(undefined, undefined);
  }, [onLocationChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="manual-lat">Latitude</Label>
          <Input
            id="manual-lat"
            type="number"
            step="0.000001"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            placeholder="-1.286389"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manual-lon">Longitude</Label>
          <Input
            id="manual-lon"
            type="number"
            step="0.000001"
            value={manualLon}
            onChange={(e) => setManualLon(e.target.value)}
            placeholder="36.817223"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleManualUpdate}>
          Update from Coordinates
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleClear}>
          Clear Location
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Click map to set location</Label>
        <div style={{ height: '300px', width: '100%' }} className="rounded-lg overflow-hidden border">
          <Map
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            onClick={handleMapClick}
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
            style={{ width: '100%', height: '100%' }}
            cursor="crosshair"
          >
            <NavigationControl position="top-right" />
            <ScaleControl position="bottom-left" />

            {markerPosition && (
              <Marker
                longitude={markerPosition.lon}
                latitude={markerPosition.lat}
                anchor="bottom"
              >
                <MapPin className="h-8 w-8 text-red-500" fill="currentColor" />
              </Marker>
            )}
          </Map>
        </div>
      </div>
    </div>
  );
}
