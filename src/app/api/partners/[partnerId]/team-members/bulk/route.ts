// src/app/api/partners/[partnerId]/team-members/bulk/route.ts (v2)
import { NextRequest, NextResponse } from 'next/server';
import { db, adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import { deactivateTeamMember, reactivateTeamMember } from '@/services/team-member-service';

interface BulkOperation {
  userId: string;
  action: 'deactivate' | 'reactivate' | 'update_role' | 'transfer_tasks';
  reason?: string;
  invitationCode?: string;
  newRole?: 'partner_admin' | 'employee';
  transferToUserId?: string;
}

interface BulkOperationResult {
  userId: string;
  action: string;
  success: boolean;
  message: string;
  details?: any;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization') || '';
    const body = await request.json();
    const partnerId = params.partnerId;
    const { operations, dryRun = false } = body;

    if (!Array.isArray(operations) || operations.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Operations array is required and must not be empty'
      }, { status: 400 });
    }

    if (operations.length > 50) {
      return NextResponse.json({
        success: false,
        message: 'Maximum 50 operations allowed per request'
      }, { status: 400 });
    }

    // Verify authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
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
        message: 'Insufficient permissions for bulk operations'
      }, { status: 403 });
    }

    // Validate all operations first
    const validationResults = await validateBulkOperations(operations, partnerId, decodedToken.uid);
    const hasValidationErrors = validationResults.some(r => !r.success);

    if (hasValidationErrors) {
      return NextResponse.json({
        success: false,
        message: 'Validation errors found in operations',
        validationResults,
        dryRun: true
      });
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        message: 'Dry run completed successfully - all operations are valid',
        validationResults,
        dryRun: true
      });
    }

    // Execute operations
    const results = await executeBulkOperations(operations, partnerId, decodedToken.uid);
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    // Create bulk operation audit log
    await db.collection('auditLogs').add({
      action: 'BULK_TEAM_OPERATION',
      performedBy: decodedToken.uid,
      partnerId: partnerId,
      details: {
        totalOperations: operations.length,
        successCount,
        failureCount,
        operations: operations.map(op => ({
          userId: op.userId,
          action: op.action,
          reason: op.reason
        }))
      },
      timestamp: new Date(),
      ipAddress: null
    });

    return NextResponse.json({
      success: successCount > 0,
      message: `Bulk operation completed: ${successCount} successful, ${failureCount} failed`,
      results,
      summary: {
        total: operations.length,
        successful: successCount,
        failed: failureCount
      }
    });

  } catch (error: any) {
    console.error("Error executing bulk operations:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to execute bulk operations"
    }, { status: 500 });
  }
}

async function validateBulkOperations(
  operations: BulkOperation[], 
  partnerId: string, 
  performedBy: string
): Promise<BulkOperationResult[]> {
  const results: BulkOperationResult[] = [];

  for (const operation of operations) {
    try {
      // Check if user exists and belongs to partner
      const teamMemberDoc = await db.collection('teamMembers').doc(operation.userId).get();
      
      if (!teamMemberDoc.exists) {
        results.push({
          userId: operation.userId,
          action: operation.action,
          success: false,
          message: 'Team member not found'
        });
        continue;
      }

      const teamMemberData = teamMemberDoc.data();
      if (teamMemberData?.partnerId !== partnerId) {
        results.push({
          userId: operation.userId,
          action: operation.action,
          success: false,
          message: 'Team member does not belong to this partner'
        });
        continue;
      }

      // Validate specific operations
      if (operation.action === 'deactivate') {
        if (operation.userId === performedBy) {
          results.push({
            userId: operation.userId,
            action: operation.action,
            success: false,
            message: 'Cannot deactivate yourself'
          });
          continue;
        }

        if (teamMemberData?.status === 'suspended') {
          results.push({
            userId: operation.userId,
            action: operation.action,
            success: false,
            message: 'Team member is already suspended'
          });
          continue;
        }
      }

      if (operation.action === 'reactivate') {
        if (teamMemberData?.status !== 'suspended') {
          results.push({
            userId: operation.userId,
            action: operation.action,
            success: false,
            message: 'Team member is not suspended'
          });
          continue;
        }

        if (!operation.invitationCode) {
          results.push({
            userId: operation.userId,
            action: operation.action,
            success: false,
            message: 'Invitation code is required for reactivation'
          });
          continue;
        }
      }

      if (operation.action === 'update_role') {
        if (!operation.newRole || !['partner_admin', 'employee'].includes(operation.newRole)) {
          results.push({
            userId: operation.userId,
            action: operation.action,
            success: false,
            message: 'Valid new role is required'
          });
          continue;
        }
      }

      if (operation.action === 'transfer_tasks') {
        if (!operation.transferToUserId) {
          results.push({
            userId: operation.userId,
            action: operation.action,
            success: false,
            message: 'Transfer target user ID is required'
          });
          continue;
        }

        // Check if transfer target exists
        const targetMemberDoc = await db.collection('teamMembers').doc(operation.transferToUserId).get();
        if (!targetMemberDoc.exists || targetMemberDoc.data()?.partnerId !== partnerId) {
          results.push({
            userId: operation.userId,
            action: operation.action,
            success: false,
            message: 'Transfer target user not found or not in same partner'
          });
          continue;
        }
      }

      results.push({
        userId: operation.userId,
        action: operation.action,
        success: true,
        message: 'Validation passed'
      });

    } catch (error: any) {
      results.push({
        userId: operation.userId,
        action: operation.action,
        success: false,
        message: `Validation error: ${error.message}`
      });
    }
  }

  return results;
}

