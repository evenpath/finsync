// src/app/api/partners/[partnerId]/team-members/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import { deactivateTeamMember, reactivateTeamMember } from '@/services/team-member-service';

// Helper function to verify partner admin authorization
async function verifyPartnerAdmin(partnerId: string, authHeader: string) {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header' };
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    const customClaims = decodedToken;
    const isPartnerAdmin = customClaims.role === 'partner_admin' && customClaims.partnerId === partnerId;
    const isSuperAdmin = customClaims.role === 'Super Admin' || customClaims.role === 'Admin';
    
    if (!isPartnerAdmin && !isSuperAdmin) {
      return { success: false, error: 'Insufficient permissions' };
    }

    return { success: true, userId: decodedToken.uid };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { partnerId: string; userId: string } }
) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization') || '';
    const { partnerId, userId } = params;

    if (!partnerId || !userId) {
      return NextResponse.json({
        success: false,
        message: 'Partner ID and User ID are required'
      }, { status: 400 });
    }

    // Verify authorization
    const authResult = await verifyPartnerAdmin(partnerId, authHeader);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: authResult.error
      }, { status: 403 });
    }

    // Get team member details
    const teamMemberDoc = await db.collection('teamMembers').doc(userId).get();
    
    if (!teamMemberDoc.exists) {
      return NextResponse.json({
        success: false,
        message: 'Team member not found'
      }, { status: 404 });
    }

    const teamMemberData = teamMemberDoc.data();
    
    if (teamMemberData?.partnerId !== partnerId) {
      return NextResponse.json({
        success: false,
        message: 'Team member does not belong to this partner'
      }, { status: 403 });
    }

    // Get workspace link details
    const workspaceLinkDoc = await db
      .collection('userWorkspaceLinks')
      .doc(`${userId}_${partnerId}`)
      .get();

    const workspaceLinkData = workspaceLinkDoc.exists ? workspaceLinkDoc.data() : null;

    // Get recent activity/audit logs
    const auditLogsSnapshot = await db
      .collection('auditLogs')
      .where('targetUserId', '==', userId)
      .where('partnerId', '==', partnerId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const auditLogs = auditLogsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
    }));

    // Get Firebase user details
    let firebaseUser = null;
    try {
      firebaseUser = await adminAuth.getUser(userId);
    } catch (error) {
      console.warn(`Could not fetch Firebase user details for ${userId}:`, error);
    }

    const memberDetails = {
      ...teamMemberData,
      id: userId,
      workspaceLink: workspaceLinkData,
      auditLogs,
      firebaseUser: firebaseUser ? {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
        disabled: firebaseUser.disabled,
        metadata: {
          creationTime: firebaseUser.metadata.creationTime,
          lastSignInTime: firebaseUser.metadata.lastSignInTime
        }
      } : null
    };

    return NextResponse.json({
      success: true,
      data: memberDetails
    });

  } catch (error: any) {
    console.error("Error fetching team member details:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch team member details"
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { partnerId: string; userId: string } }
) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization') || '';
    const body = await request.json();
    const { partnerId, userId } = params;
    const { action, reason, invitationCode } = body;

    if (!partnerId || !userId) {
      return NextResponse.json({
        success: false,
        message: 'Partner ID and User ID are required'
      }, { status: 400 });
    }

    // Verify authorization
    const authResult = await verifyPartnerAdmin(partnerId, authHeader);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: authResult.error
      }, { status: 403 });
    }

    // Prevent self-deactivation
    if (action === 'deactivate' && authResult.userId === userId) {
      return NextResponse.json({
        success: false,
        message: 'You cannot deactivate yourself'
      }, { status: 400 });
    }

    let result;

    if (action === 'deactivate') {
      result = await deactivateTeamMember({
        partnerId,
        userId,
        deactivatedBy: authResult.userId,
        reason
      });
    } else if (action === 'reactivate') {
      if (!invitationCode) {
        return NextResponse.json({
          success: false,
          message: 'Invitation code is required for reactivation'
        }, { status: 400 });
      }

      result = await reactivateTeamMember({
        partnerId,
        userId,
        reactivatedBy: authResult.userId,
        invitationCode
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid action. Use "deactivate" or "reactivate"'
      }, { status: 400 });
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        requiresNewInvitation: result.requiresNewInvitation
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Error updating team member:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update team member"
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { partnerId: string; userId: string } }
) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization') || '';
    const { partnerId, userId } = params;

    if (!partnerId || !userId) {
      return NextResponse.json({
        success: false,
        message: 'Partner ID and User ID are required'
      }, { status: 400 });
    }

    // Verify authorization (only super admins can delete)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Missing or invalid authorization header'
      }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    const isSuperAdmin = decodedToken.role === 'Super Admin';
    
    if (!isSuperAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Only Super Admins can permanently delete team members'
      }, { status: 403 });
    }

    // Prevent self-deletion
    if (decodedToken.uid === userId) {
      return NextResponse.json({
        success: false,
        message: 'You cannot delete yourself'
      }, { status: 400 });
    }

    const batch = db.batch();

    // Delete team member document
    const teamMemberRef = db.collection('teamMembers').doc(userId);
    batch.delete(teamMemberRef);

    // Delete workspace link
    const workspaceLinkRef = db.collection('userWorkspaceLinks').doc(`${userId}_${partnerId}`);
    batch.delete(workspaceLinkRef);

    // Create audit log
    const auditLogRef = db.collection('auditLogs').doc();
    batch.set(auditLogRef, {
      action: 'TEAM_MEMBER_DELETED',
      performedBy: decodedToken.uid,
      targetUserId: userId,
      partnerId: partnerId,
      details: {
        reason: 'Permanent deletion by Super Admin'
      },
      timestamp: new Date(),
      ipAddress: null
    });

    // Remove from Firebase Auth custom claims
    const user = await adminAuth.getUser(userId);
    const claims = user.customClaims || {};
    
    const updatedClaims: any = { ...claims };
    if (claims.partnerIds && Array.isArray(claims.partnerIds)) {
      updatedClaims.partnerIds = claims.partnerIds.filter((id: string) => id !== partnerId);
    }
    
    if (claims.partnerId === partnerId) {
      // Remove active workspace if this was it
      delete updatedClaims.partnerId;
      delete updatedClaims.tenantId;
      delete updatedClaims.role;
    }

    await adminAuth.setCustomUserClaims(userId, updatedClaims);

    // Commit all changes
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'Team member has been permanently deleted'
    });

  } catch (error: any) {
    console.error("Error deleting team member:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to delete team member"
    }, { status: 500 });
  }
}