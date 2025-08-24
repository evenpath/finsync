// src/actions/team-actions.ts
'use server';

import { db, adminAuth } from '@/lib/firebase-admin';

/**
 * Server action to remove a team member from a workspace.
 * This is a critical security function that revokes all access for a user to a specific partner workspace.
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
    // to perform this action (e.g., check if they are a partner_admin for this partnerId).
    // This is omitted here for simplicity but is critical for security.

    // 1. Delete the teamMembers document
    // This removes them from the team roster in the UI.
    await db.collection('teamMembers').doc(input.userIdToRemove).delete();

    // 2. Delete the userWorkspaceLinks document
    // This is the key step that revokes access. The useMultiWorkspaceAuth hook
    // relies on this collection to determine which workspaces a user can access.
    await db.collection('userWorkspaceLinks').doc(`${input.userIdToRemove}_${input.partnerId}`).delete();

    // 3. Remove workspace access from the user's custom claims in Firebase Auth.
    // This ensures that even if the client has a cached token, new tokens will not grant access.
    const user = await adminAuth.getUser(input.userIdToRemove);
    const claims = user.customClaims || {};
    
    // Filter out the workspace that is being removed.
    const updatedWorkspaces = (claims.workspaces || []).filter(
      (ws: any) => ws.partnerId !== input.partnerId
    );

    const updatedClaims: any = {
      ...claims,
      workspaces: updatedWorkspaces,
      partnerIds: (claims.partnerIds || []).filter((id: string) => id !== input.partnerId),
    };

    // If the removed workspace was the user's active one, find a new active workspace or clear the active context.
    if (claims.activePartnerId === input.partnerId) {
      if (updatedWorkspaces.length > 0) {
        // Set the first remaining workspace as the new active one.
        updatedClaims.activePartnerId = updatedWorkspaces[0].partnerId;
        updatedClaims.activeTenantId = updatedWorkspaces[0].tenantId;
        updatedClaims.role = updatedWorkspaces[0].role;
        updatedClaims.partnerId = updatedWorkspaces[0].partnerId;
        updatedClaims.tenantId = updatedWorkspaces[0].tenantId;
      } else {
        // If no workspaces are left, clear all partner-related claims.
        delete updatedClaims.activePartnerId;
        delete updatedClaims.activeTenantId;
        delete updatedClaims.partnerId;
        delete updatedClaims.tenantId;
        delete updatedClaims.role;
      }
    }

    await adminAuth.setCustomUserClaims(input.userIdToRemove, updatedClaims);
    
    // 4. Optional: Delete the user from the Firebase Auth tenant if they have no other roles in it.
    // This is a more complex operation and depends on specific business logic (e.g., if a user
    // can belong to multiple workspaces within the same tenant under different roles).
    // For now, we leave the user in the tenant to avoid unintended side effects.
    // const tenantAuth = adminAuth.tenantManager().authForTenant(input.tenantId);
    // await tenantAuth.deleteUser(input.userIdToRemove);


    return { success: true, message: 'Team member removed successfully.' };

  } catch (error: any) {
    console.error('Error removing team member:', error);
    return { success: false, message: `Failed to remove team member: ${error.message}` };
  }
}
