'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Clock, AlertTriangle, MessageCircle, Users, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { TeamMembersWithChat } from '@/components/employee/TeamMembersWithChat';
import Link from 'next/link';

export default function EmployeeDashboard() {
  const { user } = useAuth();

  // Mock data - replace with real data from your backend
  const stats = {
    activeTasks: 3,
    completedTasks: 12,
    overdueTasks: 1,
    teamMembers: 8
  };

  const recentTasks = [
    {
      id: '1',
      title: 'Review website mockups',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    },
    {
      id: '2',
      title: 'Update product documentation',
      status: 'assigned',
      priority: 'medium',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    },
    {
      id: '3',
      title: 'Test mobile app features',
      status: 'completed',
      priority: 'medium',
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'assigned':
        return 'bg-yellow-500';
      case 'overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.displayName || user?.email || 'Employee'}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your work today.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/employee/chat">
              <MessageCircle className="mr-2 h-4 w-4" />
              Team Chat
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/employee/tasks">
              <CheckSquare className="mr-2 h-4 w-4" />
              View All Tasks
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTasks}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks completed this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">Needs immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">Available for collaboration</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Due {task.dueDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/employee/tasks">View All Tasks</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" asChild>
              <Link href="/employee/chat">
                <MessageCircle className="mr-2 h-4 w-4" />
                Start Team Chat
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/employee/tasks">
                <CheckSquare className="mr-2 h-4 w-4" />
                View My Tasks
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/employee/notifications">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Check Notifications
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/employee/profile">
                <Users className="mr-2 h-4 w-4" />
                Update Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Section */}
      <div className="grid gap-6">
        <TeamMembersWithChat showChatActions={true} />
      </div>
    </div>
  );
}