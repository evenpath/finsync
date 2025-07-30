"use client";

import React from "react";
import { mockWorkflowTemplates } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/shared/Badge";
import {
  Plus,
  Layers,
  Cpu,
  Building,
  Clock,
  Edit3,
  Send,
  MoreVertical,
} from "lucide-react";

export default function WorkflowTemplates() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold font-headline text-foreground">Global Workflow Templates</h2>
          <p className="text-muted-foreground">Create and manage AI-powered workflow templates</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockWorkflowTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                 <Badge variant="info">{template.category}</Badge>
                 <Badge variant={template.status === "active" ? "success" : "default"}>{template.status}</Badge>
              </div>
              <CardTitle className="font-headline pt-2">{template.title}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
               <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><Layers className="w-4 h-4" /><span>{template.steps} steps</span></div>
                    <div className="flex items-center gap-2"><Cpu className="w-4 h-4" /><span>{template.aiAgents} AI agents</span></div>
                    <div className="flex items-center gap-2"><Building className="w-4 h-4" /><span>{template.assignedPartners} partners</span></div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{template.estimatedTime}</span></div>
                </div>
                 <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (<Badge key={tag} variant="purple" className="text-xs">{tag}</Badge>))}
                </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch">
                 <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span>Used {template.totalUses} times</span>
                    <span>Updated {template.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1"><Edit3 className="w-4 h-4" />Edit</Button>
                    <Button size="sm" className="flex-1"><Send className="w-4 h-4" />Assign</Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9"><MoreVertical className="w-4 h-4" /></Button>
                </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
