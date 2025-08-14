// src/actions/workspace-actions.ts
'use server';

import { db, adminAuth } from '@/lib/firebase-admin';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import type { WorkspaceAccess, UserWorkspaceLink } from '../../lib/types';

export interface SwitchWorkspaceResult {
  success: boolean;
  message: string;
  workspace?: WorkspaceAccess;
}

/**
 * Switch user's active workspace
 */
export async function switchWorkspaceAction(
  userId: string, 
  partnerId: string
): Promise<SwitchWorkspaceResult> {
  if (!db || !adminAuth) {
    return {
      success: false,
      message: 'Database or Auth not available'
    };
  }

  try {
    // Verify user has access to this workspace
    const workspaceQuery = query(
      collection(db, 'userWorkspaceLinks'),
      where('userId', '==', userId),
      where('partnerId', '==', partnerId),
      where('status', '==', 'active')
    );

    const workspaceSnapshot = await getDocs(workspaceQuery);
    
    if (workspaceSnapshot.empty) {
      return {
        success: false,
        message: 'You do not have access to this workspace'
      };
    }

    const workspaceLink = workspaceSnapshot.docs[0].data() as UserWorkspaceLink;
    
    // Update user's workspace context
    const contextRef = doc(db, 'userWorkspaceContext', userId);
    await setDoc(contextRef, {
      userId,
      activePartnerId: partnerId,
      activeTenantId: workspaceLink.tenantId,
      lastSwitchedAt: serverTimestamp(),
      availableWorkspaces: [partnerId] // This would be populated with all user's workspaces
    }, { merge: true });

    // Update user's custom claims
    const user = await adminAuth.getUser(userId);
    const existingClaims = user.customClaims || {};
    
    // Get all user's workspaces to update claims
    const allWorkspacesQuery = query(
      collection(db, 'userWorkspaceLinks'),
      where('userId', '==', userId),
      where('status', 'in', ['active', 'invited'])
    );
    
    const allWorkspacesSnapshot = await getDocs(allWorkspacesQuery);
    const allWorkspaces = allWorkspacesSnapshot.docs.map(doc => doc.data() as UserWorkspaceLink);
    
    const updatedClaims = {
      ...existingClaims,
      partnerId,
      tenantId: workspaceLink.tenantId,
      activePartnerId: partnerId,
      activeTenantId: workspaceLink.tenantId,
      partnerIds: allWorkspaces.map(w => w.partnerId),
      workspaces: allWorkspaces.map(w => ({
        partnerId: w.partnerId,
        tenantId: w.tenantId,
        role: w.role,
        permissions: w.permissions,
        status: w.status
      }))
    };

    await adminAuth.setCustomUserClaims(userId, updatedClaims);

    // Update last accessed time for this workspace
    await updateDoc(doc(db, 'userWorkspaceLinks', `${userId}_${partnerId}`), {
      lastAccessedAt: serverTimestamp()
    });

    const workspace: WorkspaceAccess = {
      partnerId: workspaceLink.partnerId,
      tenantId: workspaceLink.tenantId,
      role: workspaceLink.role,
      permissions: workspaceLink.permissions,
      status: workspaceLink.status,
      partnerName: workspaceLink.partnerName,
      partnerAvatar: workspaceLink.partnerAvatar
    };

    return {
      success: true,
      message: `Switched to ${workspaceLink.partnerName}`,
      workspace
    };

  } catch (error: any) {
    console.error('Error switching workspace:', error);
    return {
      success: false,
      message: `Failed to switch workspace: ${error.message}`
    };
  }
}

/**
 * Get user's available workspaces
 */
export async function getUserWorkspacesAction(userId: string): Promise<{
  success: boolean;
  message: string;
  workspaces: WorkspaceAccess[];
}> {
  if (!db) {
    return {
      success: false,
      message: 'Database not available',
      workspaces: []
    };
  }

  try {
    const workspacesQuery = query(
      collection(db, 'userWorkspaceLinks'),
      where('userId', '==', userId),
      where('status', 'in', ['active', 'invited'])
    );

    const workspacesSnapshot = await getDocs(workspacesQuery);
    const workspaceLinks = workspacesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserWorkspaceLink[];

    const workspaces: WorkspaceAccess[] = workspaceLinks.map(link => ({
      partnerId: link.partnerId,
      tenantId: link.tenantId,
      role: link.role,
      permissions: link.permissions,
      status: link.status,
      partnerName: link.partnerName,
      partnerAvatar: link.partnerAvatar
    }));

    return {
      success: true,
      message: 'Workspaces retrieved successfully',
      workspaces
    };

  } catch (error: any) {
    console.error('Error getting user workspaces:', error);
    return {
      success: false,
      message: `Failed to get workspaces: ${error.message}`,
      workspaces: []
    };
  }
}

/**
 * Accept workspace invitation by invitation ID
 */
export async function acceptWorkspaceInvitationAction(
  invitationId: string,
  userId: string
): Promise<SwitchWorkspaceResult> {
  if (!db || !adminAuth) {
    return {
      success: false,
      message: 'Database or Auth not available'
    };
  }

  try {
    // Get invitation details
    const invitationDoc = await db.collection('workspaceInvitations').doc(invitationId).get();
    
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

    // Check if invitation hasn't expired
    const now = new Date();
    const expiresAt = invitation.expiresAt.toDate();
    
    if (now > expiresAt) {
      await updateDoc(doc(db, 'workspaceInvitations', invitationId), {
        status: 'expired'
      });
      return {
        success: false,
        message: 'Invitation has expired'
      };
    }

    // Create workspace link
    const workspaceLink: Omit<UserWorkspaceLink, 'id'> = {
      userId,
      partnerId: invitation.partnerId,
      tenantId: invitation.tenantId,
      role: invitation.role,
      status: 'active',
      permissions: [],
      joinedAt: serverTimestamp() as any,
      invitedBy: invitation.invitedBy,
      invitedAt: invitation.invitedAt,
      partnerName: invitation.partnerName,
      partnerAvatar: undefined,
      lastAccessedAt: serverTimestamp() as any
    };

    const linkId = `${userId}_${invitation.partnerId}`;
    await setDoc(doc(db, 'userWorkspaceLinks', linkId), workspaceLink);

    // Update invitation status
    await updateDoc(doc(db, 'workspaceInvitations', invitationId), {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
      acceptedBy: userId
    });

    // Update user's custom claims
    const result = await switchWorkspaceAction(userId, invitation.partnerId);

    return {
      success: true,
      message: `Successfully joined ${invitation.partnerName}`,
      workspace: result.workspace
    };

  } catch (error: any) {
    console.error('Error accepting workspace invitation:', error);
    return {
      success: false,
      message: `Failed to accept invitation: ${error.message}`
    };
  }
}