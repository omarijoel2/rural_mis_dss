import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X, Eye, MapPin, Pencil, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SpatialEdit {
  id: string;
  layer_name: string;
  description: string;
  change_type: 'create' | 'update' | 'delete';
  status: 'draft' | 'review' | 'approved' | 'rejected';
  user: { name: string; email: string };
  created_at: string;
  submitted_at?: string;
  redlines: Redline[];
}

interface Redline {
  id: string;
  feature_type: string;
  operation_type: 'create' | 'update' | 'delete';
  geometry: any;
  properties: Record<string, any>;
  notes?: string;
  status: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

async function fetchSpatialEdits(status?: string): Promise<SpatialEdit[]> {
  const allEdits: SpatialEdit[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = status 
      ? `/api/v1/gis/edits?status=${status}&page=${page}`
      : `/api/v1/gis/edits?page=${page}`;
    
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch spatial edits');
    
    const result: PaginatedResponse<SpatialEdit> = await response.json();
    allEdits.push(...result.data);
    
    hasMore = result.current_page < result.last_page;
    page++;
  }

  return allEdits;
}

async function approveSpatialEdit(id: string, notes: string) {
  const response = await fetch(`/api/v1/gis/edits/${id}/approve`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!response.ok) throw new Error('Failed to approve edit');
  return response.json();
}

async function rejectSpatialEdit(id: string, notes: string) {
  const response = await fetch(`/api/v1/gis/edits/${id}/reject`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!response.ok) throw new Error('Failed to reject edit');
  return response.json();
}

export function RedlineReviewQueue() {
  const [selectedEdit, setSelectedEdit] = useState<SpatialEdit | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: pendingEdits, isLoading: loadingPending, error: errorPending } = useQuery({
    queryKey: ['spatial-edits', 'review'],
    queryFn: () => fetchSpatialEdits('review'),
    staleTime: 30000,
  });

  const { data: draftEdits, isLoading: loadingDraft, error: errorDraft } = useQuery({
    queryKey: ['spatial-edits', 'draft'],
    queryFn: () => fetchSpatialEdits('draft'),
    staleTime: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => 
      approveSpatialEdit(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spatial-edits'] });
      setSelectedEdit(null);
      setReviewNotes('');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => 
      rejectSpatialEdit(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spatial-edits'] });
      setSelectedEdit(null);
      setReviewNotes('');
    },
  });

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'create': return <MapPin className="w-4 h-4" />;
      case 'update': return <Pencil className="w-4 h-4" />;
      case 'delete': return <Trash2 className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'review': return 'bg-blue-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spatial Edits Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="review">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="review">
                Pending Review ({pendingEdits?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="draft">
                Drafts ({draftEdits?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="review" className="mt-4">
              <ScrollArea className="h-[500px]">
                {loadingPending ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : errorPending ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Failed to load pending edits. Please try again.
                    </AlertDescription>
                  </Alert>
                ) : pendingEdits?.length === 0 ? (
                  <Alert>
                    <AlertDescription>No edits pending review</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {pendingEdits?.map((edit) => (
                      <Card
                        key={edit.id}
                        className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          selectedEdit?.id === edit.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedEdit(edit)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getOperationIcon(edit.change_type)}
                              <span className="font-semibold">{edit.layer_name}</span>
                            </div>
                            <Badge className={getStatusColor(edit.status)}>
                              {edit.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {edit.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>By: {edit.user?.name}</span>
                            <span>{edit.redlines?.length || 0} redlines</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="draft" className="mt-4">
              <ScrollArea className="h-[500px]">
                {loadingDraft ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : errorDraft ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Failed to load draft edits. Please try again.
                    </AlertDescription>
                  </Alert>
                ) : draftEdits?.length === 0 ? (
                  <Alert>
                    <AlertDescription>No draft edits</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {draftEdits?.map((edit) => (
                      <Card
                        key={edit.id}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setSelectedEdit(edit)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getOperationIcon(edit.change_type)}
                              <span className="font-semibold">{edit.layer_name}</span>
                            </div>
                            <Badge className={getStatusColor(edit.status)}>
                              {edit.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {edit.description || 'No description'}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Review Details</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedEdit ? (
            <div className="text-center py-12 text-gray-500">
              Select an edit to review
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{selectedEdit.layer_name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedEdit.description}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Operation:</span>
                  <Badge className="ml-2" variant="outline">
                    {selectedEdit.change_type}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <Badge className={`ml-2 ${getStatusColor(selectedEdit.status)}`}>
                    {selectedEdit.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500">Submitted by:</span>
                  <p className="font-medium">{selectedEdit.user?.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Redlines:</span>
                  <p className="font-medium">{selectedEdit.redlines?.length || 0}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold mb-2">Redlines</h4>
                <ScrollArea className="h-40">
                  <div className="space-y-2">
                    {selectedEdit.redlines?.map((redline, index) => (
                      <div
                        key={redline.id}
                        className="p-2 rounded bg-gray-50 dark:bg-gray-800 text-sm"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {getOperationIcon(redline.operation_type)}
                          <span className="font-medium">{redline.feature_type}</span>
                        </div>
                        {redline.notes && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {redline.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {selectedEdit.status === 'review' && (
                <>
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Review Notes
                    </label>
                    <Textarea
                      placeholder="Add notes about this review..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => 
                        approveMutation.mutate({ 
                          id: selectedEdit.id, 
                          notes: reviewNotes 
                        })
                      }
                      disabled={approveMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => 
                        rejectMutation.mutate({ 
                          id: selectedEdit.id, 
                          notes: reviewNotes 
                        })
                      }
                      disabled={!reviewNotes || rejectMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
