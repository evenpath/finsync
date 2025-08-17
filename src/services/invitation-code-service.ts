// src/services/invitation-code-service.ts
'use server';

import { db, adminAuth } from '../lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { CodeBasedInvitation, CreateInvitationCodeOutput, AcceptInvitationCodeOutput } from '../lib/types/invitation';
import type { TeamMember, UserWorkspaceLink, WorkspaceAccess } from '../lib/types';
import type { UserRecord } from 'firebase-admin/auth';


/**
 * Generate a unique 8-character alphanumeric invitation code
 */
function generateUniqueCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars like 0,O,1,I
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if invitation code already exists
 */
async function isCodeUnique(code: string): Promise<boolean> {
  if (!db) return false;
  
  const existingInvitation = await db
    .collection('invitationCodes')
    .where('invitationCode', '==', code)
    .where('status', '==', 'pending')
    .limit(1)
    .get();
    
  return existingInvitation.empty;
}

/**
 * Generate unique invitation code for workspace
 */
export async function generateInvitationCode(input: {
  phoneNumber: string;
  name: string;
  partnerId: string;
  tenantId: string;
  role: 'employee' | 'partner_admin';
  invitedBy: string;
}): Promise<CreateInvitationCodeOutput> {
  if (!db || !adminAuth) {
    return {
      success: false,
      message: 'Database or Auth not available'
    };
  }

  try {
    // Get partner and inviter details
    const partnerDoc = await db.collection('partners').doc(input.partnerId).get();
    if (!partnerDoc.exists) {
      return {
        success: false,
        message: 'Partner organization not found'
      };
    }
    const partnerData = partnerDoc.data();
    
    // Get inviter details (they exist in a tenant)
    const tenantAuth = adminAuth.tenantManager().authForTenant(input.tenantId);
    const inviterUser = await tenantAuth.getUser(input.invitedBy);
    
    // Generate unique code (retry up to 5 times if collision)
    let invitationCode = '';
    let attempts = 0;
    const maxAttempts = 5;

    do {
      invitationCode = generateUniqueCode();
      attempts++;
    } while (!(await isCodeUnique(invitationCode)) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return {
        success: false,
        message: 'Failed to generate unique invitation code. Please try again.'
      };
    }

    // Check if user already has pending invitation for this workspace
    const existingInvitation = await db
      .collection('invitationCodes')
      .where('phoneNumber', '==', input.phoneNumber)
      .where('partnerId', '==', input.partnerId)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (!existingInvitation.empty) {
      // Cancel existing invitation and create new one
      const existingDoc = existingInvitation.docs[0];
      await existingDoc.ref.update({
        status: 'cancelled',
        cancelledAt: FieldValue.serverTimestamp()
      });
    }

    // Create invitation code document
    const invitationRef = db.collection('invitationCodes').doc();
    const invitation: CodeBasedInvitation = {
      id: invitationRef.id,
      invitationCode,
      phoneNumber: input.phoneNumber,
      name: input.name,
      partnerId: input.partnerId,
      tenantId: input.tenantId,
      role: input.role,
      invitedBy: input.invitedBy,
      invitedAt: FieldValue.serverTimestamp() as any,
      expiresAt: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'pending',
      partnerName: partnerData?.name || 'Unknown Organization',
      inviterName: inviterUser?.displayName || 'Unknown Admin',
      inviterEmail: inviterUser?.email || 'unknown@example.com'
    };

    await invitationRef.set(invitation);

    return {
      success: true,
      message: 'Invitation code generated successfully',
      invitationCode,
      expiresAt: invitation.expiresAt.toDate().toISOString(),
      partnerName: invitation.partnerName
    };

  } catch (error: any) {
    console.error('Error generating invitation code:', error);
    return {
      success: false,
      message: `Failed to generate invitation code: ${error.message}`
    };
  }
}

/**
 * Accept invitation using code
 */
