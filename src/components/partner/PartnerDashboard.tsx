"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/shared/Badge";
import {
  Target,
  CheckCircle,
  Users,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Award,
  Workflow as WorkflowIcon,
  Eye,
} from "lucide-react";
import { mockWorkspaceStats, mockAssignedWorkflows, mockTeamMembers, mockPendingApprovals } from "@/lib/mockData";
import Image from "next/image";

export default function PartnerDashboard() {
  const statCards = [
    {
      label: "Total Tasks",
      value: mockWorkspaceStats.totalTasks,
      change: mockWorkspaceStats.monthlyTasks,
      icon: Target,
      color: "blue",
    },
    {
      label: "Completed",
      value: mockWorkspaceStats.completedTasks,
      change: `${Math.round((mockWorkspaceStats.completedTasks / mockWorkspaceStats.totalTasks) * 100)}%`,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "Team Members",
      value: mockWorkspaceStats.activeWorkers,
      change: "+2 this month",
      icon: Users,
      color: "purple",
    },
    {
      label: "Avg Completion",
      value: mockWorkspaceStats.avgCompletionTime,
      change: "-0.3h",
      icon: Clock,
      color: "orange",
    },
  ];

  const colorClasses: Record<string, string> = {
      blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300",
      green: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300",
      purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300",
      orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                    <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline">Active Workflows</CardTitle>
            <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" />New</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAssignedWorkflows.filter(w => w.status === 'active').map(workflow => (
              <div key={workflow.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                  <WorkflowIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{workflow.title}</p>
                  <p className="text-sm text-muted-foreground">{workflow.completedTasks} completed • {workflow.pendingTasks} pending</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Team Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockTeamMembers.filter(member => member.status === 'active').map(member => (
              <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary">
                <Image src={member.avatar} alt={member.name} width={48} height={48} className="rounded-full" data-ai-hint="woman person" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{member.tasksCompleted}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Avg: {member.avgCompletionTime}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline">Pending Approvals</CardTitle>
            <Button variant="outline" size="sm">View All <ArrowRight className="w-4 h-4 ml-2" /></Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockPendingApprovals.slice(0, 2).map(approval => (
            <div key={approval.id} className="flex flex-wrap items-center gap-4 p-4 rounded-lg border border-yellow-200 bg-yellow-100/50 dark:bg-yellow-900/20">
              <div className="w-3 h-3 bg-yellow-500 rounded-full shrink-0"></div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{approval.taskTitle}</p>
                <p className="text-sm text-muted-foreground">{approval.workflow} • {approval.assignee}</p>
              </div>
              <Badge variant={approval.priority === 'high' ? 'danger' : approval.priority === 'medium' ? 'warning' : 'info'}>
                {approval.priority}
              </Badge>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="success"><CheckCircle className="w-4 h-4 mr-1" />Approve</Button>
                <Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-1" />Review</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
