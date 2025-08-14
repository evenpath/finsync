"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Building, TrendingUp, CheckCircle, Activity, Zap } from "lucide-react";
import { mockSystemStats, mockPartners } from "../../lib/mockData";
import { Badge } from "../ui/badge";

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
      color: "green",
    },
    {
      label: "Total Tasks",
      value: mockSystemStats.totalTasks.toLocaleString(),
      change: mockSystemStats.monthlyGrowth,
      icon: CheckCircle,
      color: "purple",
    },
    {
      label: "System Uptime",
      value: mockSystemStats.systemUptime,
      change: "Last 30 days",
      icon: Activity,
      color: "emerald",
    },
  ];

  const colorClasses: Record<string, string> = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      emerald: "bg-emerald-100 text-emerald-600"
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-xs text-green-600">{stat.change}</p>
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
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-foreground">API Response</span>
              </div>
              <span className="text-sm text-muted-foreground">{mockSystemStats.avgResponseTime}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-foreground">Database</span>
              </div>
              <span className="text-sm text-muted-foreground">Healthy</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-foreground">Storage Usage</span>
              </div>
              <span className="text-sm text-muted-foreground">{mockSystemStats.storageUsed}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-foreground">Daily Active Users</span>
              </div>
              <span className="text-sm text-muted-foreground">{mockSystemStats.dailyActiveUsers}</span>
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
                  <p className="font-medium text-foreground">{partner.name}</p>
                  <p className="text-sm text-muted-foreground">{partner.tasksCompleted} tasks completed</p>
                </div>
                <Badge variant={partner.status === "active" ? "default" : "destructive"} className={partner.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>{partner.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
