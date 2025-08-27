// src/hooks/use-workflow-auth.ts
// Extends your existing multi-workspace auth without modifying it

import { useMemo } from 'react';
import { useMultiWorkspaceAuth } from './use-multi-workspace-auth';
import type { WorkflowBuilderAuthState } from '@/lib/types/workflow-builder';

export function useWorkflowAuth(): WorkflowBuilderAuthState & ReturnType<typeof useMultiWorkspaceAuth> {
  const authState = useMultiWorkspaceAuth();

  const workflowPermissions = useMemo((): WorkflowBuilderAuthState => {
    const { user, currentWorkspace } = authState;
    
    // Super Admin can do everything
    const isSuperAdmin = user?.customClaims?.role === 'Super Admin';
    
    // Admin can manage templates for their organization
    const isAdmin = user?.customClaims?.role === 'Admin';
    
    // Partner admin can customize templates and manage their team's workflows
    const isPartnerAdmin = currentWorkspace?.role === 'partner_admin';
    
    // Employee can execute assigned tasks
    const isEmployee = currentWorkspace?.role === 'employee';

    return {
      // Core permissions
      canCreateGlobalTemplates: isSuperAdmin,
      canCustomizeTemplates: isSuperAdmin || isAdmin || isPartnerAdmin,
      canExecuteTasks: isSuperAdmin || isAdmin || isPartnerAdmin || isEmployee,
      canAssignTasks: isSuperAdmin || isAdmin || isPartnerAdmin,
      canApproveTaskAllocation: isSuperAdmin || isAdmin || isPartnerAdmin,
      canManageWorkflows: isSuperAdmin || isAdmin || isPartnerAdmin,
      
      // Current context
      currentPartnerId: currentWorkspace?.partnerId,
      currentTenantId: currentWorkspace?.tenantId,
      currentWorkspaceId: currentWorkspace?.partnerId, // Using partnerId as workspaceId
      
      // Template access (simplified - extend based on your needs)
      accessibleTemplates: [], // TODO: Implement based on user permissions
      ownedTemplates: [] // TODO: Implement based on user created templates
    };
  }, [authState]);

  return {
    ...authState,
    ...workflowPermissions
  };
}