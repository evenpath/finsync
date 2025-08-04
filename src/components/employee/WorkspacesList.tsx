// src/components/employee/WorkspacesList.tsx
"use client";

import React from 'react';
import { Building2, Users, Crown, Check, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import type { WorkspaceAccess } from '@/lib/types';
import JoinWorkspaceDialog from './JoinWorkspaceDialog';
import { useMultiWorkspaceAuth } from '@/hooks/use-multi-workspace-auth';

const WorkspaceCard = ({ 
  workspace, 
  isActive, 
  onSwitch 
}: { 
  workspace: WorkspaceAccess; 
  isActive: boolean; 
  onSwitch: () => void;
}) => {
  const getStatusIcon = () => {
    switch (workspace.status) {
      case 'active':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'invited':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (workspace.status) {
      case 'active':
        return 'Active';
      case 'invited':
        return 'Invitation Pending';
      case 'suspended':
        return 'Suspended';
      default:
        return workspace.status;
    }
  };

  const getStatusVariant = () => {
    switch (workspace.status) {
      case 'active':
        return 'default' as const;
      case 'invited':
        return 'secondary' as const;
      case 'suspended':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <Card className={`transition-all ${isActive ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold">
              {workspace.partnerName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <CardTitle className="text-lg">{workspace.partnerName}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {workspace.partnerId}
              </CardDescription>
            </div>
          </div>
          {isActive && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Current
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {workspace.role === 'partner_admin' ? (
                <Crown className="w-4 h-4 text-yellow-600" />
              ) : (
                <Users className="w-4 h-4 text-blue-600" />
              )}
              <span className="text-sm font-medium">
                {workspace.role === 'partner_admin' ? 'Admin' : 'Employee'}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <Badge variant={getStatusVariant()} className="text-xs">
                {getStatusText()}
              </Badge>
            </div>
          </div>
          
          {workspace.status === 'active' && !isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitch}
            >
              Switch
            </Button>
          )}
        </div>
        
        {workspace.permissions?.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Permissions:</p>
            <div className="flex flex-wrap gap-1">
              {workspace.permissions.slice(0, 3).map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))}
              {workspace.permissions.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{workspace.permissions.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function WorkspacesList() {
  const { user, loading } = useAuth();
  const { availableWorkspaces, loading: workspaceLoading, switchWorkspace } = useMultiWorkspaceAuth();
  const currentPartnerId = user?.customClaims?.activePartnerId || user?.customClaims?.partnerId;

  const handleWorkspaceSwitch = (workspace: WorkspaceAccess) => {
    switchWorkspace(workspace.partnerId).then(() => {
        window.location.reload(); // Simple approach for demo
    });
  };

  if (loading || workspaceLoading) {
    return (
      <Card>
        <CardHeader>
             <Skeleton className="h-6 w-32 mb-2" />
             <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
           <Skeleton className="h-16 w-full" />
           <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (availableWorkspaces.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Your Workspaces
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
            <div className="mx-auto w-12 h-12 flex items-center justify-center bg-destructive/10 rounded-full mb-4">
                <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-lg font-medium text-destructive mb-2">Access Denied</h3>
            <p className="text-sm text-muted-foreground mb-4 px-4">
             No workspace access found. Please contact your organization admin to get invited.
            </p>
            <JoinWorkspaceDialog />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Your Workspaces
            </CardTitle>
            <CardDescription>You have access to the following workspaces.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            {availableWorkspaces.map((workspace) => (
            <WorkspaceCard
                key={workspace.partnerId}
                workspace={workspace}
                isActive={workspace.partnerId === currentPartnerId}
                onSwitch={() => handleWorkspaceSwitch(workspace)}
            />
            ))}
             <JoinWorkspaceDialog />
        </CardContent>
    </Card>
  );
}
