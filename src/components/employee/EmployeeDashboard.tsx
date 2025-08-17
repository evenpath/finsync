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
import WorkspaceNavigation from './WorkspaceNavigation';
import WorkspaceHeader from '../worker/WorkspaceHeader';
import type { WorkspaceAccess } from '../../lib/types';
import { Skeleton } from '../ui/skeleton';

export default function EmployeeDashboard() {
  const { 
    user, 
    loading, 
    currentWorkspace, 
    availableWorkspaces,
    switchWorkspace,
    refreshWorkspaces
  } = useMultiWorkspaceAuth();
  
  const { toast } = useToast();

  const handleWorkspaceSwitch = async (workspace: WorkspaceAccess) => {
    if (workspace.partnerId !== currentWorkspace?.partnerId) {
      toast({
        title: `Switching to ${workspace.partnerName}`,
        description: "Please wait..."
      });
      const success = await switchWorkspace(workspace.partnerId);
      if (!success) {
        toast({
          variant: "destructive",
          title: "Switch Failed",
          description: "Could not switch workspace. Please try again."
        });
      }
    }
  };

  const handleJoinSuccess = () => {
    toast({
      title: "Workspace Joined!",
      description: "Refreshing your workspace list."
    });
    refreshWorkspaces();
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-20 bg-gray-100 border-r flex flex-col items-center py-4 gap-4">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <Skeleton className="w-12 h-12 rounded-full" />
        </div>
        <div className="flex-1 flex flex-col">
            <header className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48" />
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>
            </header>
            <main className="flex-1 p-6">
                <Skeleton className="h-64 w-full" />
            </main>
        </div>
      </div>
    );
  }

  // No workspaces - show join workspace flow
  if (availableWorkspaces.length === 0) {
    return (
      <div className="flex h-screen">
        <div className="w-20 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-2">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div className="w-8 h-px bg-gray-300 mb-1"></div>
          
          <JoinWorkspaceDialog
            trigger={
              <div className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-gray-100">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
            }
            onSuccess={handleJoinSuccess}
          />
        </div>

        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
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
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      <WorkspaceNavigation
        workspaces={availableWorkspaces}
        currentWorkspace={currentWorkspace}
        onWorkspaceSwitch={handleWorkspaceSwitch}
        onJoinSuccess={handleJoinSuccess}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <WorkspaceHeader />
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
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
            <EmployeeTasks />
          </div>
        </main>
      </div>
    </div>
  );
}
