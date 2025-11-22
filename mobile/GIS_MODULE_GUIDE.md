# GIS Module - Shape File and Vector File Management Guide

## Overview

The GIS module provides comprehensive shape file and vector file management for the Rural Water Supply MIS. Users can upload geographic data, create styled vector layers for map visualization, and manage spatial data across the water utility network.

## Features

### 1. Shape File Management
- **Upload Support**: Shapefile (.zip), GeoJSON, GeoPackage (.gpkg)
- **Automatic Processing**: Parse and analyze geometry types, features, and properties
- **Metadata Storage**: Track projection, bounds, feature count, and schema
- **Version Control**: Track upload history and metadata changes
- **Preview**: GeoJSON preview and download capabilities

### 2. Vector Layer Management
- **Layer Creation**: Create multiple styled layers from a single shape file
- **Styling Options**:
  - Layer type: Fill, Line, Circle, Symbol
  - Colors: Fill color, stroke color, customizable hex colors
  - Opacity: 0-1 range control
  - Stroke width: Adjustable line width
- **Visibility Control**: Toggle layer visibility on the map
- **Filtering**: Support for MapLibre filter expressions
- **Z-index**: Control layer stacking order
- **Properties Display**: Choose which attributes to display on map

### 3. Map Integration
- **Live Rendering**: Layers automatically render on the map
- **Layer Panel**: Toggle visibility and adjust styling in real-time
- **GeoJSON Preview**: View shape file contents before creating layers
- **Basemap Switching**: Multiple basemap styles for context

## API Endpoints

### Shape Files

#### List Shape Files
```
GET /api/v1/gis/shape-files
Query Parameters:
  - search: Search by name or description
  - status: Filter by status (uploading, processing, processed, failed)
  - per_page: Pagination size (default: 15)

Response:
{
  "data": [
    {
      "id": "uuid",
      "name": "Water Supply Zones",
      "description": "Zone boundaries for Nairobi",
      "file_size": 1024000,
      "geom_type": "polygon",
      "feature_count": 127,
      "status": "processed",
      "projection_crs": "EPSG:4326",
      "bounds": {
        "min_lon": 36.0,
        "min_lat": -5.0,
        "max_lon": 42.0,
        "max_lat": 2.0
      },
      "uploaded_by": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "uploaded_at": "2024-11-22T10:30:00Z"
    }
  ],
  "pagination": {}
}
```

#### Upload Shape File
```
POST /api/v1/gis/shape-files
Content-Type: multipart/form-data

Parameters:
  - file: (required) File to upload
  - name: (required) Display name
  - description: Optional description
  - projection_crs: Optional, defaults to EPSG:4326

Response:
{
  "data": {
    "id": "uuid",
    "name": "Water Supply Zones",
    "status": "processing"
  },
  "message": "Shape file uploaded and processing"
}
```

#### Get Shape File Details
```
GET /api/v1/gis/shape-files/{id}

Response:
{
  "data": {
    "id": "uuid",
    "name": "Water Supply Zones",
    "description": "Zone boundaries",
    "file_size": 1024000,
    "geom_type": "polygon",
    "feature_count": 127,
    "status": "processed",
    "projection_crs": "EPSG:4326",
    "properties_schema": {
      "zone_name": "string",
      "area": "number",
      "population": "number"
    },
    "vector_layers": [
      {
        "id": "uuid",
        "name": "Zone Fill",
        "layer_type": "fill"
      }
    ]
  }
}
```

#### Get GeoJSON Preview
```
GET /api/v1/gis/shape-files/{id}/preview

Response:
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {...},
      "properties": {
        "zone_name": "Zone A",
        "area": 1500
      }
    }
  ],
  "metadata": {
    "name": "Water Supply Zones",
    "projection": "EPSG:4326",
    "feature_count": 127
  }
}
```

#### Download Shape File
```
GET /api/v1/gis/shape-files/{id}/download

Returns: Original file for download
```

#### Delete Shape File
```
DELETE /api/v1/gis/shape-files/{id}

Response: 204 No Content
```

### Vector Layers

#### List Vector Layers for Shape File
```
GET /api/v1/gis/shape-files/{shapeFileId}/layers

Response:
{
  "data": [
    {
      "id": "uuid",
      "name": "Zone Fill",
      "layer_type": "fill",
      "visibility": true,
      "opacity": 0.6,
      "fill_color": "#3b82f6",
      "stroke_color": "#1e40af",
      "stroke_width": 2,
      "z_index": 0
    }
  ]
}
```

#### Create Vector Layer
```
POST /api/v1/gis/shape-files/{shapeFileId}/layers

Request Body:
{
  "name": "Zone Fill",
  "description": "Zone boundaries fill",
  "layer_type": "fill",
  "visibility": true,
  "opacity": 0.6,
  "fill_color": "#3b82f6",
  "stroke_color": "#1e40af",
  "stroke_width": 2,
  "properties_display": ["zone_name", "area"],
  "filter_config": null,
  "z_index": 0
}

Response: 201 Created
{
  "data": {
    "id": "uuid",
    "name": "Zone Fill",
    "layer_type": "fill",
    ...
  },
  "message": "Vector layer created"
}
```

