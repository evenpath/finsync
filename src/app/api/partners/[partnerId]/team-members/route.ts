// src/app/api/partners/[partnerId]/team-members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import type { TeamMember } from '@/lib/types';

// Helper function to verify partner admin authorization
async function verifyPartnerAdmin(partnerId: string, authHeader: string) {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header' };
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Check if user is partner admin for this specific partner
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
  { params }: { params: { partnerId: string } }
) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization') || '';
    const partnerId = params.partnerId;

    if (!partnerId) {
      return NextResponse.json({
        success: false,
        message: 'Partner ID is required'
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

    // Get all team members for this partner
    const teamMembersSnapshot = await db
      .collection('teamMembers')
      .where('partnerId', '==', partnerId)
      .orderBy('joinedDate', 'desc')
      .get();

    const teamMembers: TeamMember[] = teamMembersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TeamMember[];

    return NextResponse.json({
      success: true,
      data: teamMembers
    });

  } catch (error: any) {
    console.error("Error fetching team members:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch team members"
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization') || '';
    const body = await request.json();
    const partnerId = params.partnerId;
    const { userId, status, action } = body;

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

    if (action === 'deactivate') {
      return await deactivateTeamMember(partnerId, userId);
    } else if (action === 'reactivate') {
      return await reactivateTeamMember(partnerId, userId);
    } else if (action === 'update_status') {
      return await updateTeamMemberStatus(partnerId, userId, status);
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action'
    }, { status: 400 });

  } catch (error: any) {
    console.error("Error updating team member:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update team member"
    }, { status: 500 });
  }
}

async function deactivateTeamMember(partnerId: string, userId: string) {
  const batch = db.batch();
  
  try {
    // 1. Update team member status to suspended
    const teamMemberRef = db.collection('teamMembers').doc(userId);
    batch.update(teamMemberRef, {
      status: 'suspended',
      suspendedAt: new Date(),
      updatedAt: new Date()
    });

    // 2. Update user workspace link status to suspended
    const workspaceLinkRef = db.collection('userWorkspaceLinks').doc(`${userId}_${partnerId}`);
    batch.update(workspaceLinkRef, {
      status: 'suspended',
      suspendedAt: new Date(),
      lastAccessedAt: new Date()
    });

    // 3. Update user's custom claims to remove access
    const user = await adminAuth.getUser(userId);
    const claims = user.customClaims || {};
    
    // Remove this workspace from active claims if it's the current active one
    let updatedClaims: any = { ...claims };
    
    if (claims.partnerId === partnerId) {
      // Find another active workspace or clear current one
      const userWorkspaces = await db
        .collection('userWorkspaceLinks')
        .where('userId', '==', userId)
        .where('status', '==', 'active')
        .get();
      
      const activeWorkspaces = userWorkspaces.docs
        .map(doc => doc.data())
        .filter(ws => ws.partnerId !== partnerId); // Exclude the one being deactivated
      
      if (activeWorkspaces.length > 0) {
        // Set the first active workspace as current
        const activeWs = activeWorkspaces[0];
        updatedClaims.partnerId = activeWs.partnerId;
        updatedClaims.tenantId = activeWs.tenantId;
        updatedClaims.role = activeWs.role;
      } else {
        // No active workspaces left, clear claims
        delete updatedClaims.partnerId;
        delete updatedClaims.tenantId;
        delete updatedClaims.role;
      }
      
      // Update partnerIds array
      if (claims.partnerIds && Array.isArray(claims.partnerIds)) {
        updatedClaims.partnerIds = claims.partnerIds.filter((id: string) => id !== partnerId);
      }
    }

    await adminAuth.setCustomUserClaims(userId, updatedClaims);

    // 4. Commit all updates
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'Team member has been deactivated successfully'
    });

  } catch (error: any) {
    console.error("Error deactivating team member:", error);
    return NextResponse.json({
      success: false,
      message: `Failed to deactivate team member: ${error.message}`
    }, { status: 500 });
  }
}

async function reactivateTeamMember(partnerId: string, userId: string) {
  const batch = db.batch();
  
  try {
    // Get partner details for tenant info
    const partnerDoc = await db.collection('partners').doc(partnerId).get();
    if (!partnerDoc.exists) {
      return NextResponse.json({
        success: false,
        message: 'Partner not found'
      }, { status: 404 });
    }
    
    const partnerData = partnerDoc.data();
    const tenantId = partnerData?.tenantId;

    // 1. Update team member status to active
    const teamMemberRef = db.collection('teamMembers').doc(userId);
    batch.update(teamMemberRef, {
      status: 'active',
      reactivatedAt: new Date(),
      updatedAt: new Date()
    });

    // 2. Update user workspace link status to active
    const workspaceLinkRef = db.collection('userWorkspaceLinks').doc(`${userId}_${partnerId}`);
    batch.update(workspaceLinkRef, {
      status: 'active',
      reactivatedAt: new Date(),
      lastAccessedAt: new Date()
    });

    // 3. Update user's custom claims to restore access
    const user = await adminAuth.getUser(userId);
    const claims = user.customClaims || {};
    let updatedClaims: any = { ...claims };

    // Get the workspace link to get role info
    const workspaceLinkDoc = await workspaceLinkRef.get();
    const workspaceData = workspaceLinkDoc.data();

    if (workspaceData) {
      // If user doesn't have an active workspace, make this one active
      if (!claims.partnerId || !claims.tenantId) {
        updatedClaims.partnerId = partnerId;
        updatedClaims.tenantId = tenantId;
        updatedClaims.role = workspaceData.role;
      }

      // Add to partnerIds if not already present
      if (!claims.partnerIds || !Array.isArray(claims.partnerIds)) {
        updatedClaims.partnerIds = [partnerId];
      } else if (!claims.partnerIds.includes(partnerId)) {
        updatedClaims.partnerIds = [...claims.partnerIds, partnerId];
      }
    }

    await adminAuth.setCustomUserClaims(userId, updatedClaims);

    // 4. Commit all updates
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'Team member has been reactivated successfully'
    });

  } catch (error: any) {
    console.error("Error reactivating team member:", error);
    return NextResponse.json({
      success: false,
      message: `Failed to reactivate team member: ${error.message}`
    }, { status: 500 });
  }
}

async function updateTeamMemberStatus(partnerId: string, userId: string, status: string) {
  try {
    // Update team member status
    await db.collection('teamMembers').doc(userId).update({
      status,
      updatedAt: new Date()
    });

    // Update corresponding workspace link status
    await db.collection('userWorkspaceLinks').doc(`${userId}_${partnerId}`).update({
      status,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Team member status updated successfully'
    });

  } catch (error: any) {
    console.error("Error updating team member status:", error);
    return NextResponse.json({
      success: false,
      message: `Failed to update status: ${error.message}`
    }, { status: 500 });
  }
}