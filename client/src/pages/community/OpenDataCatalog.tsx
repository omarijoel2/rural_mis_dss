import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FolderOpen, Download, BarChart2, Globe, Search, FileJson, Code, ExternalLink, BookOpen, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Dataset {
  id: string;
  name: string;
  description: string;
  category: string;
  records: number;
  formats: string[];
  updated: string;
  downloads: number;
}

interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  parameters?: string[];
  example: string;
}

interface DataStory {
  id: string;
  title: string;
  description: string;
  insights: string[];
  relatedDatasets: string[];
  author: string;
}

const DATASETS: Dataset[] = [
  {
    id: 'committees',
    name: 'Committee Registry',
    description: 'Water committee locations, membership, and compliance metrics',
    category: 'Governance',
    records: 245,
    formats: ['CSV', 'JSON', 'GeoJSON'],
    updated: '2025-11-20',
    downloads: 342,
  },
  {
    id: 'water-facilities',
    name: 'Water Facilities',
    description: 'Treatment plants, pump stations, and storage facilities with operational status',
    category: 'Infrastructure',
    records: 1203,
    formats: ['CSV', 'GeoJSON', 'Shapefile'],
    updated: '2025-11-19',
    downloads: 521,
  },
  {
    id: 'water-kiosks',
    name: 'Water Kiosks & Outlets',
    description: 'Community water points with coverage and daily usage metrics',
    category: 'Services',
    records: 5847,
    formats: ['CSV', 'GeoJSON'],
    updated: '2025-11-18',
    downloads: 834,
  },
  {
    id: 'grievances',
    name: 'Community Grievances',
    description: 'Reported water quality, service interruptions, and billing complaints',
    category: 'Community',
    records: 3421,
    formats: ['CSV', 'JSON'],
    updated: '2025-11-20',
    downloads: 189,
  },
  {
    id: 'vendors',
    name: 'Vendor Directory',
    description: 'Approved service providers with KYC status and performance ratings',
    category: 'Procurement',
    records: 87,
    formats: ['CSV', 'JSON'],
    updated: '2025-11-17',
    downloads: 156,
  },
  {
    id: 'water-quality',
    name: 'Water Quality Data',
    description: 'Monthly testing results for chlorine, pH, turbidity, and contaminants',
    category: 'Quality',
    records: 12456,
    formats: ['CSV', 'JSON'],
    updated: '2025-11-20',
    downloads: 421,
  },
];

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    path: '/api/v1/datasets/committees',
    method: 'GET',
    description: 'Get all committees with metadata',
    parameters: ['limit', 'offset', 'status'],
    example: 'curl -H "Authorization: Bearer KEY" /api/v1/datasets/committees?limit=50',
  },
  {
    path: '/api/v1/datasets/facilities',
    method: 'GET',
    description: 'Get water facilities by location or status',
    parameters: ['latitude', 'longitude', 'radius', 'type'],
    example: 'curl /api/v1/datasets/facilities?latitude=-1.29&longitude=36.82&radius=10',
  },
  {
    path: '/api/v1/datasets/grievances',
    method: 'GET',
    description: 'Query grievances by category, severity, or location',
    parameters: ['category', 'severity', 'status', 'startDate', 'endDate'],
    example: 'curl /api/v1/datasets/grievances?category=water-quality&severity=high',
  },
  {
    path: '/api/v1/datasets/export',
    method: 'POST',
    description: 'Export dataset in requested format',
    parameters: ['datasetId', 'format', 'filters'],
    example: 'curl -X POST /api/v1/datasets/export -d \'{"datasetId":"committees","format":"csv"}\'',
  },
  {
    path: '/api/v1/maps/tiles/{layer}/{z}/{x}/{y}',
    method: 'GET',
    description: 'Vector tile endpoint for map rendering',
    parameters: ['layer', 'z', 'x', 'y'],
    example: '/api/v1/maps/tiles/facilities/8/140/84',
  },
  {
    path: '/api/v1/datasets/{id}/preview',
    method: 'GET',
    description: 'Get sample records from a dataset',
    parameters: ['id', 'limit'],
    example: 'curl /api/v1/datasets/water-quality/preview?limit=10',
  },
];

const DATA_STORIES: DataStory[] = [
  {
    id: 'story-1',
    title: 'Water Access Gaps in ASAL Counties',
    description: 'Analysis of coverage disparities showing which underserved areas lack reliable water access',
    insights: [
      '23% of rural population >5km from nearest water point',
      'Average wait time 2.3 hours during dry season',
      'Seasonal variation in service availability',
    ],
    relatedDatasets: ['water-kiosks', 'water-facilities'],
    author: 'Water Supply Team',
  },
  {
    id: 'story-2',
    title: 'Committee Performance & Compliance',
    description: 'Study of governance effectiveness across committees and impact on service delivery',
    insights: [
      'High-compliance committees have 18% better water quality',
      '87% of compliant committees meet reporting deadlines',
      'Training programs improve compliance by 34%',
    ],
    relatedDatasets: ['committees', 'water-quality'],
    author: 'Governance Division',
  },
  {
    id: 'story-3',
    title: 'Seasonal Water Quality Trends',
    description: 'Temporal patterns in water quality metrics showing seasonal contamination risks',
    insights: [
      'Peak contamination in rainy season (+45%)',
      'Chlorine residual drops 12% during peak demand',
      'pH varies by 1.2 units across seasons',
    ],
    relatedDatasets: ['water-quality'],
    author: 'Water Quality Lab',
  },
  {
    id: 'story-4',
    title: 'Grievance Resolution Effectiveness',
    description: 'Metrics on complaint handling time and resolution rates by complaint type',
    insights: [
      'Avg resolution time: 12.5 days',
      'Water quality complaints resolved 2x faster',
      'Digital reporting reduced wait time by 40%',
    ],
    relatedDatasets: ['grievances'],
    author: 'Customer Service',
  },
];

