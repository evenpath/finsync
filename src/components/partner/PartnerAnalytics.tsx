"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockWorkspaceStats, mockAssignedWorkflows, mockTeamMembers } from "@/lib/mockData";
import Image from "next/image";
import { TrendingUp, Activity, Clock, Workflow as WorkflowIcon, Star } from "lucide-react";

export default function PartnerAnalytics() {
  const analyticsCards = [
    { title: "Success Rate", value: mockWorkspaceStats.successRate, change: "+2% from last month", icon: TrendingUp, color: "text-green-500" },
    { title: "Team Efficiency", value: mockWorkspaceStats.teamEfficiency, change: "+5% from last month", icon: Activity, color: "text-blue-500" },
    { title: "Avg Completion Time", value: mockWorkspaceStats.avgCompletionTime, change: "-0.3h from last month", icon: Clock, color: "text-purple-500" },
    { title: "Active Workflows", value: mockAssignedWorkflows.filter(w => w.status === 'active').length, change: "2 customized", icon: WorkflowIcon, color: "text-indigo-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-green-600">{item.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Workflow Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAssignedWorkflows.filter(w => w.status === 'active').map(workflow => (
              <div key={workflow.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                <div>
                  <p className="font-medium text-foreground">{workflow.title}</p>
                  <p className="text-sm text-muted-foreground">{workflow.completedTasks} tasks completed</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600">
                    {Math.round((workflow.completedTasks / (workflow.completedTasks + workflow.pendingTasks)) * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground">completion</p>
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
              <div key={member.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                <div className="flex items-center gap-3">
                  <Image src={member.avatar} alt={member.name} width={40} height={40} className="rounded-full" data-ai-hint="person user" />
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.tasksCompleted} tasks completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">4.{8 + member.id % 2}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{member.avgCompletionTime} avg</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