export async function acceptInvitationByCode(input: {
  invitationCode: string;
  phoneNumber: string;
  uid: string;
}): Promise<AcceptInvitationCodeOutput> {
  if (!db || !adminAuth) {
    return {
      success: false,
      message: 'Database or Auth not available'
    };
  }

  try {
    // Find invitation by code
    const invitationQuery = await db
      .collection('invitationCodes')
      .where('invitationCode', '==', input.invitationCode.toUpperCase())
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (invitationQuery.empty) {
      return {
        success: false,
        message: 'Invalid or expired invitation code'
      };
    }

    const invitationDoc = invitationQuery.docs[0];
    const invitation = invitationDoc.data() as CodeBasedInvitation;

    // Check if code has expired
    const now = Timestamp.now();
    if (invitation.expiresAt.toMillis() < now.toMillis()) {
      await invitationDoc.ref.update({
        status: 'expired',
        expiredAt: FieldValue.serverTimestamp()
      });
      
      return {
        success: false,
        message: 'This invitation code has expired'
      };
    }

    // Verify phone number matches (optional security check)
    if (invitation.phoneNumber !== input.phoneNumber) {
      return {
        success: false,
        message: 'Phone number does not match the invitation'
      };
    }

    // Check if user already exists in this workspace
    const existingWorkspaceLink = await db
      .collection('userWorkspaceLinks')
      .where('userId', '==', input.uid)
      .where('partnerId', '==', invitation.partnerId)
      .limit(1)
      .get();

    if (!existingWorkspaceLink.empty) {
      return {
        success: false,
        message: 'You are already a member of this workspace'
      };
    }

    // Create user workspace link
    const workspaceLinkRef = db.collection('userWorkspaceLinks').doc(`${input.uid}_${invitation.partnerId}`);
    const workspaceLink: UserWorkspaceLink = {
      userId: input.uid,
      partnerId: invitation.partnerId,
      tenantId: invitation.tenantId,
      role: invitation.role,
      status: 'active',
      permissions: [],
      joinedAt: FieldValue.serverTimestamp() as any,
      invitedBy: invitation.invitedBy,
      invitedAt: invitation.invitedAt,
      lastAccessedAt: FieldValue.serverTimestamp() as any,
      partnerName: invitation.partnerName,
      partnerAvatar: null
    };

    await workspaceLinkRef.set(workspaceLink, { merge: true });
    
    // Create Team Member document
    const userRecord = await adminAuth.getUser(input.uid);
    const teamMemberRef = db.collection('teamMembers').doc(input.uid);
    const teamMemberData: Omit<TeamMember, 'id' | 'createdAt'> = {
        userId: input.uid,
        partnerId: invitation.partnerId,
        tenantId: invitation.tenantId,
        name: userRecord.displayName || invitation.name,
        email: userRecord.email || '',
        phone: invitation.phoneNumber,
        role: invitation.role,
        status: 'active', // User is now active
        avatar: userRecord.photoURL || `https://placehold.co/40x40.png?text=${invitation.name.charAt(0)}`,
        joinedDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        tasksCompleted: 0,
        avgCompletionTime: '-',
        skills: [],
    };
    await teamMemberRef.set({ ...teamMemberData, createdAt: FieldValue.serverTimestamp() }, { merge: true });


    // Update user's Firebase Auth custom claims
    const currentUser = await adminAuth.getUser(input.uid);
    const currentClaims = currentUser.customClaims || {};
    
    const newWorkspaceAccess: WorkspaceAccess = {
        partnerId: invitation.partnerId,
        tenantId: invitation.tenantId,
        role: invitation.role,
        permissions: [],
        status: 'active',
        partnerName: invitation.partnerName,
        partnerAvatar: undefined,
    };
    const updatedWorkspaces = [...(currentClaims.workspaces || []), newWorkspaceAccess];

    const updatedClaims = {
      ...currentClaims,
      role: invitation.role,
      partnerId: invitation.partnerId,
      tenantId: invitation.tenantId,
      partnerIds: [...(currentClaims.partnerIds || []), invitation.partnerId],
      workspaces: updatedWorkspaces,
      activePartnerId: invitation.partnerId,
      activeTenantId: invitation.tenantId
    };

    await adminAuth.setCustomUserClaims(input.uid, updatedClaims);

    // Mark invitation as accepted
    await invitationDoc.ref.update({
      status: 'accepted',
      acceptedAt: FieldValue.serverTimestamp(),
      acceptedBy: input.uid
    });

    return {
      success: true,
      message: `Successfully joined ${invitation.partnerName}`,
      workspace: {
        partnerId: invitation.partnerId,
        tenantId: invitation.tenantId,
        partnerName: invitation.partnerName,
        role: invitation.role
      }
    };

  } catch (error: any) {
    console.error('Error accepting invitation by code:', error);
    return {
      success: false,
      message: `Failed to accept invitation: ${error.message}`
    };
  }
}

/**
 * Get invitation details by code (for validation/preview)
 */
export async function getInvitationByCode(invitationCode: string): Promise<{
  success: boolean;
  message: string;
  invitation?: CodeBasedInvitation;
}> {
  if (!db) {
    return {
      success: false,
      message: 'Database not available'
    };
  }

  try {
    const invitationQuery = await db
      .collection('invitationCodes')
      .where('invitationCode', '==', invitationCode.toUpperCase())
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (invitationQuery.empty) {
      return {
        success: false,
        message: 'Invitation code not found or expired'
      };
    }

    const invitation = invitationQuery.docs[0].data() as CodeBasedInvitation;

    // Check if expired
    const now = Timestamp.now();
    if (invitation.expiresAt.toMillis() < now.toMillis()) {
      return {
        success: false,
        message: 'This invitation code has expired'
      };
    }

    return {
      success: true,
      message: 'Invitation found',
      invitation
    };

  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to retrieve invitation'
    };
  }
}
