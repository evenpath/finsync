"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockWorkflowTemplates } from "@/lib/mockData";
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  Clock,
} from "lucide-react";

export default function SystemAnalytics() {
  const analyticsCards = [
    {
      title: "Total Revenue",
      value: "$124,500",
      change: "+12% from last month",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "API Calls",
      value: "2.4M",
      change: "+8% from last month",
      icon: Activity,
      color: "text-blue-500",
    },
    {
      title: "Error Rate",
      value: "0.02%",
      change: "-0.01% from last month",
      icon: AlertTriangle,
      color: "text-yellow-500",
    },
    {
      title: "Avg Processing Time",
      value: "1.8s",
      change: "-0.3s from last month",
      icon: Clock,
      color: "text-purple-500",
    },
  ];

  const resourceUtilization = [
    { name: "CPU Usage", value: 45, color: "bg-blue-600" },
    { name: "Memory Usage", value: 67, color: "bg-green-600" },
    { name: "Storage Usage", value: 34, color: "bg-purple-600" },
    { name: "Network I/O", value: 23, color: "bg-yellow-500" },
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
            <CardTitle className="font-headline">Top Performing Workflows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockWorkflowTemplates.slice(0, 4).map((template) => (
              <div key={template.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                <div>
                  <p className="font-medium text-foreground">{template.title}</p>
                  <p className="text-sm text-muted-foreground">{template.totalUses} executions</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600">
                    {Math.round((template.totalUses / (template.totalUses + 10)) * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground">success rate</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Resource Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {resourceUtilization.map((resource) => (
              <div key={resource.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{resource.name}</span>
                  <span className="text-sm text-muted-foreground">{resource.value}%</span>
                </div>
                <Progress value={resource.value} className="h-2 [&>div]:bg-primary" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
