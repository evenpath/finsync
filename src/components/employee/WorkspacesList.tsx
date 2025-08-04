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
            <Badge variant="default" className="bg-green-100 text-green-800">
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
        
        {workspace.permissions.length > 0 && (
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

  // Extract workspaces from user's custom claims
  const availableWorkspaces: WorkspaceAccess[] = React.useMemo(() => {
    if (!user?.customClaims) return [];

    const workspaces = user.customClaims.workspaces || [];
    
    // If no workspaces in custom claims, create from legacy format
    if (workspaces.length === 0 && user.customClaims.partnerId) {
      return [{
        partnerId: user.customClaims.partnerId,
        tenantId: user.customClaims.tenantId || '',
        role: user.customClaims.role as 'partner_admin' | 'employee',
        permissions: [],
        status: 'active',
        partnerName: user.displayName || user.customClaims.partnerId,
        partnerAvatar: undefined
      }];
    }

    return workspaces.map((w: any) => ({
      partnerId: w.partnerId,
      tenantId: w.tenantId,
      role: w.role,
      permissions: w.permissions || [],
      status: w.status || 'active',
      partnerName: w.partnerName || `Partner ${w.partnerId}`,
      partnerAvatar: w.partnerAvatar
    }));
  }, [user]);

  const currentPartnerId = user?.customClaims?.activePartnerId || user?.customClaims?.partnerId;

  const handleWorkspaceSwitch = (workspace: WorkspaceAccess) => {
    // In a real implementation, this would call a backend service
    // For now, we'll show a simple message
    console.log('Switch to workspace:', workspace.partnerId);
    window.location.reload(); // Simple approach for demo
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-32" />
        </div>
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
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
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Workspaces</h3>
            <p className="text-gray-500 mb-4">
              You don't have access to any workspaces yet. Contact your organization admin to get invited.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Your Workspaces</h2>
        <Badge variant="secondary" className="ml-2">
          {availableWorkspaces.length}
        </Badge>
      </div>
      
      {availableWorkspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace.partnerId}
          workspace={workspace}
          isActive={workspace.partnerId === currentPartnerId}
          onSwitch={() => handleWorkspaceSwitch(workspace)}
        />
      ))}
      
      {availableWorkspaces.length > 1 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Multi-Workspace Access</h4>
              <p className="text-sm text-blue-700">
                You have access to multiple workspaces. You can switch between them using the workspace switcher 
                in the sidebar or by clicking the "Switch" button above.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}