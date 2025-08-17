"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  CheckSquare,
  Clock,
  MessageSquare,
  User,
  Calendar,
  Play,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Building2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import BottomNavigation from '../navigation/BottomNavigation';
import Link from 'next/link';

interface WorkspaceStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

interface RecentTask {
  id: string;
  title: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'awaiting_approval' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  partnerName: string;
}

interface RecentActivity {
  id: string;
  type: 'task_assigned' | 'task_completed' | 'message_received' | 'deadline_reminder';
  message: string;
  timestamp: Date;
  relatedPartner?: string;
}

// Mock data - replace with real data from Firebase/API
const mockStats: WorkspaceStats = {
  totalTasks: 12,
  completedTasks: 8,
  pendingTasks: 3,
  overdueTasks: 1
};

const mockRecentTasks: RecentTask[] = [
  {
    id: '1',
    title: 'Review website mockups',
    status: 'assigned',
    priority: 'high',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    partnerName: 'Acme Corp'
  },
  {
    id: '2',
    title: 'Update product documentation',
    status: 'in_progress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    partnerName: 'Acme Corp'
  },
  {
    id: '3',
    title: 'Test mobile app features',
    status: 'awaiting_approval',
    priority: 'medium',
    partnerName: 'TechStart Inc'
  }
];

const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'task_assigned',
    message: 'New task assigned: Review website mockups',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    relatedPartner: 'Acme Corp'
  },
  {
    id: '2',
    type: 'message_received',
    message: 'Sarah Chen sent you a message in General Discussion',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    relatedPartner: 'Acme Corp'
  },
  {
    id: '3',
    type: 'task_completed',
    message: 'Task completed: Prepare quarterly report',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    relatedPartner: 'TechStart Inc'
  },
  {
    id: '4',
    type: 'deadline_reminder',
    message: 'Reminder: Test mobile app features is due tomorrow',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    relatedPartner: 'TechStart Inc'
  }
];

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<WorkspaceStats>(mockStats);
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>(mockRecentTasks);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(mockRecentActivity);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'awaiting_approval':
        return <Badge className="bg-orange-100 text-orange-800">Awaiting Approval</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'assigned':
      default:
        return <Badge variant="secondary">Assigned</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return <CheckSquare className="w-4 h-4 text-blue-600" />;
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'message_received':
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case 'deadline_reminder':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${Math.floor(hours)}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Authentication Required</h2>
          <p className="text-gray-500">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <div className="p-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome back, {user.displayName || 'Worker'}!
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your tasks today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalTasks}</p>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completedTasks}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingTasks}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.overdueTasks}</p>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  Recent Tasks
                </CardTitle>
                <Link href="/worker/tasks">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      <CheckSquare className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <div className="flex gap-1">
                          {getStatusBadge(task.status)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Building2 className="w-3 h-3" />
                        <span>{task.partnerName}</span>
                        {task.dueDate && (
                          <>
                            <span>•</span>
                            <Calendar className="w-3 h-3" />
                            <span>Due {task.dueDate.toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {recentTasks.length === 0 && (
                  <div className="text-center py-6">
                    <CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-muted-foreground">No recent tasks</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.message}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{formatTimestamp(activity.timestamp)}</span>
                        {activity.relatedPartner && (
                          <>
                            <span>•</span>
                            <span>{activity.relatedPartner}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {recentActivity.length === 0 && (
                  <div className="text-center py-6">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/worker/tasks">
                <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <CheckSquare className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-medium">View Tasks</h3>
                  <p className="text-sm text-muted-foreground">See all your assigned tasks</p>
                </div>
              </Link>
              
              <Link href="/chat">
                <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <MessageSquare className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="font-medium">Open Chat</h3>
                  <p className="text-sm text-muted-foreground">Communicate with your team</p>
                </div>
              </Link>
              
              <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                <h3 className="font-medium">View Progress</h3>
                <p className="text-sm text-muted-foreground">Check your performance metrics</p>
              </div>
              
              <Link href="/worker/profile">
                <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <User className="w-8 h-8 text-orange-600 mb-2" />
                  <h3 className="font-medium">Update Profile</h3>
                  <p className="text-sm text-muted-foreground">Manage your account settings</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation userRole="employee" />
    </div>
  );
}
