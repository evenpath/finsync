// src/app/api/employee/access-control/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

interface AccessCheckResult {
  hasAccess: boolean;
  status: 'active' | 'suspended' | 'not_found';
  workspaces: any[];
  activeWorkspace?: any;
  requiresInvitation?: boolean;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization') || '';
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Missing or invalid authorization header'
      }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (tokenError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid authentication token'
      }, { status: 401 });
    }

    const userId = decodedToken.uid;
    const result = await checkEmployeeAccess(userId);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error("Error checking employee access:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to check access permissions"
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization') || '';
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const partnerId = searchParams.get('partnerId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    // Verify admin or self access
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const isAdmin = ['Admin', 'Super Admin'].includes(decodedToken.role);
        const isOwnUser = decodedToken.uid === userId;
        const isPartnerAdmin = decodedToken.role === 'partner_admin' && 
                              partnerId && decodedToken.partnerId === partnerId;
        
        if (!isAdmin && !isOwnUser && !isPartnerAdmin) {
          return NextResponse.json({
            success: false,
            message: 'Insufficient permissions'
          }, { status: 403 });
        }
      } catch (tokenError) {
        return NextResponse.json({
          success: false,
          message: 'Invalid authentication token'
        }, { status: 401 });
      }
    }

    const result = await getEmployeeWorkspaceStatus(userId, partnerId);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error("Error getting employee workspace status:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to get workspace status"
    }, { status: 500 });
  }
}

/**
 * Check if an employee has access to any workspaces
 */
async function checkEmployeeAccess(userId: string): Promise<AccessCheckResult> {
  try {
    // Get all workspace links for this user
    const workspaceLinksSnapshot = await db
      .collection('userWorkspaceLinks')
      .where('userId', '==', userId)
      .get();

    if (workspaceLinksSnapshot.empty) {
      return {
        hasAccess: false,
        status: 'not_found',
        workspaces: [],
        requiresInvitation: true,
        message: 'No workspace access found. Please contact your administrator for an invitation.'
      };
    }

    const workspaces = [];
    let hasActiveWorkspace = false;
    let activeWorkspace = null;

    for (const doc of workspaceLinksSnapshot.docs) {
      const workspaceData = doc.data();
      
      // Get partner details
      const partnerDoc = await db.collection('partners').doc(workspaceData.partnerId).get();
      const partnerName = partnerDoc.exists ? partnerDoc.data()?.name : 'Unknown Organization';

      const workspace = {
        partnerId: workspaceData.partnerId,
        partnerName,
        role: workspaceData.role,
        status: workspaceData.status,
        joinedAt: workspaceData.joinedAt,
        lastAccessedAt: workspaceData.lastAccessedAt,
        suspendedAt: workspaceData.suspendedAt,
        suspendedBy: workspaceData.suspendedBy
      };

      workspaces.push(workspace);

      if (workspaceData.status === 'active') {
        hasActiveWorkspace = true;
        if (!activeWorkspace) {
          activeWorkspace = workspace;
        }
      }
    }

    if (!hasActiveWorkspace) {
      return {
        hasAccess: false,
        status: 'suspended',
        workspaces,
        requiresInvitation: true,
        message: 'Your access to all workspaces has been suspended. Please contact your administrator for reactivation.'
      };
    }

    return {
      hasAccess: true,
      status: 'active',
      workspaces,
      activeWorkspace,
      message: 'Access granted'
    };

  } catch (error) {
    console.error('Error checking employee access:', error);
    return {
      hasAccess: false,
      status: 'not_found',
      workspaces: [],
      requiresInvitation: true,
      message: 'Failed to verify access permissions'
    };
  }
}

/**
 * Get specific workspace status for an employee
 */
async function getEmployeeWorkspaceStatus(userId: string, partnerId?: string) {
  try {
    let query = db.collection('userWorkspaceLinks').where('userId', '==', userId);
    
    if (partnerId) {
      query = query.where('partnerId', '==', partnerId);
    }

    const workspaceLinksSnapshot = await query.get();
    const workspaceStatuses = [];

    for (const doc of workspaceLinksSnapshot.docs) {
      const workspaceData = doc.data();
      
      // Get partner details
      const partnerDoc = await db.collection('partners').doc(workspaceData.partnerId).get();
      const partnerData = partnerDoc.exists ? partnerDoc.data() : null;

      // Get team member details
      const teamMemberDoc = await db.collection('teamMembers').doc(userId).get();
      const teamMemberData = teamMemberDoc.exists ? teamMemberDoc.data() : null;

      workspaceStatuses.push({
        partnerId: workspaceData.partnerId,
        partnerName: partnerData?.name || 'Unknown Organization',
        tenantId: workspaceData.tenantId,
        role: workspaceData.role,
        status: workspaceData.status,
        joinedAt: workspaceData.joinedAt,
        lastAccessedAt: workspaceData.lastAccessedAt,
        suspendedAt: workspaceData.suspendedAt,
        suspendedBy: workspaceData.suspendedBy,
        reactivatedAt: workspaceData.reactivatedAt,
        reactivatedBy: workspaceData.reactivatedBy,
        teamMemberStatus: teamMemberData?.status,
        teamMemberDetails: teamMemberData ? {
          name: teamMemberData.name,
          email: teamMemberData.email,
          phone: teamMemberData.phone,
          joinedDate: teamMemberData.joinedDate,
          lastActive: teamMemberData.lastActive
        } : null
      });
    }

    return {
      userId,
      workspaces: workspaceStatuses,
      hasAnyActiveWorkspace: workspaceStatuses.some(ws => ws.status === 'active'),
      totalWorkspaces: workspaceStatuses.length,
      suspendedWorkspaces: workspaceStatuses.filter(ws => ws.status === 'suspended').length
    };

  } catch (error) {
    console.error('Error getting employee workspace status:', error);
    throw error;
  }
}