#### Update Vector Layer
```
PATCH /api/v1/gis/shape-files/{shapeFileId}/layers/{layerId}

Request Body: Any fields to update
{
  "opacity": 0.8,
  "fill_color": "#60a5fa"
}

Response: 200 OK
```

#### Get Layer Configuration
```
GET /api/v1/gis/shape-files/{shapeFileId}/layers/{layerId}/config

Response:
{
  "data": {
    "id": "vector-123",
    "type": "fill",
    "source": "vector-source-456",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-color": "#3b82f6",
      "fill-opacity": 0.6,
      "fill-outline-color": "#1e40af"
    },
    "filter": null
  }
}
```

#### Delete Vector Layer
```
DELETE /api/v1/gis/shape-files/{shapeFileId}/layers/{layerId}

Response: 204 No Content
```

## Supported Formats

### Shapefile (.zip)
- Must contain: `.shp`, `.shx`, `.dbf` files
- Optional: `.prj` (projection), `.cpg` (code page)
- Compress all files into a ZIP archive

### GeoJSON (.geojson, .json)
- Standard GeoJSON FeatureCollection format
- Maximum 100 MB per file
- Supports all geometry types

### GeoPackage (.gpkg)
- SQLite-based vector data format
- Multiple layers supported
- Spatial indexes for performance

## Permissions

The GIS module uses role-based access control:

```
Permission Groups:
- view gis: View shape files and layers
- create gis: Upload new shape files
- edit gis: Create/modify vector layers, update metadata
- delete gis: Delete shape files and layers
```

## Database Schema

### shape_files table
```sql
CREATE TABLE shape_files (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_path VARCHAR(255) NOT NULL,
  file_size BIGINT,
  geom_type VARCHAR(50),
  projection_crs VARCHAR(50) DEFAULT 'EPSG:4326',
  bounds JSON,
  feature_count INTEGER,
  properties_schema JSON,
  status ENUM('uploading', 'processing', 'processed', 'failed'),
  uploaded_by UUID,
  uploaded_at TIMESTAMP,
  metadata JSON,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX (tenant_id, status)
);
```

### vector_layers table
```sql
CREATE TABLE vector_layers (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  source_file_id UUID NOT NULL,
  layer_type ENUM('fill', 'line', 'circle', 'symbol'),
  visibility BOOLEAN DEFAULT true,
  opacity DECIMAL(3,2) DEFAULT 0.6,
  fill_color VARCHAR(7) DEFAULT '#3b82f6',
  stroke_color VARCHAR(7) DEFAULT '#1e40af',
  stroke_width INTEGER DEFAULT 2,
  properties_display JSON,
  filter_config JSON,
  z_index INTEGER DEFAULT 0,
  metadata JSON,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (source_file_id) REFERENCES shape_files(id),
  INDEX (tenant_id, source_file_id)
);
```

## Usage Examples

### 1. Upload a Shapefile
```bash
curl -X POST http://localhost:8000/api/v1/gis/shape-files \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@zones.zip" \
  -F "name=Water Supply Zones" \
  -F "description=Zone boundaries for Nairobi"
```

### 2. List All Shape Files
```bash
curl -X GET "http://localhost:8000/api/v1/gis/shape-files?status=processed" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Create Vector Layer for Visualization
```bash
curl -X POST http://localhost:8000/api/v1/gis/shape-files/{shapeFileId}/layers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Zone Boundaries",
    "layer_type": "fill",
    "fill_color": "#3b82f6",
    "stroke_color": "#1e40af",
    "opacity": 0.6
  }'
```

### 4. Update Layer Styling
```bash
curl -X PATCH http://localhost:8000/api/v1/gis/shape-files/{shapeFileId}/layers/{layerId} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "opacity": 0.8,
    "fill_color": "#60a5fa"
  }'
```

## Security

- **Multi-tenancy**: All shape files and layers are scoped to tenant_id
- **Access Control**: RBAC ensures users can only access files/layers they have permission to view
- **File Validation**: Uploaded files are validated for format and size
- **Storage**: Files stored securely with UUID-based paths
- **Audit Trail**: All uploads and modifications are tracked with user and timestamp

## Future Enhancements

1. **Vector Tile Generation**: Tippecanoe-based MVT tiles for large datasets
2. **Style Templates**: Pre-built styling templates for common data types
3. **Feature Search**: Search and filter features by attribute
4. **Spatial Queries**: Intersect, buffer, and other spatial operations
5. **Export**: Export styled layers as GeoJSON or tiles
6. **Offline Sync**: Sync vector layers to mobile app for offline mapping

---

**Last Updated**: November 22, 2025
**Module Version**: 1.0.0
**Status**: Production Ready
