"use client";

import React, { useState } from "react";
import { mockPendingApprovals } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/shared/Badge";
import {
  Filter,
  CheckCircle,
  XCircle,
  MessageSquare,
  Eye,
} from "lucide-react";

export default function PendingApprovals() {
  const [selectedApproval, setSelectedApproval] = useState(mockPendingApprovals[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold font-headline text-foreground">Pending Approvals</h2>
          <p className="text-muted-foreground">Review and approve tasks submitted by your team</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Filter className="w-4 h-4" /> Filter</Button>
          <Button variant="success"><CheckCircle className="w-4 h-4" /> Bulk Approve</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Approval Queue</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y">
                    {mockPendingApprovals.map((approval) => (
                      <div
                        key={approval.id}
                        className={`p-6 hover:bg-secondary cursor-pointer transition-colors ${
                          selectedApproval?.id === approval.id ? "bg-primary/10 border-l-4 border-primary" : ""
                        }`}
                        onClick={() => setSelectedApproval(approval)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                            approval.priority === 'high' ? 'bg-red-500' :
                            approval.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-foreground">{approval.taskTitle}</h4>
                              <Badge variant={approval.priority === 'high' ? 'danger' : 'warning'}>
                                {approval.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{approval.workflow}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                              <span>Assignee: {approval.assignee}</span>
                              <span>Submitted: {approval.submittedAt}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
                <CardTitle className="font-headline">Approval Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedApproval ? (
                <div className="space-y-4">
                    <div><label className="text-sm font-medium text-muted-foreground">Task</label><p>{selectedApproval.taskTitle}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">Workflow</label><p>{selectedApproval.workflow}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">Assignee</label><p>{selectedApproval.assignee}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">Priority</label><p><Badge variant={selectedApproval.priority === 'high' ? 'danger' : 'warning'}>{selectedApproval.priority}</Badge></p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">Details</label><p className="text-sm">{selectedApproval.details}</p></div>
                  <div className="pt-4 space-y-2">
                    <Button className="w-full" variant="success"><CheckCircle className="w-4 h-4" />Approve Task</Button>
                    <Button variant="danger" className="w-full"><XCircle className="w-4 h-4" />Reject Task</Button>
                    <Button variant="outline" className="w-full"><MessageSquare className="w-4 h-4" />Request Changes</Button>
                    <Button variant="outline" className="w-full"><Eye className="w-4 h-4" />View Full Details</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>Select an approval to review details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
