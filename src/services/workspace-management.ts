// src/services/workspace-management.ts
'use server';

import { db, adminAuth } from '@/lib/firebase-admin';
import { collection, doc, setDoc, updateDoc, deleteDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import type { UserWorkspaceLink, WorkspaceInvitation, WorkspaceAccess } from '@/lib/types/multi-workspace';

export interface InviteUserToWorkspaceInput {
  email: string;
  partnerId: string;
  tenantId: string;
  role: 'partner_admin' | 'employee';
  invitedBy: string; // User ID of inviter
  permissions?: string[];
}

export interface InviteUserToWorkspaceOutput {
  success: boolean;
  message: string;
  invitationId?: string;
}

/**
 * Invite a user to join a workspace
 */
export async function inviteUserToWorkspace(input: InviteUserToWorkspaceInput): Promise<InviteUserToWorkspaceOutput> {
  if (!db || !adminAuth) {
    return {
      success: false,
      message: 'Database or Auth not available'
    };
  }

  try {
    // Check if user already exists in the system
    let existingUser = null;
    try {
      existingUser = await adminAuth.getUserByEmail(input.email);
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Get partner details
    const partnerDoc = await db.collection('partners').doc(input.partnerId).get();
    if (!partnerDoc.exists) {
      return {
        success: false,
        message: 'Partner not found'
      };
    }

    const partnerData = partnerDoc.data();
    const inviterDoc = await db.collection('userProfiles').doc(input.invitedBy).get();
    const inviterData = inviterDoc.data();

    // Create workspace invitation
    const invitationId = doc(collection(db, 'workspaceInvitations')).id;
    const invitation: WorkspaceInvitation = {
      id: invitationId,
      email: input.email.toLowerCase(),
      partnerId: input.partnerId,
      tenantId: input.tenantId,
      role: input.role,
      invitedBy: input.invitedBy,
      invitedAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'pending',
      partnerName: partnerData?.name || 'Unknown Organization',
      inviterName: inviterData?.displayName || 'Unknown User',
      inviterEmail: inviterData?.email || 'unknown@example.com'
    };

    await setDoc(doc(db, 'workspaceInvitations', invitationId), invitation);

    // If user exists, also create the workspace link immediately but mark as invited
    if (existingUser) {
      await createUserWorkspaceLink({
        userId: existingUser.uid,
        partnerId: input.partnerId,
        tenantId: input.tenantId,
        role: input.role,
        status: 'invited',
        permissions: input.permissions || [],
        invitedBy: input.invitedBy,
        partnerName: partnerData?.name || 'Unknown Organization'
      });

      // Update user's custom claims to include the new workspace
      await updateUserMultiWorkspaceAccess(existingUser.uid);
    }

    // TODO: Send invitation email

    return {
      success: true,
      message: `Invitation sent to ${input.email}`,
      invitationId
    };

  } catch (error: any) {
    console.error('Error inviting user to workspace:', error);
    return {
      success: false,
      message: `Failed to invite user: ${error.message}`
    };
  }
}

/**
 * Accept a workspace invitation
 */
export async function acceptWorkspaceInvitation(invitationId: string, userId: string): Promise<InviteUserToWorkspaceOutput> {
  if (!db) {
    return {
      success: false,
      message: 'Database not available'
    };
  }

  try {
    const invitationDoc = await db.collection('workspaceInvitations').doc(invitationId).get();
    if (!invitationDoc.exists) {
      return {
        success: false,
        message: 'Invitation not found'
      };
    }

    const invitation = invitationDoc.data() as WorkspaceInvitation;
    
    if (invitation.status !== 'pending') {
      return {
        success: false,
        message: 'Invitation is no longer valid'
      };
    }

    if (invitation.expiresAt < new Date()) {
      return {
        success: false,
        message: 'Invitation has expired'
      };
    }

    // Create or update workspace link
    await createUserWorkspaceLink({
      userId,
      partnerId: invitation.partnerId,
      tenantId: invitation.tenantId,
      role: invitation.role,
      status: 'active',
      permissions: [],
      invitedBy: invitation.invitedBy,
      partnerName: invitation.partnerName
    });

    // Update invitation status
    await updateDoc(doc(db, 'workspaceInvitations', invitationId), {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
      acceptedBy: userId
    });

    // Update user's custom claims
    await updateUserMultiWorkspaceAccess(userId);

    return {
      success: true,
      message: `Successfully joined ${invitation.partnerName}`
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
 * Create a user workspace link
 */
async function createUserWorkspaceLink(input: {
  userId: string;
  partnerId: string;
  tenantId: string;
  role: 'partner_admin' | 'employee';
  status: 'active' | 'invited' | 'suspended';
  permissions: string[];
  invitedBy?: string;
  partnerName: string;
}): Promise<void> {
  if (!db) throw new Error('Database not available');

  const linkId = `${input.userId}_${input.partnerId}`;
  const workspaceLink: UserWorkspaceLink = {
    id: linkId,
    userId: input.userId,
    partnerId: input.partnerId,
    tenantId: input.tenantId,
    role: input.role,
    status: input.status,
    permissions: input.permissions,
    joinedAt: serverTimestamp(),
    invitedBy: input.invitedBy,
    invitedAt: input.invitedBy ? serverTimestamp() : undefined,
    partnerName: input.partnerName,
    lastAccessedAt: input.status === 'active' ? serverTimestamp() : undefined
  };

  await setDoc(doc(db, 'userWorkspaceLinks', linkId), workspaceLink);
}

/**
 * Update user's custom claims with multi-workspace access
 */
export async function updateUserMultiWorkspaceAccess(userId: string): Promise<void> {
  if (!db || !adminAuth) throw new Error('Database or Auth not available');

  try {
    // Get user's workspace links
    const workspaceLinksQuery = query(
      collection(db, 'userWorkspaceLinks'),
      where('userId', '==', userId),
      where('status', 'in', ['active', 'invited'])
    );

    const workspaceSnapshot = await getDocs(workspaceLinksQuery);
    const workspaces: WorkspaceAccess[] = [];
    const partnerIds: string[] = [];

    workspaceSnapshot.forEach((doc) => {
      const data = doc.data() as UserWorkspaceLink;
      workspaces.push({
        partnerId: data.partnerId,
        tenantId: data.tenantId,
        role: data.role,
        permissions: data.permissions,
        status: data.status
      });
      partnerIds.push(data.partnerId);
    });

    // Get current custom claims
    const userRecord = await adminAuth.getUser(userId);
    const currentClaims = userRecord.customClaims || {};

    // Update custom claims with multi-workspace info
    const updatedClaims = {
      ...currentClaims,
      partnerIds: [...new Set(partnerIds)], // Remove duplicates
      workspaces,
      activePartnerId: currentClaims.activePartnerId || (partnerIds.length > 0 ? partnerIds[0] : null),
      activeTenantId: currentClaims.activeTenantId || (workspaces.length > 0 ? workspaces[0].tenantId : null)
    };

    await adminAuth.setCustomUserClaims(userId, updatedClaims);

    console.log(`Updated multi-workspace claims for user ${userId}:`, {
      partnerIds,
      workspaceCount: workspaces.length
    });

  } catch (error: any) {
    console.error('Error updating user multi-workspace access:', error);
    throw error;
  }
}

/**
 * Remove user from workspace
 */
export async function removeUserFromWorkspace(userId: string, partnerId: string): Promise<InviteUserToWorkspaceOutput> {
  if (!db) {
    return {
      success: false,
      message: 'Database not available'
    };
  }

  try {
    const linkId = `${userId}_${partnerId}`;
    await deleteDoc(doc(db, 'userWorkspaceLinks', linkId));

    // Update user's custom claims
    await updateUserMultiWorkspaceAccess(userId);

    return {
      success: true,
      message: 'User removed from workspace'
    };

  } catch (error: any) {
    console.error('Error removing user from workspace:', error);
    return {
      success: false,
      message: `Failed to remove user: ${error.message}`
    };
  }
}

/**
 * Get user's workspace memberships
 */
export async function getUserWorkspaces(userId: string): Promise<UserWorkspaceLink[]> {
  if (!db) return [];

  try {
    const workspaceLinksQuery = query(
      collection(db, 'userWorkspaceLinks'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(workspaceLinksQuery);
    const workspaces: UserWorkspaceLink[] = [];

    snapshot.forEach((doc) => {
      workspaces.push({ id: doc.id, ...doc.data() } as UserWorkspaceLink);
    });

    return workspaces;

  } catch (error: any) {
    console.error('Error getting user workspaces:', error);
    return [];
  }
}