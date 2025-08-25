"use client";

import React, { useState, useEffect } from 'react';
import { useMultiWorkspaceAuth } from '../../../hooks/use-multi-workspace-auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  Calendar,
  Users,
  Bell,
  Loader2,
  ArrowRight
} from 'lucide-react';
import EmployeeWorkspaceSwitcher from '../../../components/employee/EmployeeWorkspaceSwitcher';
import BottomNavigation from '../../../components/navigation/BottomNavigation';
import Link from 'next/link';
import { cn } from '../../../lib/utils';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  unreadMessages: number;
}

interface RecentActivity {
  id: string;
  type: 'task_assigned' | 'task_completed' | 'message_received' | 'deadline_reminder';
  message: string;
  timestamp: Date;
  partnerName: string;
}

// Mock data - replace with real Firebase data
const mockStats: DashboardStats = {
  totalTasks: 12,
  completedTasks: 8,
  pendingTasks: 3,
  overdueTasks: 1,
  unreadMessages: 5
};

const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'task_assigned',
    message: 'New task assigned: Review website mockups',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    partnerName: 'Acme Corp'
  },
  {
    id: '2',
    type: 'message_received',
    message: 'Sarah Chen sent you a message in Design Team',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    partnerName: 'Acme Corp'
  },
  {
    id: '3',
    type: 'task_completed',
    message: 'Task completed: Prepare quarterly report',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    partnerName: 'TechStart Inc'
  },
  {
    id: '4',
    type: 'deadline_reminder',
    message: 'Reminder: Test mobile app features is due tomorrow',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    partnerName: 'TechStart Inc'
  }
];

export default function EmployeeDashboard() {
  const { user, loading, currentWorkspace, availableWorkspaces, switchWorkspace } = useMultiWorkspaceAuth();
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(mockRecentActivity);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return <CheckSquare className="w-4 h-4 text-blue-600" />;
      case 'task_completed':
        return <CheckSquare className="w-4 h-4 text-green-600" />;
      case 'message_received':
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case 'deadline_reminder':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !currentWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Workspace Selected</h2>
          <p className="text-gray-500">Please select a workspace to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Header */}
      <div className="border-b bg-background">
        <EmployeeWorkspaceSwitcher
          workspaces={availableWorkspaces}
          currentWorkspace={currentWorkspace}
          onWorkspaceSwitch={switchWorkspace}
        />
      </div>

      <div className="p-4 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Employee'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening in your workspace today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Tasks</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.totalTasks}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Completed</p>
                  <p className="text-2xl font-bold text-green-800">{stats.completedTasks}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Pending</p>
                  <p className="text-2xl font-bold text-yellow-800">{stats.pendingTasks}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Overdue</p>
                  <p className="text-2xl font-bold text-red-800">{stats.overdueTasks}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/employee/tasks">
                  <div className="p-4 rounded-lg border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer">
                    <CheckSquare className="w-8 h-8 text-blue-600 mb-2" />
                    <h3 className="font-medium text-sm">View Tasks</h3>
                    <p className="text-xs text-muted-foreground">Manage assignments</p>
                  </div>
                </Link>
                
                <Link href="/employee/chat">
                  <div className="p-4 rounded-lg border border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50/50 transition-colors cursor-pointer">
                    <MessageSquare className="w-8 h-8 text-purple-600 mb-2" />
                    <h3 className="font-medium text-sm">Team Chat</h3>
                    <p className="text-xs text-muted-foreground">
                      {stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : 'Stay connected'}
                    </p>
                  </div>
                </Link>
                
                <div className="p-4 rounded-lg border border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50/50 transition-colors cursor-pointer">
                  <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="font-medium text-sm">Progress</h3>
                  <p className="text-xs text-muted-foreground">View metrics</p>
                </div>
                
                <Link href="/employee/profile">
                  <div className="p-4 rounded-lg border border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50/50 transition-colors cursor-pointer">
                    <Users className="w-8 h-8 text-orange-600 mb-2" />
                    <h3 className="font-medium text-sm">Profile</h3>
                    <p className="text-xs text-muted-foreground">Update settings</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {activity.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{activity.partnerName}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Workspace Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.pendingTasks}</div>
                <p className="text-sm text-muted-foreground">Tasks Due Today</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.completedTasks}</div>
                <p className="text-sm text-muted-foreground">Completed This Week</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{availableWorkspaces.length}</div>
                <p className="text-sm text-muted-foreground">Active Workspaces</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation userRole="employee" />
    </div>
  );
}