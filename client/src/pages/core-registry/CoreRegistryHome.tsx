import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export function CoreRegistryHome() {
  const modules = [
    {
      title: 'Map Console',
      description: 'Interactive GIS map with layers and spatial analysis',
      path: '/gis/map',
      icon: '🗺️',
      featured: true,
    },
    {
      title: 'Schemes',
      description: 'Water supply schemes and infrastructure',
      path: '/core/schemes',
      icon: '🏢',
    },
    {
      title: 'Facilities',
      description: 'Sources, treatment plants, pumps, reservoirs',
      path: '/core/facilities',
      icon: '🏗️',
    },
    {
      title: 'DMAs',
      description: 'District Metered Areas management',
      path: '/core/dmas',
      icon: '📊',
    },
    {
      title: 'Pipelines',
      description: 'Water distribution network',
      path: '/core/pipelines',
      icon: '🔧',
    },
    {
      title: 'Zones',
      description: 'Administrative zones and boundaries',
      path: '/core/zones',
      icon: '📍',
    },
    {
      title: 'Addresses',
      description: 'Geocoded address registry',
      path: '/core/addresses',
      icon: '📌',
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Rural Water Supply MIS</h1>
        <p className="text-lg text-muted-foreground">
          Management Information System & Decision Support System
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card 
            key={module.path} 
            className={`hover:shadow-lg transition-shadow ${
              module.featured ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300 dark:from-blue-950 dark:to-cyan-950 dark:border-blue-700' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{module.icon}</span>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {module.title}
                    {module.featured && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">NEW</span>
                    )}
                  </CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link to={module.path}>
                <Button className={`w-full ${module.featured ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
                  Open {module.title}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Quick actions to set up your water supply registry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>1. Define your water supply schemes</p>
            <p>2. Add facilities (sources, treatment plants, pumps)</p>
            <p>3. Map District Metered Areas (DMAs)</p>
            <p>4. Import or digitize pipeline network</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
