import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { FileText, Plus, Download, Lock, Eye, Trash2, History, Clock } from 'lucide-react';

export function EdRmsPage() {
  const [documents] = useState([
    {
      id: 1,
      title: 'Water Supply Service Agreement 2025',
      type: 'contract',
      size: '2.4 MB',
      status: 'active',
      version: 3,
      createdDate: '2025-11-01',
      modifiedDate: '2025-11-20',
      retention: '7 years',
    },
    {
      id: 2,
      title: 'Operational Procedures Manual',
      type: 'procedure',
      size: '5.8 MB',
      status: 'active',
      version: 5,
      createdDate: '2025-06-15',
      modifiedDate: '2025-11-18',
      retention: '5 years',
    },
    {
      id: 3,
      title: 'Q3 Financial Audit Report',
      type: 'report',
      size: '1.2 MB',
      status: 'archived',
      version: 1,
      createdDate: '2025-10-01',
      modifiedDate: '2025-10-15',
      retention: '10 years',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contract':
        return 'bg-blue-100 text-blue-800';
      case 'report':
        return 'bg-green-100 text-green-800';
      case 'policy':
        return 'bg-purple-100 text-purple-800';
      case 'procedure':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Electronic Document Records Management</h1>
        <p className="text-muted-foreground">Centralized document control with version history and compliance</p>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="retention">Retention Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Document Library</h2>
              <p className="text-sm text-muted-foreground">{filteredDocs.length} documents found</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>

          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />

          <div className="space-y-2">
            {filteredDocs.map(doc => (
              <Card key={doc.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.size}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">TYPE</p>
                      <Badge className={`mt-1 ${getTypeColor(doc.type)}`}>{doc.type}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">VERSION</p>
                      <p className="font-medium mt-1">v{doc.version}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">MODIFIED</p>
                      <p className="text-sm mt-1">{new Date(doc.modifiedDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">RETENTION</p>
                      <p className="text-sm mt-1">{doc.retention}</p>
                    </div>
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost"><History className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <h2 className="text-lg font-semibold">Retention Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Short Term (1-2 Years)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">• Meeting minutes</p>
                <p className="text-sm">• Internal memos</p>
                <p className="text-sm">• Draft documents</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Medium Term (5-7 Years)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">• Contracts</p>
                <p className="text-sm">• Procedures</p>
                <p className="text-sm">• Operational reports</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Long Term (10+ Years)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">• Financial audits</p>
                <p className="text-sm">• Compliance records</p>
                <p className="text-sm">• Strategic plans</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
