// src/components/worker/WorkspaceSwitcher.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Check, Settings, LogOut, RefreshCw } from 'lucide-react';
import { useMultiWorkspaceAuth } from '@/hooks/use-multi-workspace-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import JoinWorkspaceDialog from '@/components/employee/JoinWorkspaceDialog';
import type { WorkspaceAccess } from '@/lib/types';

const WorkspaceAvatar = ({ workspace, size = 'md' }: { workspace: any, size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl'
  };

  const workspaceName = workspace?.partnerName || 'Workspace';

  return (
    <div className={`${sizeClasses[size]} bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold`}>
      {workspaceName?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
};

export default function EnhancedWorkspaceSwitcher() {
  const { 
    user, 
    loading, 
    currentWorkspace, 
    availableWorkspaces,
    switchWorkspace,
    refreshWorkspaces
  } = useMultiWorkspaceAuth();

  const { toast } = useToast();
  const auth = getAuth(app);
  
  const handleWorkspaceSwitch = async (workspace: WorkspaceAccess) => {
    if (workspace.partnerId !== currentWorkspace?.partnerId) {
      toast({
        title: "Switching Workspace",
        description: `Switching to ${workspace.partnerName}...`
      });
      const success = await switchWorkspace(workspace.partnerId);
      if (success) {
        window.location.reload();
      } else {
         toast({
          variant: "destructive",
          title: "Switch Failed",
          description: "Unable to switch workspace. Please try again."
        });
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      });
      window.location.href = '/login';
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: "Unable to sign out. Please try again."
      });
    }
  };

  if (loading || !user) {
    return (
      <div className="w-20 bg-gray-100 border-r flex flex-col items-center py-4 gap-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="w-20 bg-white border-r flex flex-col items-center py-4 gap-4">
        <div className="p-2 rounded-lg bg-gray-300 text-gray-500">
          <Briefcase className="w-6 h-6" />
        </div>
        <div className="text-center text-xs text-gray-500 px-2">
          No Workspace
        </div>
        <JoinWorkspaceDialog
            trigger={
              <Button
                variant="outline"
                className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600"
                title="Join a workspace"
              >
                <Plus className="w-6 h-6" />
              </Button>
            }
            onSuccess={() => {
              toast({
                title: "Workspace Joined",
                description: "Refreshing to load your new workspace..."
              });
              refreshWorkspaces();
            }}
        />
      </div>
    );
  }

  return (
    <div className="relative w-20 bg-white border-r flex flex-col items-center py-4 gap-4">
      <div className="p-2 rounded-lg bg-blue-600 text-white mb-4">
        <Briefcase className="w-6 h-6" />
      </div>

      {/* Current workspace */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative group p-0 h-auto rounded-lg"
            title={`Current: ${currentWorkspace.partnerName}`}
          >
            <WorkspaceAvatar workspace={currentWorkspace} size="md" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          side="right" 
          align="start" 
          className="w-64 ml-2"
        >
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          
          {availableWorkspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.partnerId}
              onClick={() => handleWorkspaceSwitch(workspace)}
              className="flex items-center gap-3 p-3"
            >
              <WorkspaceAvatar workspace={workspace} size="sm" />
              <div className="flex-1">
                <div className="font-medium">{workspace.partnerName}</div>
                <div className="text-sm text-muted-foreground">
                  {workspace.role === 'partner_admin' ? 'Admin' : 'Employee'}
                </div>
              </div>
              {workspace.partnerId === currentWorkspace.partnerId && (
                <Check className="w-4 h-4 text-green-600" />
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <JoinWorkspaceDialog
            trigger={
              <div className="flex items-center w-full px-3 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm">
                <Plus className="w-4 h-4 mr-2" />
                Join Workspace
              </div>
            }
            onSuccess={refreshWorkspaces}
          />
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem>
            <Settings className="w-4 h-4 mr-2" />
            Preferences
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Additional workspaces (show first 2-3 as quick access) */}
      {availableWorkspaces.filter(w => w.partnerId !== currentWorkspace.partnerId).slice(0, 3).map((workspace) => (
        <Button
          key={workspace.partnerId}
          variant="ghost"
          className="p-0 h-auto rounded-lg opacity-60 hover:opacity-100"
          onClick={() => handleWorkspaceSwitch(workspace)}
          title={workspace.partnerName}
        >
          <WorkspaceAvatar workspace={workspace} size="md" />
        </Button>
      ))}

      {availableWorkspaces.length > 4 && (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600"
                    title="More workspaces..."
                >
                    <Plus className="w-6 h-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-64 ml-2">
                 {availableWorkspaces.slice(3).map((workspace) => (
                    <DropdownMenuItem
                    key={workspace.partnerId}
                    onClick={() => handleWorkspaceSwitch(workspace)}
                    className="flex items-center gap-3 p-3"
                    >
                    <WorkspaceAvatar workspace={workspace} size="sm" />
                    <div className="flex-1">
                        <div className="font-medium">{workspace.partnerName}</div>
                    </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
