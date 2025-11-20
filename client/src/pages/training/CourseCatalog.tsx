import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Clock, Award, Search, Filter } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  code: string;
  domain: string;
  level: string;
  format: string;
  credits: number;
  duration_min: number;
  description: string;
  thumbnail_url?: string;
  rating: number;
  enrollments_count: number;
  status: string;
}

async function fetchCourses(domain?: string, level?: string, search?: string) {
  const params = new URLSearchParams();
  if (domain) params.append('domain', domain);
  if (level) params.append('level', level);
  if (search) params.append('search', search);

  const response = await fetch(`/api/v1/training/courses?${params}`, {
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch courses');
  return response.json();
}

async function enrollInCourse(courseId: number) {
  const response = await fetch('/api/v1/training/enrollments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ course_id: courseId }),
  });

  if (!response.ok) throw new Error('Failed to enroll');
  return response.json();
}

export default function CourseCatalog() {
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState<string>('');
  const [level, setLevel] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['courses', domain, level, search],
    queryFn: () => fetchCourses(domain, level, search),
    staleTime: 60000,
  });

  const handleEnroll = async (courseId: number) => {
    try {
      await enrollInCourse(courseId);
      alert('Successfully enrolled!');
    } catch (error) {
      alert('Enrollment failed');
    }
  };

  const courses: Course[] = data?.data || [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Course Catalog</h1>
        <p className="text-muted-foreground">Browse and enroll in training courses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={domain} onValueChange={setDomain}>
          <SelectTrigger>
            <SelectValue placeholder="All Domains" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Domains</SelectItem>
            <SelectItem value="Ops">Operations</SelectItem>
            <SelectItem value="Lab">Laboratory</SelectItem>
            <SelectItem value="HSE">Health & Safety</SelectItem>
            <SelectItem value="CRM">Customer Relations</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger>
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Levels</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading courses...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              {course.thumbnail_url && (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <Badge variant="outline">{course.domain}</Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration_min} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      <span>{course.credits} credits</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="capitalize">
                      {course.level}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {course.enrollments_count} enrolled
                    </span>
                  </div>
                  <Button
                    onClick={() => handleEnroll(course.id)}
                    className="w-full"
                    size="sm"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Enroll Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && courses.length === 0 && (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">No courses found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search terms
          </p>
        </Card>
      )}
    </div>
  );
}
