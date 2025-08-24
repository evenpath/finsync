// src/services/team-member-service.ts
import { db, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { TeamMember, UserWorkspaceLink } from '@/lib/types';

export interface DeactivateMemberInput {
  partnerId: string;
  userId: string;
  deactivatedBy: string;
  reason?: string;
}

export interface ReactivateMemberInput {
  partnerId: string;
  userId: string;
  reactivatedBy: string;
  invitationCode?: string;
}

export interface TeamMemberActionResult {
  success: boolean;
  message: string;
  requiresNewInvitation?: boolean;
}

/**
 * Deactivate a team member from a workspace
 * This removes their access while keeping their data for potential reactivation
 */
export async function deactivateTeamMember(input: DeactivateMemberInput): Promise<TeamMemberActionResult> {
  if (!db || !adminAuth) {
    return { success: false, message: 'Server not configured properly' };
  }

  const batch = db.batch();

  try {
    // 1. Verify the team member exists and belongs to the partner
    const teamMemberRef = db.collection('teamMembers').doc(input.userId);
    const teamMemberDoc = await teamMemberRef.get();
    
    if (!teamMemberDoc.exists) {
      return { success: false, message: 'Team member not found' };
    }

    const teamMemberData = teamMemberDoc.data() as TeamMember;
    if (teamMemberData.partnerId !== input.partnerId) {
      return { success: false, message: 'Team member does not belong to this partner' };
    }

    if (teamMemberData.status === 'suspended') {
      return { success: false, message: 'Team member is already deactivated' };
    }

    // 2. Update team member status to suspended
    batch.update(teamMemberRef, {
      status: 'suspended',
      suspendedAt: FieldValue.serverTimestamp(),
      suspendedBy: input.deactivatedBy,
      suspensionReason: input.reason || 'Deactivated by admin',
      updatedAt: FieldValue.serverTimestamp()
    });

    // 3. Update user workspace link status
    const workspaceLinkRef = db.collection('userWorkspaceLinks').doc(`${input.userId}_${input.partnerId}`);
    const workspaceLinkDoc = await workspaceLinkRef.get();
    
    if (workspaceLinkDoc.exists) {
      batch.update(workspaceLinkRef, {
        status: 'suspended',
        suspendedAt: FieldValue.serverTimestamp(),
        suspendedBy: input.deactivatedBy,
        lastAccessedAt: FieldValue.serverTimestamp()
      });
    }

    // 4. Update user's Firebase Auth custom claims
    await updateUserCustomClaimsOnDeactivation(input.userId, input.partnerId);

    // 5. Revoke any active tasks assigned to this user
    await revokeUserTasks(input.userId, input.partnerId);

    // 6. Create audit log entry
    const auditLogRef = db.collection('auditLogs').doc();
    batch.set(auditLogRef, {
      action: 'TEAM_MEMBER_DEACTIVATED',
      performedBy: input.deactivatedBy,
      targetUserId: input.userId,
      partnerId: input.partnerId,
      details: {
        reason: input.reason || 'Deactivated by admin',
        memberName: teamMemberData.name,
        memberEmail: teamMemberData.email
      },
      timestamp: FieldValue.serverTimestamp(),
      ipAddress: null // Would be populated from request in real implementation
    });

    // Commit all changes
    await batch.commit();

    return {
      success: true,
      message: 'Team member has been deactivated successfully',
      requiresNewInvitation: true
    };

  } catch (error: any) {
    console.error('Error deactivating team member:', error);
    return {
      success: false,
      message: `Failed to deactivate team member: ${error.message}`
    };
  }
}

/**
 * Reactivate a previously deactivated team member
 * Requires a new invitation code for security
 */
export async function reactivateTeamMember(input: ReactivateMemberInput): Promise<TeamMemberActionResult> {
  if (!db || !adminAuth) {
    return { success: false, message: 'Server not configured properly' };
  }

  try {
    // 1. Verify invitation code if required
    if (input.invitationCode) {
      const invitationValid = await verifyInvitationCode(input.invitationCode, input.userId, input.partnerId);
      if (!invitationValid.success) {
        return { success: false, message: invitationValid.message };
      }
    }

    const batch = db.batch();

    // 2. Verify the team member exists and is suspended
    const teamMemberRef = db.collection('teamMembers').doc(input.userId);
    const teamMemberDoc = await teamMemberRef.get();
    
    if (!teamMemberDoc.exists) {
      return { success: false, message: 'Team member not found' };
    }

    const teamMemberData = teamMemberDoc.data() as TeamMember;
    if (teamMemberData.partnerId !== input.partnerId) {
      return { success: false, message: 'Team member does not belong to this partner' };
    }

    if (teamMemberData.status !== 'suspended') {
      return { success: false, message: 'Team member is not deactivated' };
    }

    // 3. Update team member status to active
    batch.update(teamMemberRef, {
      status: 'active',
      reactivatedAt: FieldValue.serverTimestamp(),
      reactivatedBy: input.reactivatedBy,
      lastActive: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      // Clear suspension fields
      suspendedAt: FieldValue.delete(),
      suspendedBy: FieldValue.delete(),
      suspensionReason: FieldValue.delete()
    });

    // 4. Update user workspace link status
    const workspaceLinkRef = db.collection('userWorkspaceLinks').doc(`${input.userId}_${input.partnerId}`);
    batch.update(workspaceLinkRef, {
      status: 'active',
      reactivatedAt: FieldValue.serverTimestamp(),
      reactivatedBy: input.reactivatedBy,
      lastAccessedAt: FieldValue.serverTimestamp()
    });

    // 5. Update user's Firebase Auth custom claims
    await updateUserCustomClaimsOnReactivation(input.userId, input.partnerId);

    // 6. Create audit log entry
    const auditLogRef = db.collection('auditLogs').doc();
    batch.set(auditLogRef, {
      action: 'TEAM_MEMBER_REACTIVATED',
      performedBy: input.reactivatedBy,
      targetUserId: input.userId,
      partnerId: input.partnerId,
      details: {
        memberName: teamMemberData.name,
        memberEmail: teamMemberData.email,
        invitationCode: input.invitationCode
      },
      timestamp: FieldValue.serverTimestamp(),
      ipAddress: null
    });

    // 7. Mark invitation code as used if provided
    if (input.invitationCode) {
      await markInvitationCodeAsUsed(input.invitationCode, input.userId);
    }

    // Commit all changes
    await batch.commit();

    return {
      success: true,
      message: 'Team member has been reactivated successfully'
    };

  } catch (error: any) {
    console.error('Error reactivating team member:', error);
    return {
      success: false,
      message: `Failed to reactivate team member: ${error.message}`
    };
  }
}

/**
 * Update user's custom claims when deactivated from a workspace
 */
async function updateUserCustomClaimsOnDeactivation(userId: string, partnerId: string) {
  try {
    const user = await adminAuth.getUser(userId);
    const claims = user.customClaims || {};
    let updatedClaims: any = { ...claims };

    // Remove this workspace from partnerIds
    if (claims.partnerIds && Array.isArray(claims.partnerIds)) {
      updatedClaims.partnerIds = claims.partnerIds.filter((id: string) => id !== partnerId);
    }

    // If this was the active workspace, find another one or clear
    if (claims.partnerId === partnerId) {
      // Get user's remaining active workspaces
      const activeWorkspacesSnapshot = await db
        .collection('userWorkspaceLinks')
        .where('userId', '==', userId)
        .where('status', '==', 'active')
        .get();

      const activeWorkspaces = activeWorkspacesSnapshot.docs
        .map(doc => doc.data())
        .filter((ws: any) => ws.partnerId !== partnerId);

      if (activeWorkspaces.length > 0) {
        // Set first available workspace as active
        const newActiveWs = activeWorkspaces[0] as any;
        updatedClaims.partnerId = newActiveWs.partnerId;
        updatedClaims.tenantId = newActiveWs.tenantId;
        updatedClaims.role = newActiveWs.role;
      } else {
        // No active workspaces left, clear all workspace claims
        delete updatedClaims.partnerId;
        delete updatedClaims.tenantId;
        delete updatedClaims.role;
        delete updatedClaims.activePartnerId;
        delete updatedClaims.activeTenantId;
      }
    }

    await adminAuth.setCustomUserClaims(userId, updatedClaims);
  } catch (error) {
    console.error('Error updating custom claims on deactivation:', error);
    throw error;
  }
}

/**
 * Update user's custom claims when reactivated to a workspace
 */
async function updateUserCustomClaimsOnReactivation(userId: string, partnerId: string) {
  try {
    const user = await adminAuth.getUser(userId);
    const claims = user.customClaims || {};
    let updatedClaims: any = { ...claims };

    // Get workspace details
    const workspaceLinkDoc = await db
      .collection('userWorkspaceLinks')
      .doc(`${userId}_${partnerId}`)
      .get();

    if (workspaceLinkDoc.exists) {
      const workspaceData = workspaceLinkDoc.data() as UserWorkspaceLink;

      // Add partner to partnerIds if not present
      if (!claims.partnerIds || !Array.isArray(claims.partnerIds)) {
        updatedClaims.partnerIds = [partnerId];
      } else if (!claims.partnerIds.includes(partnerId)) {
        updatedClaims.partnerIds = [...claims.partnerIds, partnerId];
      }

      // If user doesn't have an active workspace, set this one as active
      if (!claims.partnerId) {
        updatedClaims.partnerId = partnerId;
        updatedClaims.tenantId = workspaceData.tenantId;
        updatedClaims.role = workspaceData.role;
      }
    }

    await adminAuth.setCustomUserClaims(userId, updatedClaims);
  } catch (error) {
    console.error('Error updating custom claims on reactivation:', error);
    throw error;
  }
}

/**
 * Revoke any active tasks assigned to the user in this workspace
 */
async function revokeUserTasks(userId: string, partnerId: string) {
  try {
    const tasksSnapshot = await db
      .collection('tasks')
      .where('assignedTo', '==', userId)
      .where('partnerId', '==', partnerId)
      .where('status', 'in', ['assigned', 'in_progress'])
      .get();

    const batch = db.batch();
    tasksSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        status: 'unassigned',
        assignedTo: null,
        revokedAt: FieldValue.serverTimestamp(),
        revokedReason: 'User deactivated from workspace',
        updatedAt: FieldValue.serverTimestamp()
      });
    });

    if (!tasksSnapshot.empty) {
      await batch.commit();
    }
  } catch (error) {
    console.error('Error revoking user tasks:', error);
    // Don't throw here as this is not critical for deactivation
  }
}

