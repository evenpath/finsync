// src/app/employee/page.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  Building2,
  Briefcase,
  Bell,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import WorkspacesList from '@/components/employee/WorkspacesList';

const StatCard = ({ title, value, icon: Icon, description, trend }: {
  title: string;
  value: string;
  icon: any;
  description: string;
  trend?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">
        {description}
        {trend && (
          <span className="text-green-600 ml-1">{trend}</span>
        )}
      </p>
    </CardContent>
  </Card>
);

const RecentActivity = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Bell className="w-5 h-5" />
        Recent Activity
      </CardTitle>
      <CardDescription>Your latest workflow and task updates</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[
          {
            type: 'workflow',
            title: 'Customer Onboarding Flow',
            status: 'completed',
            time: '2 hours ago',
            icon: CheckCircle,
            iconColor: 'text-green-600'
          },
          {
            type: 'task',
            title: 'Review Support Tickets',
            status: 'in_progress',
            time: '4 hours ago',
            icon: Clock,
            iconColor: 'text-yellow-600'
          },
          {
            type: 'workflow',
            title: 'Invoice Processing',
            status: 'pending',
            time: '1 day ago',
            icon: Calendar,
            iconColor: 'text-blue-600'
          }
        ].map((activity, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
            <div className="flex-1">
              <div className="font-medium">{activity.title}</div>
              <div className="text-sm text-gray-500">{activity.time}</div>
            </div>
            <Badge 
              variant={activity.status === 'completed' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {activity.status.replace('_', ' ')}
            </Badge>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function EmployeeDashboard() {
  const { user } = useAuth();

  const currentWorkspace = user?.customClaims ? {
    partnerName: user.customClaims.partnerName || user.displayName || 'Current Workspace',
    role: user.customClaims.role,
    partnerId: user.customClaims.activePartnerId || user.customClaims.partnerId
  } : null;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.displayName || 'Employee'}!
          </h1>
          {currentWorkspace && (
            <p className="text-gray-600 mt-1">
              You're working in{' '}
              <span className="font-medium">{currentWorkspace.partnerName}</span>{' '}
              as {currentWorkspace.role === 'partner_admin' ? 'an Admin' : 'an Employee'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <span className="text-sm text-gray-600">
            {currentWorkspace?.partnerId || 'No workspace'}
          </span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tasks Completed"
          value="24"
          icon={CheckCircle}
          description="This month"
          trend="+12%"
        />
        <StatCard
          title="Active Workflows"
          value="8"
          icon={Briefcase}
          description="Currently running"
        />
        <StatCard
          title="Team Members"
          value="12"
          icon={Users}
          description="In your workspace"
        />
        <StatCard
          title="Efficiency Score"
          value="94%"
          icon={TrendingUp}
          description="Last 30 days"
          trend="+5%"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <RecentActivity />

        {/* Workspaces List */}
        <WorkspacesList />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Start Workflow', icon: Briefcase, color: 'bg-blue-500' },
              { name: 'View Tasks', icon: CheckCircle, color: 'bg-green-500' },
              { name: 'Team Chat', icon: Users, color: 'bg-purple-500' },
              { name: 'Reports', icon: TrendingUp, color: 'bg-orange-500' }
            ].map((action, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className={`w-12 h-12 ${action.color} text-white rounded-lg flex items-center justify-center mb-2`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">{action.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Need Help?</CardTitle>
          <CardDescription className="text-blue-700">
            Get started with our platform or contact support
          </CardDescription>
        </CardHeader>
        <CardContent className="text-blue-800">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <h4 className="font-medium mb-2">📚 Documentation</h4>
              <p className="text-sm">Learn how to use workflows and features</p>
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-2">💬 Support Chat</h4>
              <p className="text-sm">Get instant help from our support team</p>
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-2">🎓 Training</h4>
              <p className="text-sm">Join our onboarding sessions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}