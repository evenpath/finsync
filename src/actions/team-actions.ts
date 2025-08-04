// src/actions/team-actions.ts
'use server';

import { db, adminAuth } from '@/lib/firebase-admin';

/**
 * Server action to remove a team member from a workspace.
 */
export async function removeTeamMemberAction(input: {
  partnerId: string;
  userIdToRemove: string;
  tenantId: string;
}): Promise<{ success: boolean; message: string }> {

  if (!db || !adminAuth) {
    return { success: false, message: 'Server not configured.' };
  }

  try {
    // Note: In a real app, you MUST validate that the calling user has permission
    // to perform this action. For example, check if they are a partner_admin for this partnerId.
    // This is omitted here for simplicity but is critical for security.

    // 1. Delete the teamMembers document
    await db.collection('teamMembers').doc(input.userIdToRemove).delete();

    // 2. Delete the userWorkspaceLinks document
    await db.collection('userWorkspaceLinks').doc(`${input.userIdToRemove}_${input.partnerId}`).delete();

    // 3. Remove workspace access from user's custom claims
    const user = await adminAuth.getUser(input.userIdToRemove);
    const claims = user.customClaims || {};
    
    const updatedWorkspaces = (claims.workspaces || []).filter(
      (ws: any) => ws.partnerId !== input.partnerId
    );

    const updatedClaims: any = {
      ...claims,
      workspaces: updatedWorkspaces,
      partnerIds: (claims.partnerIds || []).filter((id: string) => id !== input.partnerId),
    };

    // If the removed workspace was the active one, find a new active one or clear it
    if (claims.activePartnerId === input.partnerId) {
      if (updatedWorkspaces.length > 0) {
        updatedClaims.activePartnerId = updatedWorkspaces[0].partnerId;
        updatedClaims.activeTenantId = updatedWorkspaces[0].tenantId;
        updatedClaims.role = updatedWorkspaces[0].role;
        updatedClaims.partnerId = updatedWorkspaces[0].partnerId;
        updatedClaims.tenantId = updatedWorkspaces[0].tenantId;
      } else {
        // No workspaces left, clear the claims
        delete updatedClaims.activePartnerId;
        delete updatedClaims.activeTenantId;
        delete updatedClaims.partnerId;
        delete updatedClaims.tenantId;
        delete updatedClaims.role;
      }
    }

    await adminAuth.setCustomUserClaims(input.userIdToRemove, updatedClaims);
    
    // 4. Optional: Delete the user from the tenant if they have no other roles in it.
    // This is more complex and depends on your business logic. For now, we leave the user in the tenant.
    // const tenantAuth = adminAuth.tenantManager().authForTenant(input.tenantId);
    // await tenantAuth.deleteUser(input.userIdToRemove);


    return { success: true, message: 'Team member removed successfully.' };

  } catch (error: any) {
    console.error('Error removing team member:', error);
    return { success: false, message: `Failed to remove team member: ${error.message}` };
  }
}
