// src/actions/enhanced-team-actions.ts
'use server';

import { headers } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import { deactivateTeamMember, reactivateTeamMember } from '@/services/team-member-service';
import type { DeactivateMemberInput, ReactivateMemberInput, TeamMemberActionResult } from '@/services/team-member-service';

/**
 * Server action to deactivate a team member with proper authorization
 */
export async function deactivateTeamMemberAction(input: {
  partnerId: string;
  userId: string;
  reason?: string;
}): Promise<TeamMemberActionResult> {
  try {
    // Get the current user from the request context
    const headersList = headers();
    const authHeader = headersList.get('authorization') || '';
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { 
        success: false, 
        message: 'Authentication required' 
      };
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (tokenError) {
      return { 
        success: false, 
        message: 'Invalid authentication token' 
      };
    }

    // Verify permissions
    const customClaims = decodedToken;
    const isPartnerAdmin = customClaims.role === 'partner_admin' && customClaims.partnerId === input.partnerId;
    const isSuperAdmin = customClaims.role === 'Super Admin' || customClaims.role === 'Admin';
    
    if (!isPartnerAdmin && !isSuperAdmin) {
      return { 
        success: false, 
        message: 'Insufficient permissions to deactivate team members' 
      };
    }

    // Prevent self-deactivation
    if (decodedToken.uid === input.userId) {
      return { 
        success: false, 
        message: 'You cannot deactivate yourself' 
      };
    }

    // Call the service function
    const deactivateInput: DeactivateMemberInput = {
      partnerId: input.partnerId,
      userId: input.userId,
      deactivatedBy: decodedToken.uid,
      reason: input.reason
    };

    const result = await deactivateTeamMember(deactivateInput);
    return result;

  } catch (error: any) {
    console.error('Error in deactivateTeamMemberAction:', error);
    return { 
      success: false, 
      message: `Failed to deactivate team member: ${error.message}` 
    };
  }
}

/**
 * Server action to reactivate a team member with proper authorization
 */
export async function reactivateTeamMemberAction(input: {
  partnerId: string;
  userId: string;
  invitationCode?: string;
}): Promise<TeamMemberActionResult> {
  try {
    // Get the current user from the request context
    const headersList = headers();
    const authHeader = headersList.get('authorization') || '';
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { 
        success: false, 
        message: 'Authentication required' 
      };
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (tokenError) {
      return { 
        success: false, 
        message: 'Invalid authentication token' 
      };
    }

    // Verify permissions
    const customClaims = decodedToken;
    const isPartnerAdmin = customClaims.role === 'partner_admin' && customClaims.partnerId === input.partnerId;
    const isSuperAdmin = customClaims.role === 'Super Admin' || customClaims.role === 'Admin';
    
    if (!isPartnerAdmin && !isSuperAdmin) {
      return { 
        success: false, 
        message: 'Insufficient permissions to reactivate team members' 
      };
    }

    // For security, always require an invitation code for reactivation
    if (!input.invitationCode) {
      return { 
        success: false, 
        message: 'Invitation code is required for reactivation' 
      };
    }

    // Call the service function
    const reactivateInput: ReactivateMemberInput = {
      partnerId: input.partnerId,
      userId: input.userId,
      reactivatedBy: decodedToken.uid,
      invitationCode: input.invitationCode
    };

    const result = await reactivateTeamMember(reactivateInput);
    return result;

  } catch (error: any) {
    console.error('Error in reactivateTeamMemberAction:', error);
    return { 
      success: false, 
      message: `Failed to reactivate team member: ${error.message}` 
    };
  }
}

/**
 * Server action to get team member details with status information
 */
export async function getTeamMemberDetailsAction(input: {
  partnerId: string;
  userId: string;
}): Promise<{
  success: boolean;
  message: string;
  member?: any;
  accessHistory?: any[];
}> {
  try {
    // Get the current user from the request context
    const headersList = headers();
    const authHeader = headersList.get('authorization') || '';
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { 
        success: false, 
        message: 'Authentication required' 
      };
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (tokenError) {
      return { 
        success: false, 
        message: 'Invalid authentication token' 
      };
    }

    // Verify permissions
    const customClaims = decodedToken;
    const isPartnerAdmin = customClaims.role === 'partner_admin' && customClaims.partnerId === input.partnerId;
    const isSuperAdmin = customClaims.role === 'Super Admin' || customClaims.role === 'Admin';
    const isOwnUser = decodedToken.uid === input.userId;
    
    if (!isPartnerAdmin && !isSuperAdmin && !isOwnUser) {
      return { 
        success: false, 
        message: 'Insufficient permissions to view team member details' 
      };
    }

    // Get team member details
    const memberResult = await getTeamMemberWithHistory(input.partnerId, input.userId);
    
    return {
      success: true,
      message: 'Team member details retrieved successfully',
      member: memberResult.member,
      accessHistory: memberResult.accessHistory
    };

  } catch (error: any) {
    console.error('Error in getTeamMemberDetailsAction:', error);
    return { 
      success: false, 
      message: `Failed to get team member details: ${error.message}` 
    };
  }
}

