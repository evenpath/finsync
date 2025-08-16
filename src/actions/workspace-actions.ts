// src/actions/workspace-actions.ts
'use server';

import { db, adminAuth } from '../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { WorkspaceAccess, UserWorkspaceLink } from '../lib/types';

/**
 * Get user's workspaces
 */
export async function getUserWorkspacesAction(userId: string): Promise<{
  success: boolean;
  message: string;
  workspaces?: WorkspaceAccess[];
}> {
  if (!db) {
    return {
      success: false,
      message: 'Database not available'
    };
  }

  try {
    const workspacesQuery = await db
      .collection('userWorkspaceLinks')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .get();

    const workspaces: WorkspaceAccess[] = workspacesQuery.docs.map(doc => {
      const data = doc.data() as UserWorkspaceLink;
      return {
        partnerId: data.partnerId,
        tenantId: data.tenantId,
        role: data.role,
        permissions: data.permissions,
        status: data.status,
        partnerName: data.partnerName,
        partnerAvatar: data.partnerAvatar
      };
    });

    return {
      success: true,
      message: 'Workspaces retrieved successfully',
      workspaces
    };

  } catch (error: any) {
    console.error('Error getting user workspaces:', error);
    return {
      success: false,
      message: `Failed to retrieve workspaces: ${error.message}`
    };
  }
}

/**
 * Accept workspace invitation
 */
export async function acceptWorkspaceInvitationAction(invitationId: string, userId: string): Promise<{
  success: boolean;
  message: string;
  workspace?: WorkspaceAccess;
}> {
  if (!db) {
    return {
      success: false,
      message: 'Database not available'
    };
  }

  try {
    const invitationRef = db.collection('workspaceInvitations').doc(invitationId);
    const invitationDoc = await invitationRef.get();

    if (!invitationDoc.exists) {
      return {
        success: false,
        message: 'Invitation not found'
      };
    }

    const invitation = invitationDoc.data();
    
    if (invitation?.status !== 'pending') {
      return {
        success: false,
        message: 'Invitation is no longer valid'
      };
    }

    // Create user workspace link
    const workspaceLinkRef = db.collection('userWorkspaceLinks').doc();
    await workspaceLinkRef.set({
      userId,
      partnerId: invitation.partnerId,
      tenantId: invitation.tenantId,
      role: invitation.role,
      permissions: invitation.permissions || [],
      status: 'active',
      joinedAt: FieldValue.serverTimestamp(),
      partnerName: invitation.partnerName,
      partnerAvatar: invitation.partnerAvatar
    });

    // Update invitation status
    await invitationRef.update({
      status: 'accepted',
      acceptedAt: FieldValue.serverTimestamp(),
      acceptedBy: userId
    });

    return {
      success: true,
      message: 'Workspace invitation accepted',
      workspace: {
        partnerId: invitation.partnerId,
        tenantId: invitation.tenantId,
        role: invitation.role,
        permissions: invitation.permissions || [],
        status: 'active',
        partnerName: invitation.partnerName,
        partnerAvatar: invitation.partnerAvatar
      }
    };

  } catch (error: any) {
    console.error('Error accepting workspace invitation:', error);
    return {
      success: false,
      message: `Failed to accept invitation: ${error.message}`
    };
  }
}

/**
 * Switch workspace (update user context)
 */
export async function switchWorkspaceAction(userId: string, partnerId: string): Promise<{
  success: boolean;
  message: string;
}> {
  if (!db) {
    return {
      success: false,
      message: 'Database not available'
    };
  }

  try {
    // Verify user has access to this workspace
    const workspaceQuery = await db
      .collection('userWorkspaceLinks')
      .where('userId', '==', userId)
      .where('partnerId', '==', partnerId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (workspaceQuery.empty) {
      return {
        success: false,
        message: 'You do not have access to this workspace'
      };
    }

    // Update user context
    const userContextRef = db.collection('userWorkspaceContexts').doc(userId);
    const workspaceData = workspaceQuery.docs[0].data();
    
    await userContextRef.set({
      userId,
      activePartnerId: partnerId,
      activeTenantId: workspaceData.tenantId,
      lastSwitchedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return {
      success: true,
      message: 'Workspace switched successfully'
    };

  } catch (error: any) {
    console.error('Error switching workspace:', error);
    return {
      success: false,
      message: `Failed to switch workspace: ${error.message}`
    };
  }
}