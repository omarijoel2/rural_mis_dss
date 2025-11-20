import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ThumbsUp, ThumbsDown, Eye, FileText, TrendingUp } from 'lucide-react';

interface KbArticle {
  id: number;
  title: string;
  category: string;
  tags: string[];
  content: string;
  views_count: number;
  helpful_count: number;
  not_helpful_count: number;
  published_at: string;
  author: {
    name: string;
  };
}

async function fetchArticles(category?: string, search?: string) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);

  const response = await fetch(`/api/v1/training/kb?${params}`, {
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch articles');
  return response.json();
}

async function fetchPopularArticles() {
  const response = await fetch('/api/v1/training/kb/popular', {
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch popular articles');
  return response.json();
}

export default function KnowledgeBase() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['kb-articles', category, search],
    queryFn: () => fetchArticles(category, search),
    staleTime: 60000,
  });

  const { data: popularArticles } = useQuery({
    queryKey: ['kb-popular'],
    queryFn: fetchPopularArticles,
    staleTime: 300000,
  });

  const articles: KbArticle[] = articlesData?.data || [];
  const popular: KbArticle[] = popularArticles || [];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'Assets', label: 'Assets' },
    { value: 'Treatment', label: 'Treatment' },
    { value: 'Safety', label: 'Safety' },
    { value: 'Customer', label: 'Customer' },
    { value: 'Finance', label: 'Finance' },
    { value: 'IT', label: 'IT' },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Browse articles, guides, and documentation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search knowledge base..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={category} onValueChange={setCategory}>
            <TabsList className="w-full justify-start overflow-x-auto">
              {categories.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value}>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="text-center py-12">Loading articles...</div>
          ) : articles.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No articles found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or category filter
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                        <CardDescription>
                          By {article.author.name} •{' '}
                          {new Date(article.published_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{article.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.content.substring(0, 200)}...
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{article.views_count} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{article.helpful_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsDown className="h-4 w-4" />
                          <span>{article.not_helpful_count}</span>
                        </div>
                      </div>
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {article.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Popular Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popular.slice(0, 5).map((article) => (
                  <div
                    key={article.id}
                    className="pb-3 border-b last:border-0 last:pb-0 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                  >
                    <p className="font-medium text-sm line-clamp-2 mb-1">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>{article.views_count} views</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Can't find what you're looking for?
              </p>
              <Button className="w-full" variant="outline">
                Submit a Question
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
