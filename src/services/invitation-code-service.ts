// src/services/invitation-code-service.ts
'use server';

import { db, adminAuth } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { CodeBasedInvitation, CreateInvitationCodeOutput, AcceptInvitationCodeOutput } from '@/lib/types/invitation';
import type { TeamMember } from '@/lib/types';

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

    const inviterUser = await adminAuth.getUser(input.invitedBy);
    const partnerData = partnerDoc.data();
    
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
  console.log(`[DEBUG] acceptInvitationByCode: Attempting to accept code '${input.invitationCode}' for user '${input.uid}'`); // DEBUG
  if (!db || !adminAuth) {
    console.error('[DEBUG] acceptInvitationByCode: Database or Auth not available.'); // DEBUG
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
      console.error(`[DEBUG] acceptInvitationByCode: Query for code '${input.invitationCode.toUpperCase()}' returned no results.`); // DEBUG
      return {
        success: false,
        message: 'Invalid or expired invitation code'
      };
    }

    const invitationDoc = invitationQuery.docs[0];
    const invitation = invitationDoc.data() as CodeBasedInvitation;
    console.log('[DEBUG] acceptInvitationByCode: Found invitation document:', invitationDoc.id); // DEBUG

    // Check if code has expired
    const now = Timestamp.now();
    if (invitation.expiresAt.toMillis() < now.toMillis()) {
      console.warn(`[DEBUG] acceptInvitationByCode: Code expired at ${invitation.expiresAt.toDate()}`); // DEBUG
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
      console.error(`[DEBUG] acceptInvitationByCode: Phone number mismatch. Expected ${invitation.phoneNumber}, got ${input.phoneNumber}`); // DEBUG
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
      console.warn(`[DEBUG] acceptInvitationByCode: User ${input.uid} already in workspace ${invitation.partnerId}`); // DEBUG
      return {
        success: false,
        message: 'You are already a member of this workspace'
      };
    }

    // Create user workspace link
    const workspaceLinkRef = db.collection('userWorkspaceLinks').doc();
    const workspaceLink = {
      id: workspaceLinkRef.id,
      userId: input.uid,
      partnerId: invitation.partnerId,
      tenantId: invitation.tenantId,
      role: invitation.role,
      status: 'active',
      permissions: [],
      joinedAt: FieldValue.serverTimestamp(),
      invitedBy: invitation.invitedBy,
      invitedAt: invitation.invitedAt,
      lastAccessedAt: FieldValue.serverTimestamp(),
      partnerName: invitation.partnerName,
      partnerAvatar: null
    };

    await workspaceLinkRef.set(workspaceLink);
    console.log(`[DEBUG] acceptInvitationByCode: Created workspace link for user ${input.uid}`); // DEBUG
    
    // Create Team Member document
    const teamMemberRef = db.collection('teamMembers').doc(input.uid);
    const teamMemberData: Omit<TeamMember, 'id'> = {
        userId: input.uid,
        partnerId: invitation.partnerId,
        name: invitation.name,
        email: '', // Not available from phone invite, can be updated later
        phone: invitation.phoneNumber,
        role: invitation.role,
        status: 'active', // User is now active
        avatar: `https://placehold.co/40x40.png?text=${invitation.name.charAt(0)}`,
        joinedDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        tasksCompleted: 0,
        avgCompletionTime: '-',
        skills: [],
        createdAt: FieldValue.serverTimestamp(),
    };
    await teamMemberRef.set(teamMemberData, { merge: true });
    console.log(`[DEBUG] acceptInvitationByCode: Created team member document for user ${input.uid}`);


    // Update user's Firebase Auth custom claims
    const currentUser = await adminAuth.getUser(input.uid);
    const currentClaims = currentUser.customClaims || {};
    
    const updatedClaims = {
      ...currentClaims,
      role: invitation.role,
      partnerId: invitation.partnerId,
      tenantId: invitation.tenantId,
      partnerIds: [...(currentClaims.partnerIds || []), invitation.partnerId],
      activePartnerId: invitation.partnerId,
      activeTenantId: invitation.tenantId
    };

    await adminAuth.setCustomUserClaims(input.uid, updatedClaims);
    console.log(`[DEBUG] acceptInvitationByCode: Updated custom claims for user ${input.uid}`); // DEBUG

    // Mark invitation as accepted
    await invitationDoc.ref.update({
      status: 'accepted',
      acceptedAt: FieldValue.serverTimestamp(),
      acceptedBy: input.uid
    });
    console.log('[DEBUG] acceptInvitationByCode: Marked invitation as accepted.'); // DEBUG

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
    console.error('[DEBUG] acceptInvitationByCode: CATCH BLOCK', error); // DEBUG
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
  console.log(`[DEBUG] getInvitationByCode: Searching for code: '${invitationCode}'`); // DEBUG
  if (!db) {
    console.error("[DEBUG] getInvitationByCode: Database not available."); // DEBUG
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
      console.warn(`[DEBUG] getInvitationByCode: No pending invitation found for code '${invitationCode.toUpperCase()}'`); // DEBUG
      return {
        success: false,
        message: 'Invitation code not found or expired'
      };
    }

    const invitation = invitationQuery.docs[0].data() as CodeBasedInvitation;
    console.log(`[DEBUG] getInvitationByCode: Found invitation:`, invitation); // DEBUG

    // Check if expired
    const now = Timestamp.now();
    if (invitation.expiresAt.toMillis() < now.toMillis()) {
      console.warn(`[DEBUG] getInvitationByCode: Invitation ${invitationCode} has expired.`); // DEBUG
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
    console.error('[DEBUG] getInvitationByCode: CATCH BLOCK', error); // DEBUG
    return {
      success: false,
      message: 'Failed to retrieve invitation'
    };
  }
}