async function executeBulkOperations(
  operations: BulkOperation[], 
  partnerId: string, 
  performedBy: string
): Promise<BulkOperationResult[]> {
  const results: BulkOperationResult[] = [];

  for (const operation of operations) {
    try {
      let result: BulkOperationResult;

      switch (operation.action) {
        case 'deactivate':
          const deactivateResult = await deactivateTeamMember({
            partnerId,
            userId: operation.userId,
            deactivatedBy: performedBy,
            reason: operation.reason
          });
          result = {
            userId: operation.userId,
            action: operation.action,
            success: deactivateResult.success,
            message: deactivateResult.message
          };
          break;

        case 'reactivate':
          const reactivateResult = await reactivateTeamMember({
            partnerId,
            userId: operation.userId,
            reactivatedBy: performedBy,
            invitationCode: operation.invitationCode!
          });
          result = {
            userId: operation.userId,
            action: operation.action,
            success: reactivateResult.success,
            message: reactivateResult.message
          };
          break;

        case 'update_role':
          result = await updateTeamMemberRole(partnerId, operation.userId, operation.newRole!, performedBy);
          break;

        case 'transfer_tasks':
          result = await transferUserTasks(partnerId, operation.userId, operation.transferToUserId!, performedBy);
          break;

        default:
          result = {
            userId: operation.userId,
            action: operation.action,
            success: false,
            message: 'Unknown operation type'
          };
      }

      results.push(result);

    } catch (error: any) {
      results.push({
        userId: operation.userId,
        action: operation.action,
        success: false,
        message: `Execution error: ${error.message}`
      });
    }
  }

  return results;
}

async function updateTeamMemberRole(
  partnerId: string, 
  userId: string, 
  newRole: string, 
  performedBy: string
): Promise<BulkOperationResult> {
  try {
    const batch = db.batch();

    // Update team member role
    const teamMemberRef = db.collection('teamMembers').doc(userId);
    batch.update(teamMemberRef, {
      role: newRole,
      updatedAt: new Date(),
      updatedBy: performedBy
    });

    // Update workspace link role
    const workspaceLinkRef = db.collection('userWorkspaceLinks').doc(`${userId}_${partnerId}`);
    batch.update(workspaceLinkRef, {
      role: newRole,
      updatedAt: new Date()
    });

    // Update Firebase Auth custom claims
    const user = await adminAuth.getUser(userId);
    const claims = user.customClaims || {};
    
    await adminAuth.setCustomUserClaims(userId, {
      ...claims,
      role: newRole
    });

    await batch.commit();

    return {
      userId,
      action: 'update_role',
      success: true,
      message: `Role updated to ${newRole} successfully`
    };

  } catch (error: any) {
    return {
      userId,
      action: 'update_role',
      success: false,
      message: `Failed to update role: ${error.message}`
    };
  }
}

async function transferUserTasks(
  partnerId: string, 
  fromUserId: string, 
  toUserId: string, 
  performedBy: string
): Promise<BulkOperationResult> {
  try {
    const tasksSnapshot = await db
      .collection('tasks')
      .where('assignedTo', '==', fromUserId)
      .where('partnerId', '==', partnerId)
      .where('status', 'in', ['assigned', 'in_progress'])
      .get();

    const batch = db.batch();
    let transferredCount = 0;

    tasksSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        assignedTo: toUserId,
        transferredFrom: fromUserId,
        transferredBy: performedBy,
        transferredAt: new Date(),
        updatedAt: new Date()
      });
      transferredCount++;
    });

    if (transferredCount > 0) {
      await batch.commit();
    }

    return {
      userId: fromUserId,
      action: 'transfer_tasks',
      success: true,
      message: `Transferred ${transferredCount} tasks successfully`,
      details: { transferredCount, toUserId }
    };

  } catch (error: any) {
    return {
      userId: fromUserId,
      action: 'transfer_tasks',
      success: false,
      message: `Failed to transfer tasks: ${error.message}`
    };
  }
}