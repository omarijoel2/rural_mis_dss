import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Target, TrendingUp, Award, Users } from 'lucide-react';

interface Skill {
  id: number;
  code: string;
  name: string;
  category: string;
  levels: string[];
}

interface EmployeeSkill {
  user: {
    id: number;
    name: string;
  };
  level_index: number;
  level_name: string;
  assessed_at: string;
}

async function fetchSkillsMatrix() {
  const response = await fetch('/api/v1/training/skills/matrix', {
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch skills matrix');
  return response.json();
}

async function fetchEmployeeSkills(userId?: number) {
  const params = new URLSearchParams();
  if (userId) params.append('user_id', userId.toString());

  const response = await fetch(`/api/v1/training/employee-skills?${params}`, {
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch employee skills');
  return response.json();
}

export default function SkillsMatrix() {
  const [view, setView] = useState<'matrix' | 'individual'>('matrix');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: matrixData, isLoading: loadingMatrix } = useQuery({
    queryKey: ['skills-matrix'],
    queryFn: fetchSkillsMatrix,
    enabled: view === 'matrix',
    staleTime: 60000,
  });

  const { data: individualSkills, isLoading: loadingIndividual } = useQuery({
    queryKey: ['employee-skills'],
    queryFn: () => fetchEmployeeSkills(),
    enabled: view === 'individual',
    staleTime: 60000,
  });

  const getLevelBadge = (levelIndex: number) => {
    const colors = [
      'bg-red-100 text-red-800',
      'bg-yellow-100 text-yellow-800',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
    ];
    return colors[levelIndex] || colors[0];
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Skills Matrix</h1>
        <p className="text-muted-foreground">
          Track and assess employee competencies
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant={view === 'matrix' ? 'default' : 'outline'}
            onClick={() => setView('matrix')}
          >
            <Users className="h-4 w-4 mr-2" />
            Team Matrix
          </Button>
          <Button
            variant={view === 'individual' ? 'default' : 'outline'}
            onClick={() => setView('individual')}
          >
            <Target className="h-4 w-4 mr-2" />
            My Skills
          </Button>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="customer">Customer Service</SelectItem>
            <SelectItem value="leadership">Leadership</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {view === 'matrix' && (
        <>
          {loadingMatrix ? (
            <div className="text-center py-12">Loading matrix...</div>
          ) : (
            <div className="space-y-6">
              {matrixData?.map((item: any) => {
                const skill: Skill = item.skill;
                const employees: EmployeeSkill[] = item.employees;

                if (selectedCategory !== 'all' && skill.category !== selectedCategory) {
                  return null;
                }

                return (
                  <Card key={skill.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{skill.name}</CardTitle>
                          <CardDescription>{skill.code}</CardDescription>
                        </div>
                        <Badge variant="outline">{skill.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          {skill.levels.map((level, index) => (
                            <Badge key={index} className={getLevelBadge(index)}>
                              {level}
                            </Badge>
                          ))}
                        </div>
                        {employees.length > 0 ? (
                          <div className="space-y-2">
                            {employees.map((emp, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 border rounded-md"
                              >
                                <span className="font-medium">{emp.user.name}</span>
                                <div className="flex items-center gap-3">
                                  <Badge className={getLevelBadge(emp.level_index)}>
                                    {emp.level_name}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    Assessed: {new Date(emp.assessed_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No employees assessed for this skill
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {view === 'individual' && (
        <>
          {loadingIndividual ? (
            <div className="text-center py-12">Loading your skills...</div>
          ) : individualSkills && individualSkills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {individualSkills.map((empSkill: any) => (
                <Card key={empSkill.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{empSkill.skill.name}</CardTitle>
                    <CardDescription>{empSkill.skill.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Current Level</p>
                        <Badge className={getLevelBadge(empSkill.level_index)}>
                          {empSkill.skill.levels[empSkill.level_index]}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Assessed: {new Date(empSkill.assessed_at).toLocaleDateString()}
                        </p>
                        {empSkill.assessor && (
                          <p className="text-sm text-muted-foreground">
                            By: {empSkill.assessor.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No skills assessed</p>
              <p className="text-sm text-muted-foreground">
                Contact your supervisor to get your skills assessed
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
