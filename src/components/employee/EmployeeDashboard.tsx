// src/components/employee/EmployeeDashboard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useMultiWorkspaceAuth } from '../../hooks/use-multi-workspace-auth';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Building2, 
  Plus, 
  CheckSquare, 
  Calendar,
  Clock,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import JoinWorkspaceDialog from './JoinWorkspaceDialog';
import EmployeeTasks from './EmployeeTasks';

export default function EmployeeDashboard() {
  const { user, loading, availableWorkspaces, currentWorkspace, refreshWorkspaces } = useMultiWorkspaceAuth();
  const { toast } = useToast();

  const handleJoinSuccess = () => {
    toast({
      title: "Workspace Joined",
      description: "Refreshing to load your new workspace..."
    });
    refreshWorkspaces();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading your workspaces...</p>
        </div>
      </div>
    );
  }

  // No workspaces - show join workspace flow
  if (availableWorkspaces.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="w-full max-w-md text-center">
          <Card>
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
              <p className="text-muted-foreground mb-6">
                You're not part of any workspace yet. Join one to get started.
              </p>
              <JoinWorkspaceDialog
                trigger={
                  <Button className="w-full" size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Join Your First Workspace
                  </Button>
                }
                onSuccess={handleJoinSuccess}
              />
              <div className="text-xs text-muted-foreground mt-3">
                <p>Get an invitation code from your organization's admin</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <CheckSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Due Today</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Calendar className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Section */}
        <EmployeeTasks />
    </div>
  );
}