export function OpenDataCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('discover');

  const filteredDatasets = useMemo(() => {
    return DATASETS.filter(ds => {
      const matchesSearch = ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ds.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || ds.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const categories = useMemo(() => Array.from(new Set(DATASETS.map(d => d.category))), []);
  const totalDownloads = DATASETS.reduce((sum, d) => sum + d.downloads, 0);
  const totalRecords = DATASETS.reduce((sum, d) => sum + d.records, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Open Data & Transparency</h1>
          <p className="text-muted-foreground mt-1">Public datasets, APIs, maps, and transparency stories</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public Datasets</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{DATASETS.length}</div>
            <p className="text-xs text-muted-foreground">Available for download</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownloads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.4K</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalRecords / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">Records available</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="api">API Docs</TabsTrigger>
          <TabsTrigger value="stories">Stories</TabsTrigger>
          <TabsTrigger value="maps">Maps</TabsTrigger>
        </TabsList>

        {/* Dataset Discovery Tab */}
        <TabsContent value="discover" className="space-y-4">
          {/* Search & Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search datasets..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dataset Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredDatasets.map(dataset => (
              <Card key={dataset.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-base">{dataset.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{dataset.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-2">{dataset.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Records:</span>
                      <div className="font-medium">{(dataset.records / 1000).toFixed(1)}K</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Updated:</span>
                      <div className="font-medium">{dataset.updated}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Downloads:</span>
                      <div className="font-medium">{dataset.downloads}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dataset.formats.map(fmt => (
                      <Badge key={fmt} variant="secondary" className="text-xs">{fmt}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="h-3 w-3 mr-1" /> Download
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <FileJson className="h-3 w-3 mr-1" /> Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDatasets.length === 0 && (
            <Card className="text-center py-8">
              <p className="text-muted-foreground">No datasets match your search</p>
            </Card>
          )}
        </TabsContent>

        {/* API Documentation Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                API Documentation
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">RESTful API endpoints for data access</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded font-mono text-xs">
                <p><span className="text-blue-600">Base URL:</span> https://api.water-mis.go.ke/v1</p>
                <p><span className="text-blue-600">Auth:</span> Bearer token required for all endpoints</p>
              </div>
            </CardContent>
          </Card>

          {/* Endpoint Cards */}
          <div className="space-y-3">
            {API_ENDPOINTS.map((endpoint, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono flex-1 text-muted-foreground">{endpoint.path}</code>
                  </div>
                  <p className="text-sm mt-2">{endpoint.description}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {endpoint.parameters && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Parameters:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {endpoint.parameters.map(param => (
                          <Badge key={param} variant="outline" className="text-xs">{param}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Example:</p>
                    <code className="text-xs bg-muted p-2 rounded block mt-1 overflow-auto">
                      {endpoint.example}
                    </code>
                  </div>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-3 w-3 mr-1" /> Full Docs
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* API Key Section */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm">Get API Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Request an API key to integrate data into your applications</p>
              <Button>Request API Key</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Stories Tab */}
        <TabsContent value="stories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {DATA_STORIES.map(story => (
              <Card key={story.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <CardTitle className="text-base">{story.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{story.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Key Insights:</p>
                    <ul className="space-y-1">
                      {story.insights.map((insight, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground">• {insight}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Related Datasets:</p>
                    <div className="flex flex-wrap gap-1">
                      {story.relatedDatasets.map(dsId => {
                        const ds = DATASETS.find(d => d.id === dsId);
                        return ds ? (
                          <Badge key={dsId} variant="outline" className="text-xs">{ds.name}</Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <p className="text-xs text-muted-foreground">By {story.author}</p>
                    <Button size="sm" variant="ghost">Read Full Story</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Maps Tab */}
        <TabsContent value="maps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Interactive Public Maps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex flex-col">
                  <div className="text-base font-medium">Committee Locations</div>
                  <p className="text-xs text-muted-foreground">245 committees mapped</p>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <div className="text-base font-medium">Water Facilities</div>
                  <p className="text-xs text-muted-foreground">1,203 infrastructure points</p>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <div className="text-base font-medium">Service Coverage</div>
                  <p className="text-xs text-muted-foreground">Population access areas</p>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <div className="text-base font-medium">Quality Monitoring</div>
                  <p className="text-xs text-muted-foreground">Test site locations</p>
                </Button>
              </div>
              <div className="pt-4 border-t">
                <Button className="w-full" size="lg">
                  <Globe className="h-4 w-4 mr-2" /> Open Public Maps
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
