"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Building2, 
  Plus, 
  Users, 
  CheckSquare, 
  Calendar,
  Settings,
  LogOut,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import JoinWorkspaceDialog from './JoinWorkspaceDialog';
import EmployeeTasks from './EmployeeTasks';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { WorkspaceAccess } from '../../lib/types';

export default function EmployeeDashboard() {
  const { user, loading } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceAccess[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceAccess | null>(null);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const { toast } = useToast();

  // Load user's workspaces
  useEffect(() => {
    if (!user?.uid || !db) {
      setIsLoadingWorkspaces(false);
      return;
    }

    const workspacesQuery = query(
      collection(db, 'userWorkspaceLinks'),
      where('userId', '==', user.uid),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(workspacesQuery, (snapshot) => {
      const fetchedWorkspaces: WorkspaceAccess[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          partnerId: data.partnerId,
          tenantId: data.tenantId,
          role: data.role,
          permissions: data.permissions || [],
          status: data.status,
          partnerName: data.partnerName,
          partnerAvatar: data.partnerAvatar,
        } as WorkspaceAccess;
      });

      setWorkspaces(fetchedWorkspaces);
      
      // Set current workspace from custom claims or first available
      const activePartnerId = user.customClaims?.activePartnerId || user.customClaims?.partnerId;
      const current = fetchedWorkspaces.find(ws => ws.partnerId === activePartnerId) || fetchedWorkspaces[0];
      setCurrentWorkspace(current || null);
      setIsLoadingWorkspaces(false);
    }, (error) => {
      console.error('Error loading workspaces:', error);
      setIsLoadingWorkspaces(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleWorkspaceSwitch = (workspace: WorkspaceAccess) => {
    setCurrentWorkspace(workspace);
    toast({
      title: "Workspace Switched",
      description: `Now active in ${workspace.partnerName}`
    });
    // In a full implementation, you'd update the user's custom claims here
  };

  const handleJoinSuccess = () => {
    toast({
      title: "Workspace Joined",
      description: "Refreshing to load your new workspace..."
    });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (loading || isLoadingWorkspaces) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
  if (workspaces.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="w-full max-w-md space-y-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Flow Factory</h2>
              <p className="text-muted-foreground mb-6">
                You're not part of any workspace yet. Join your first workspace to get started.
              </p>
              <div className="space-y-3">
                <JoinWorkspaceDialog
                  trigger={
                    <Button className="w-full" size="lg">
                      <Plus className="w-4 h-4 mr-2" />
                      Join Your First Workspace
                    </Button>
                  }
                  onSuccess={handleJoinSuccess}
                />
                <div className="text-xs text-muted-foreground">
                  <p>Get an invitation code from your organization's admin</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold">Flow Factory</h1>
            </div>
            
            {/* Workspace Selector */}
            {currentWorkspace && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {currentWorkspace.partnerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{currentWorkspace.partnerName}</p>
                    <p className="text-xs text-muted-foreground">{currentWorkspace.role}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Workspaces */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Workspaces</CardTitle>
                  <JoinWorkspaceDialog
                    trigger={
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    }
                    onSuccess={handleJoinSuccess}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.partnerId}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                      currentWorkspace?.partnerId === workspace.partnerId
                        ? 'bg-primary/10 border-primary/20'
                        : 'hover:bg-muted border-transparent'
                    }`}
                    onClick={() => handleWorkspaceSwitch(workspace)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {workspace.partnerName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{workspace.partnerName}</p>
                          <Badge variant="secondary" className="text-xs">
                            {workspace.role}
                          </Badge>
                        </div>
                      </div>
                      {currentWorkspace?.partnerId === workspace.partnerId && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Tasks</span>
                  </div>
                  <Badge variant="secondary">0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Due Today</span>
                  </div>
                  <Badge variant="secondary">0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Workspaces</span>
                  </div>
                  <Badge variant="secondary">{workspaces.length}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {currentWorkspace ? (
              <div className="space-y-6">
                {/* Welcome Section */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">
                          Welcome to {currentWorkspace.partnerName}
                        </h2>
                        <p className="text-muted-foreground">
                          You're logged in as {currentWorkspace.role} • {user?.email || user?.phoneNumber}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tasks Section */}
                <EmployeeTasks />
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Active Workspace</h3>
                  <p className="text-muted-foreground mb-4">
                    Select a workspace from the sidebar to get started
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}