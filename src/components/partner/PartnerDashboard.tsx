// src/components/partner/PartnerDashboard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "@/components/shared/Badge";
import {
  CheckCircle,
  Plus,
  ArrowRight,
  Zap,
  Cpu,
  Settings,
  FileText
} from "lucide-react";
import { mockAssignedWorkflows, mockPendingApprovals } from "@/lib/mockData";

export default function PartnerDashboard() {
  
  const readyTemplates = [
    { id: 1, title: 'Emergency Maintenance Response', category: 'Property Management', executions: 23, icon: '🔧' },
    { id: 2, title: 'Rent Collection & Late Payments', category: 'Property Management', executions: 156, icon: '💰' },
    { id: 3, title: 'Tenant Move-In Coordination', category: 'Property Management', recommended: true, icon: '🚚' },
    { id: 4, title: 'Seasonal HVAC Maintenance', category: 'HVAC', recommended: true, icon: '❄️' },
  ];

  const aiWorkflows = [
    { id: 1, title: 'VIP Tenant Service Requests', executions: 12, status: 'Live' },
    { id: 2, title: 'Automated Rent Increase Notices', executions: 0, status: 'Testing' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Ready Templates Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary"/>
                Ready Templates
              </CardTitle>
              <CardDescription>Deploy proven, industry-specific workflows in one click.</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All Templates</Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {readyTemplates.map(template => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-2xl mb-4">{template.icon}</div>
                <h3 className="font-semibold text-foreground truncate">{template.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{template.category}</p>
                {template.recommended ? (
                   <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Deploy
                  </Button>
                ) : (
                  <div className="text-xs text-muted-foreground">{template.executions} executions</div>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI-Generated Workflows */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Cpu className="w-6 h-6 text-primary"/>
              AI-Generated Workflows
            </CardTitle>
            <CardDescription>Describe a problem in natural language to generate a custom workflow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
             {aiWorkflows.map(workflow => (
              <div key={workflow.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{workflow.title}</p>
                  <p className="text-sm text-muted-foreground">{workflow.executions} executions</p>
                </div>
                <Badge variant={workflow.status === 'Live' ? 'success' : 'warning'}>{workflow.status}</Badge>
                <Button variant="ghost" size="icon" className="w-8 h-8"><Settings className="w-4 h-4"/></Button>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-2">
              <Plus className="w-4 h-4 mr-2" />
              Describe New Problem
            </Button>
          </CardContent>
        </Card>
        
        {/* Active Workflows (previously pending approvals) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary"/>
                Active Workflows
              </CardTitle>
              <CardDescription>Monitor your currently running workflow instances.</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockAssignedWorkflows.filter(w => w.status === 'active').slice(0, 2).map(workflow => (
              <div key={workflow.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{workflow.title}</p>
                  <p className="text-sm text-muted-foreground">{workflow.completedTasks} completed • {workflow.pendingTasks} pending</p>
                </div>
                <div className="flex items-center gap-2">
                   <Button size="sm" variant="outline">View</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

       {/* Pending Approvals */}
       <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-yellow-600"/>
            Pending Approvals
          </CardTitle>
          <CardDescription>Tasks that require your review before proceeding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockPendingApprovals.slice(0, 2).map(approval => (
            <div key={approval.id} className="flex flex-wrap items-center gap-4 p-4 rounded-lg border border-yellow-200 bg-yellow-100/50 dark:bg-yellow-900/20">
              <div className="flex-1 min-w-[200px]">
                <p className="font-medium text-foreground">{approval.taskTitle}</p>
                <p className="text-sm text-muted-foreground">{approval.workflow} • Submitted by {approval.assignee}</p>
              </div>
              <Badge variant={approval.priority === 'high' ? 'danger' : approval.priority === 'medium' ? 'warning' : 'info'}>
                {approval.priority}
              </Badge>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="success">Approve</Button>
                <Button size="sm" variant="outline">Review</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
