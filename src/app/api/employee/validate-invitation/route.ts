// src/app/api/employee/validate-invitation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, adminAuth } from '@/lib/firebase-admin';
import { reactivateTeamMember } from '@/services/team-member-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invitationCode, phoneNumber } = body;

    if (!invitationCode) {
      return NextResponse.json({
        success: false,
        message: 'Invitation code is required'
      }, { status: 400 });
    }

    // Validate and process the invitation
    const result = await validateAndProcessInvitation(invitationCode, phoneNumber);
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    });

  } catch (error: any) {
    console.error("Error validating invitation:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to validate invitation"
    }, { status: 500 });
  }
}

async function validateAndProcessInvitation(invitationCode: string, phoneNumber?: string) {
  try {
    // 1. Find the invitation code
    const invitationSnapshot = await db
      .collection('invitationCodes')
      .where('invitationCode', '==', invitationCode)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (invitationSnapshot.empty) {
      return {
        success: false,
        message: 'Invalid or expired invitation code',
        requiresNewCode: true
      };
    }

    const invitationDoc = invitationSnapshot.docs[0];
    const invitation = invitationDoc.data();

    // 2. Check if invitation has expired
    const now = new Date();
    const expiresAt = invitation.expiresAt.toDate();
    
    if (now > expiresAt) {
      // Mark as expired
      await invitationDoc.ref.update({
        status: 'expired',
        expiredAt: now
      });

      return {
        success: false,
        message: 'Invitation code has expired. Please request a new one.',
        requiresNewCode: true
      };
    }

    // 3. Verify phone number if provided
    if (phoneNumber && invitation.phoneNumber !== phoneNumber) {
      return {
        success: false,
        message: 'Phone number does not match the invitation'
      };
    }

    // 4. Check if this is for a reactivation (user exists but is suspended)
    let userId = null;
    let userExists = false;
    let isReactivation = false;

    try {
      // Try to find existing user by phone number
      const userRecord = await adminAuth.getUserByPhoneNumber(invitation.phoneNumber);
      userId = userRecord.uid;
      userExists = true;

      // Check if user has a suspended workspace link for this partner
      const workspaceLinkDoc = await db
        .collection('userWorkspaceLinks')
        .doc(`${userId}_${invitation.partnerId}`)
        .get();

      if (workspaceLinkDoc.exists) {
        const workspaceData = workspaceLinkDoc.data();
        if (workspaceData?.status === 'suspended') {
          isReactivation = true;
        }
      }

    } catch (userError) {
      // User doesn't exist, this is a new invitation
      userExists = false;
    }

    if (isReactivation && userId) {
      // This is a reactivation case
      const reactivationResult = await reactivateTeamMember({
        partnerId: invitation.partnerId,
        userId: userId,
        reactivatedBy: 'system', // or get from invitation context
        invitationCode: invitationCode
      });

      if (reactivationResult.success) {
        return {
          success: true,
          message: 'Access has been restored successfully',
          isReactivation: true,
          partnerId: invitation.partnerId,
          partnerName: invitation.partnerName,
          role: invitation.role,
          userId: userId
        };
      } else {
        return {
          success: false,
          message: reactivationResult.message
        };
      }
    }

    // 5. For new invitations (not reactivation), return invitation details for processing
    return {
      success: true,
      message: 'Invitation is valid',
      isReactivation: false,
      invitation: {
        id: invitationDoc.id,
        partnerId: invitation.partnerId,
        partnerName: invitation.partnerName,
        tenantId: invitation.tenantId,
        role: invitation.role,
        name: invitation.name,
        phoneNumber: invitation.phoneNumber,
        invitedBy: invitation.invitedBy,
        invitedAt: invitation.invitedAt,
        expiresAt: invitation.expiresAt
      },
      userExists,
      userId
    };

  } catch (error) {
    console.error('Error validating invitation:', error);
    return {
      success: false,
      message: 'Failed to validate invitation code'
    };
  }
}

// Endpoint to get invitation status for a specific user/partner combination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const partnerId = searchParams.get('partnerId');

    if (!userId || !partnerId) {
      return NextResponse.json({
        success: false,
        message: 'User ID and Partner ID are required'
      }, { status: 400 });
    }

    // Check current status
    const status = await getInvitationStatusForUser(userId, partnerId);
    
    return NextResponse.json({
      success: true,
      data: status
    });

  } catch (error: any) {
    console.error("Error getting invitation status:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to get invitation status"
    }, { status: 500 });
  }
}

async function getInvitationStatusForUser(userId: string, partnerId: string) {
  try {
    // Get workspace link status
    const workspaceLinkDoc = await db
      .collection('userWorkspaceLinks')
      .doc(`${userId}_${partnerId}`)
      .get();

    const workspaceStatus = workspaceLinkDoc.exists ? workspaceLinkDoc.data() : null;

    // Get team member status
    const teamMemberDoc = await db.collection('teamMembers').doc(userId).get();
    const teamMemberData = teamMemberDoc.exists ? teamMemberDoc.data() : null;

    // Check for any pending invitations for this user/partner
    let pendingInvitations = [];
    
    try {
      const user = await adminAuth.getUser(userId);
      if (user.phoneNumber) {
        const invitationsSnapshot = await db
          .collection('invitationCodes')
          .where('phoneNumber', '==', user.phoneNumber)
          .where('partnerId', '==', partnerId)
          .where('status', '==', 'pending')
          .get();

        pendingInvitations = invitationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          invitedAt: doc.data().invitedAt?.toDate?.(),
          expiresAt: doc.data().expiresAt?.toDate?.()
        }));
      }
    } catch (error) {
      console.warn('Could not fetch user for invitation check:', error);
    }

    return {
      userId,
      partnerId,
      workspaceStatus: workspaceStatus ? {
        status: workspaceStatus.status,
        role: workspaceStatus.role,
        joinedAt: workspaceStatus.joinedAt?.toDate?.(),
        suspendedAt: workspaceStatus.suspendedAt?.toDate?.(),
        reactivatedAt: workspaceStatus.reactivatedAt?.toDate?.(),
        lastAccessedAt: workspaceStatus.lastAccessedAt?.toDate?.()
      } : null,
      teamMemberStatus: teamMemberData ? {
        status: teamMemberData.status,
        name: teamMemberData.name,
        email: teamMemberData.email,
        role: teamMemberData.role,
        joinedDate: teamMemberData.joinedDate,
        lastActive: teamMemberData.lastActive
      } : null,
      pendingInvitations,
      needsInvitation: !workspaceStatus || workspaceStatus.status === 'suspended',
      canBeReactivated: workspaceStatus?.status === 'suspended' && pendingInvitations.length > 0
    };

  } catch (error) {
    console.error('Error getting invitation status for user:', error);
    throw error;
  }
}