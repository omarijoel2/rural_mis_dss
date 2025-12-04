import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, Trash2, Download, Eye, Plus, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface ShapeFile {
  id: string;
  name: string;
  description?: string;
  file_size: number;
  geom_type: string;
  feature_count: number;
  status: 'uploading' | 'processing' | 'processed' | 'failed';
  projection_crs: string;
  bounds: any;
  uploaded_at: string;
  uploaded_by: {
    name: string;
    email: string;
  };
}

export function FileManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch shape files
  const { data: filesData = [], isLoading } = useQuery({
    queryKey: ['shape-files'],
    queryFn: async () => {
      const response = await apiClient.get('/gis/shape-files') as any;
      return response.data?.data || [];
    },
  });

  const uploadFileWithProgress = async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const fd = new FormData();
      fd.append('file', file);
      fd.append('name', formData.name || file.name);
      fd.append('description', formData.description);

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            resolve({ success: true });
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', '/api/v1/gis/shape-files');
      xhr.send(fd);
    });
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      setUploadProgress(0);
      return uploadFileWithProgress(file);
    },
    onSuccess: (data) => {
      setIsUploading(false);
      setUploadProgress(100);
      queryClient.invalidateQueries({ queryKey: ['shape-files'] });
      
      toast.success('Shapefile Uploaded Successfully', {
        description: `"${formData.name}" has been uploaded and is being processed.`,
        duration: 5000,
      });
      
      setTimeout(() => {
        setIsDialogOpen(false);
        setSelectedFile(null);
        setFormData({ name: '', description: '' });
        setUploadProgress(0);
      }, 500);
    },
    onError: (error: Error) => {
      setIsUploading(false);
      setUploadProgress(0);
      toast.error('Upload Failed', {
        description: error.message || 'Failed to upload shapefile. Please try again.',
        duration: 5000,
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/gis/shape-files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shape-files'] });
    },
  });

  const handleUpload = () => {
    if (selectedFile && formData.name) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      uploading: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      processed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Shape Files & Vector Layers</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Shape File
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Shape File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select File</Label>
                <Input
                  type="file"
                  accept=".zip,.shp,.geojson,.json,.gpkg"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="mt-1"
                  disabled={isUploading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supported: ZIP (Shapefile), GeoJSON, GPKG
                </p>
              </div>

              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Water Supply Zones"
                  disabled={isUploading}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                  disabled={isUploading}
                />
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="font-medium text-blue-600">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                  {uploadProgress === 100 && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Upload complete! Processing file...
                    </p>
                  )}
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !formData.name || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Uploading... {uploadProgress}%
                  </span>
                ) : (
                  'Upload'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading files...</p>
      ) : filesData.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No shape files uploaded yet</p>
      ) : (
        <div className="grid gap-4">
          {filesData.map((file: ShapeFile) => (
            <Card key={file.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{file.name}</CardTitle>
                    {file.description && (
                      <p className="text-sm text-gray-500 mt-1">{file.description}</p>
                    )}
                  </div>
                  {getStatusBadge(file.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Type</p>
                    <p className="font-medium">{file.geom_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Features</p>
                    <p className="font-medium">{file.feature_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Size</p>
                    <p className="font-medium">{formatFileSize(file.file_size)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Projection</p>
                    <p className="font-medium">{file.projection_crs}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Uploaded by</p>
                    <p className="font-medium">{file.uploaded_by.name}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {file.status === 'processed' && (
                    <>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 ml-auto text-red-600 hover:text-red-700"
                    onClick={() => deleteMutation.mutate(file.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
