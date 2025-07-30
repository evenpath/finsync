"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, TrendingUp, CheckCircle, Activity, Zap } from "lucide-react";
import { mockSystemStats, mockPartners } from "@/lib/mockData";
import { Badge } from "@/components/shared/Badge";

export default function SystemOverview() {
  const statCards = [
    {
      label: "Total Partners",
      value: mockSystemStats.totalPartners,
      change: "+2 this month",
      icon: Building,
      color: "blue",
    },
    {
      label: "Active Workflows",
      value: mockSystemStats.activeWorkflows,
      change: "+8 this week",
      icon: Zap,
      color: "purple",
    },
    {
      label: "Total Tasks",
      value: mockSystemStats.totalTasks.toLocaleString(),
      change: mockSystemStats.monthlyGrowth,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "System Uptime",
      value: mockSystemStats.systemUptime,
      change: "Last 30 days",
      icon: Activity,
      color: "teal",
    },
  ];

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300",
    green: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300",
    teal: "bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-300",
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
          <CardHeader>
            <CardTitle className="font-headline">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">API Response</span>
              </div>
              <span className="text-sm text-muted-foreground">{mockSystemStats.avgResponseTime}</span>
            </div>
             <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Database</span>
              </div>
              <span className="text-sm text-muted-foreground">Healthy</span>
            </div>
             <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Storage Usage</span>
              </div>
              <span className="text-sm text-muted-foreground">{mockSystemStats.storageUsed}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Partner Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockPartners.slice(0, 3).map((partner) => (
              <div key={partner.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{partner.name}</p>
                  <p className="text-sm text-muted-foreground">{partner.tasksCompleted} tasks completed</p>
                </div>
                <Badge variant={partner.status === "active" ? "success" : "warning"}>{partner.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