/**
 * Helper function to get team member details with access history
 */
async function getTeamMemberWithHistory(partnerId: string, userId: string) {
  const { db } = await import('@/lib/firebase-admin');
  
  if (!db) {
    throw new Error('Database not available');
  }

  // Get team member document
  const teamMemberDoc = await db.collection('teamMembers').doc(userId).get();
  if (!teamMemberDoc.exists) {
    throw new Error('Team member not found');
  }

  const teamMemberData = teamMemberDoc.data();
  if (teamMemberData?.partnerId !== partnerId) {
    throw new Error('Team member does not belong to this partner');
  }

  // Get workspace link details
  const workspaceLinkDoc = await db
    .collection('userWorkspaceLinks')
    .doc(`${userId}_${partnerId}`)
    .get();

  const workspaceLinkData = workspaceLinkDoc.exists ? workspaceLinkDoc.data() : null;

  // Get access history from audit logs
  const auditLogsSnapshot = await db
    .collection('auditLogs')
    .where('targetUserId', '==', userId)
    .where('partnerId', '==', partnerId)
    .orderBy('timestamp', 'desc')
    .limit(20)
    .get();

  const accessHistory = auditLogsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
  }));

  // Get current Firebase user details
  let firebaseUser = null;
  try {
    firebaseUser = await adminAuth.getUser(userId);
  } catch (error) {
    console.warn(`Could not fetch Firebase user details for ${userId}:`, error);
  }

  const member = {
    ...teamMemberData,
    id: userId,
    workspaceLink: workspaceLinkData,
    firebaseUser: firebaseUser ? {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      emailVerified: firebaseUser.emailVerified,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      phoneNumber: firebaseUser.phoneNumber,
      disabled: firebaseUser.disabled,
      customClaims: firebaseUser.customClaims,
      metadata: {
        creationTime: firebaseUser.metadata.creationTime,
        lastSignInTime: firebaseUser.metadata.lastSignInTime,
        lastRefreshTime: firebaseUser.metadata.lastRefreshTime
      }
    } : null
  };

  return { member, accessHistory };
}

/**
 * Server action to bulk update team member statuses
 */
export async function bulkUpdateTeamMembersAction(input: {
  partnerId: string;
  updates: Array<{
    userId: string;
    action: 'deactivate' | 'reactivate';
    reason?: string;
    invitationCode?: string;
  }>;
}): Promise<{
  success: boolean;
  message: string;
  results: Array<{ userId: string; success: boolean; message: string }>;
}> {
  try {
    // Get the current user from the request context
    const headersList = headers();
    const authHeader = headersList.get('authorization') || '';
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { 
        success: false, 
        message: 'Authentication required',
        results: []
      };
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (tokenError) {
      return { 
        success: false, 
        message: 'Invalid authentication token',
        results: []
      };
    }

    // Verify permissions
    const customClaims = decodedToken;
    const isPartnerAdmin = customClaims.role === 'partner_admin' && customClaims.partnerId === input.partnerId;
    const isSuperAdmin = customClaims.role === 'Super Admin' || customClaims.role === 'Admin';
    
    if (!isPartnerAdmin && !isSuperAdmin) {
      return { 
        success: false, 
        message: 'Insufficient permissions to update team members',
        results: []
      };
    }

    const results = [];
    let successCount = 0;

    // Process each update
    for (const update of input.updates) {
      // Prevent self-deactivation
      if (update.action === 'deactivate' && decodedToken.uid === update.userId) {
        results.push({
          userId: update.userId,
          success: false,
          message: 'Cannot deactivate yourself'
        });
        continue;
      }

      try {
        let result: TeamMemberActionResult;

        if (update.action === 'deactivate') {
          const deactivateInput: DeactivateMemberInput = {
            partnerId: input.partnerId,
            userId: update.userId,
            deactivatedBy: decodedToken.uid,
            reason: update.reason
          };
          result = await deactivateTeamMember(deactivateInput);
        } else {
          const reactivateInput: ReactivateMemberInput = {
            partnerId: input.partnerId,
            userId: update.userId,
            reactivatedBy: decodedToken.uid,
            invitationCode: update.invitationCode
          };
          result = await reactivateTeamMember(reactivateInput);
        }

        results.push({
          userId: update.userId,
          success: result.success,
          message: result.message
        });

        if (result.success) {
          successCount++;
        }

      } catch (error: any) {
        results.push({
          userId: update.userId,
          success: false,
          message: `Failed to ${update.action}: ${error.message}`
        });
      }
    }

    return {
      success: successCount > 0,
      message: `${successCount} of ${input.updates.length} updates completed successfully`,
      results
    };

  } catch (error: any) {
    console.error('Error in bulkUpdateTeamMembersAction:', error);
    return { 
      success: false, 
      message: `Failed to update team members: ${error.message}`,
      results: []
    };
  }
}