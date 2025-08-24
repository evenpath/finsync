// src/app/api/partners/[partnerId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

// Helper function to verify partner access
async function verifyPartnerAccess(partnerId: string, authHeader: string) {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header' };
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    const customClaims = decodedToken;
    const isPartnerAdmin = customClaims.role === 'partner_admin' && customClaims.partnerId === partnerId;
    const isEmployee = customClaims.role === 'employee' && customClaims.partnerId === partnerId;
    const isSuperAdmin = customClaims.role === 'Super Admin' || customClaims.role === 'Admin';
    
    if (!isPartnerAdmin && !isEmployee && !isSuperAdmin) {
      return { success: false, error: 'Insufficient permissions' };
    }

    return { 
      success: true, 
      userId: decodedToken.uid,
      role: customClaims.role,
      isPartnerAdmin: isPartnerAdmin || isSuperAdmin
    };
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
    const authResult = await verifyPartnerAccess(partnerId, authHeader);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: authResult.error
      }, { status: 403 });
    }

    // Get partner details
    const partnerDoc = await db.collection('partners').doc(partnerId).get();
    
    if (!partnerDoc.exists) {
      return NextResponse.json({
        success: false,
        message: 'Partner not found'
      }, { status: 404 });
    }

    const partnerData = partnerDoc.data();
    
    // Get partner statistics
    const teamMembersSnapshot = await db
      .collection('teamMembers')
      .where('partnerId', '==', partnerId)
      .get();

    const teamMembers = teamMembersSnapshot.docs.map(doc => doc.data());
    const activeMembers = teamMembers.filter(member => member.status === 'active').length;
    const suspendedMembers = teamMembers.filter(member => member.status === 'suspended').length;

    const tasksSnapshot = await db
      .collection('tasks')
      .where('partnerId', '==', partnerId)
      .get();

    const tasks = tasksSnapshot.docs.map(doc => doc.data());
    const activeTasks = tasks.filter(task => task.status !== 'completed').length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;

    const partnerInfo = {
      id: partnerId,
      ...partnerData,
      statistics: {
        totalTeamMembers: teamMembers.length,
        activeMembers,
        suspendedMembers,
        activeTasks,
        completedTasks,
        totalTasks: tasks.length
      },
      // Only include sensitive data for admins
      ...(authResult.isPartnerAdmin && {
        tenantId: partnerData?.tenantId,
        createdAt: partnerData?.createdAt,
        updatedAt: partnerData?.updatedAt
      })
    };

    return NextResponse.json({
      success: true,
      data: partnerInfo
    });

  } catch (error: any) {
    console.error("Error fetching partner details:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch partner details"
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

    if (!partnerId) {
      return NextResponse.json({
        success: false,
        message: 'Partner ID is required'
      }, { status: 400 });
    }

    // Verify authorization (only partner admins can update)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Missing or invalid authorization header'
      }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    const customClaims = decodedToken;
    const isPartnerAdmin = customClaims.role === 'partner_admin' && customClaims.partnerId === partnerId;
    const isSuperAdmin = customClaims.role === 'Super Admin' || customClaims.role === 'Admin';
    
    if (!isPartnerAdmin && !isSuperAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Only partner administrators can update partner details'
      }, { status: 403 });
    }

    // Validate update data
    const allowedUpdates = ['name', 'businessName', 'phone', 'industry', 'description', 'settings'];
    const updates = Object.keys(body).reduce((acc, key) => {
      if (allowedUpdates.includes(key) && body[key] !== undefined) {
        acc[key] = body[key];
      }
      return acc;
    }, {} as any);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No valid updates provided'
      }, { status: 400 });
    }

    // Add update timestamp
    updates.updatedAt = new Date();
    updates.updatedBy = decodedToken.uid;

    // Update partner document
    await db.collection('partners').doc(partnerId).update(updates);

    // Create audit log
    await db.collection('auditLogs').add({
      action: 'PARTNER_UPDATED',
      performedBy: decodedToken.uid,
      partnerId: partnerId,
      details: {
        updatedFields: Object.keys(updates).filter(key => !['updatedAt', 'updatedBy'].includes(key)),
        updates: updates
      },
      timestamp: new Date(),
      ipAddress: null
    });

    return NextResponse.json({
      success: true,
      message: 'Partner details updated successfully',
      updatedFields: Object.keys(updates)
    });

  } catch (error: any) {
    console.error("Error updating partner:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update partner details"
    }, { status: 500 });
  }
}

export async function DELETE(
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
        message: 'Only Super Admins can delete partners'
      }, { status: 403 });
    }

    // Check if partner has active team members
    const teamMembersSnapshot = await db
      .collection('teamMembers')
      .where('partnerId', '==', partnerId)
      .where('status', '==', 'active')
      .get();

    if (!teamMembersSnapshot.empty) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete partner with active team members. Deactivate all members first.'
      }, { status: 400 });
    }

    const batch = db.batch();

    // Delete partner document
    const partnerRef = db.collection('partners').doc(partnerId);
    batch.delete(partnerRef);

    // Delete all team members for this partner
    const allTeamMembersSnapshot = await db
      .collection('teamMembers')
      .where('partnerId', '==', partnerId)
      .get();

    allTeamMembersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete all workspace links for this partner
    const workspaceLinksSnapshot = await db
      .collection('userWorkspaceLinks')
      .where('partnerId', '==', partnerId)
      .get();

    workspaceLinksSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Create audit log
    const auditLogRef = db.collection('auditLogs').doc();
    batch.set(auditLogRef, {
      action: 'PARTNER_DELETED',
      performedBy: decodedToken.uid,
      partnerId: partnerId,
      details: {
        reason: 'Partner deletion by Super Admin',
        teamMembersDeleted: allTeamMembersSnapshot.size,
        workspaceLinksDeleted: workspaceLinksSnapshot.size
      },
      timestamp: new Date(),
      ipAddress: null
    });

    // Commit all changes
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'Partner and all associated data have been permanently deleted'
    });

  } catch (error: any) {
    console.error("Error deleting partner:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to delete partner"
    }, { status: 500 });
  }
}