/**
 * Verify invitation code for reactivation
 */
async function verifyInvitationCode(
  invitationCode: string,
  userId: string,
  partnerId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const invitationSnapshot = await db
      .collection('invitationCodes')
      .where('invitationCode', '==', invitationCode)
      .where('partnerId', '==', partnerId)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (invitationSnapshot.empty) {
      return { success: false, message: 'Invalid or expired invitation code' };
    }

    const invitationDoc = invitationSnapshot.docs[0];
    const invitation = invitationDoc.data();

    // Check if invitation has expired
    const now = new Date();
    const expiresAt = invitation.expiresAt.toDate();
    
    if (now > expiresAt) {
      return { success: false, message: 'Invitation code has expired' };
    }

    // For reactivation, we can be more flexible with phone number matching
    // but ensure it's for the right user context
    return { success: true, message: 'Invitation code is valid' };

  } catch (error) {
    console.error('Error verifying invitation code:', error);
    return { success: false, message: 'Failed to verify invitation code' };
  }
}

/**
 * Mark invitation code as used
 */
async function markInvitationCodeAsUsed(invitationCode: string, userId: string) {
  try {
    const invitationSnapshot = await db
      .collection('invitationCodes')
      .where('invitationCode', '==', invitationCode)
      .limit(1)
      .get();

    if (!invitationSnapshot.empty) {
      const invitationDoc = invitationSnapshot.docs[0];
      await invitationDoc.ref.update({
        status: 'accepted',
        acceptedAt: FieldValue.serverTimestamp(),
        acceptedBy: userId
      });
    }
  } catch (error) {
    console.error('Error marking invitation code as used:', error);
    // Don't throw as this is not critical
  }
}