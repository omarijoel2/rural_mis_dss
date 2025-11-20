import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, Award, AlertCircle, CheckCircle2, Play } from 'lucide-react';

interface Enrollment {
  id: number;
  course: {
    id: number;
    title: string;
    code: string;
    domain: string;
    duration_min: number;
    credits: number;
  };
  status: string;
  progress_percent: number;
  started_at?: string;
  due_at?: string;
  completed_at?: string;
  final_score?: number;
}

async function fetchMyEnrollments() {
  const response = await fetch('/api/v1/training/my-enrollments', {
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch enrollments');
  return response.json();
}

export default function MyLearning() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: fetchMyEnrollments,
    staleTime: 30000,
  });

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  const inProgress = data?.in_progress || [];
  const enrolled = data?.enrolled || [];
  const completed = data?.completed || [];
  const overdue = data?.overdue || [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Learning</h1>
        <p className="text-muted-foreground">Track your training progress and certifications</p>
      </div>

      {overdue.length > 0 && (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Overdue Courses</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdue.map((enrollment: Enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{enrollment.course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(enrollment.due_at!).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" variant="destructive">
                    Continue
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="in-progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="in-progress">
            In Progress ({inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="enrolled">
            Not Started ({enrolled.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-4">
          {inProgress.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No courses in progress</p>
              <p className="text-sm text-muted-foreground">
                Start a course from your enrolled list
              </p>
            </Card>
          ) : (
            inProgress.map((enrollment: Enrollment) => (
              <Card key={enrollment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{enrollment.course.title}</CardTitle>
                      <CardDescription>{enrollment.course.domain} | {enrollment.course.code}</CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {enrollment.progress_percent}% Complete
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{enrollment.progress_percent}%</span>
                      </div>
                      <Progress value={enrollment.progress_percent} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{enrollment.course.duration_min} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          <span>{enrollment.course.credits} credits</span>
                        </div>
                      </div>
                      <Button size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Continue Learning
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-4">
          {enrolled.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No enrolled courses</p>
              <p className="text-sm text-muted-foreground">
                Browse the course catalog to enroll
              </p>
            </Card>
          ) : (
            enrolled.map((enrollment: Enrollment) => (
              <Card key={enrollment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{enrollment.course.title}</CardTitle>
                      <CardDescription>{enrollment.course.domain} | {enrollment.course.code}</CardDescription>
                    </div>
                    <Badge>Not Started</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{enrollment.course.duration_min} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        <span>{enrollment.course.credits} credits</span>
                      </div>
                    </div>
                    <Button size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Start Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completed.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No completed courses</p>
              <p className="text-sm text-muted-foreground">
                Complete your enrolled courses to earn certificates
              </p>
            </Card>
          ) : (
            completed.map((enrollment: Enrollment) => (
              <Card key={enrollment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{enrollment.course.title}</CardTitle>
                      <CardDescription>{enrollment.course.domain} | {enrollment.course.code}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                      {enrollment.final_score && (
                        <Badge variant="secondary">
                          Score: {enrollment.final_score}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Completed on {new Date(enrollment.completed_at!).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant="outline">
                      View Certificate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
