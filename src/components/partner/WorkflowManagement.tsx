
"use client";

import React from "react";
import { mockAssignedWorkflows } from "../../lib/mockData";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../shared/Badge";
import {
  Plus,
  Layers,
  Users,
  CheckCircle,
  Clock,
  Edit3,
  Send,
  Share2,
} from "lucide-react";

export default function WorkflowManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold font-headline text-foreground">My Workflows</h2>
          <p className="text-muted-foreground">Customize and manage your assigned workflows</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Request New Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockAssignedWorkflows.map((workflow) => (
          <Card key={workflow.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge variant="purple">{workflow.category}</Badge>
                <Badge variant={workflow.status === "active" ? "success" : "default"}>
                  {workflow.status}
                </Badge>
              </div>
              <CardTitle className="font-headline">{workflow.title}</CardTitle>
              <CardDescription>{workflow.description}</CardDescription>
              {workflow.isCustomized && (
                  <Badge variant="info">Customized</Badge>
              )}
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Layers className="w-4 h-4" /><span>{workflow.steps} steps</span></div>
                <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span>{workflow.assignedWorkers} workers</span></div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /><span>{workflow.completedTasks} completed</span></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{workflow.avgCompletionTime}</span></div>
              </div>
              <div className="flex flex-wrap gap-1">
                {workflow.tags.map((tag) => (
                  <Badge key={tag} variant="info" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch space-y-2">
                <p className="text-xs text-muted-foreground mb-2">Based on: {workflow.originalTemplate}</p>
                <Button variant="outline" size="sm" className="w-full">
                    <Edit3 className="w-4 h-4" />Customize Workflow
                </Button>
                <div className="flex items-center gap-2">
                    <Button size="sm" className="flex-1" disabled={workflow.status !== "active"}>
                        <Send className="w-4 h-4" />Assign Tasks
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                        <Share2 className="w-4 h-4" />Share
                    </Button>
                </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
