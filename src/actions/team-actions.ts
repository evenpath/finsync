// src/actions/team-actions.ts
'use server';

import { db, adminAuth } from '@/lib/firebase-admin';
import type { UserWorkspaceLink, MultiWorkspaceCustomClaims } from '@/lib/types';


/**
 * Server action to remove a team member from a workspace.
 * This is a critical security function that revokes all access for a user to a specific partner workspace.
 */
export async function removeTeamMemberAction(input: {
  partnerId: string;
  userIdToRemove: string;
}): Promise<{ success: boolean; message: string }> {

  if (!db || !adminAuth) {
    return { success: false, message: 'Server not configured.' };
  }

  try {
    // Note: In a real app, you MUST validate that the calling user has permission
    // to perform this action (e.g., check if they are a partner_admin for this partnerId).
    // This is omitted here for simplicity but is critical for security.

    // 1. Delete the userWorkspaceLinks document
    // This is the key step that revokes access. The useMultiWorkspaceAuth hook
    // relies on this collection to determine which workspaces a user can access.
    const linkId = `${input.userIdToRemove}_${input.partnerId}`;
    await db.collection('userWorkspaceLinks').doc(linkId).delete();
    console.log(`Deleted userWorkspaceLink: ${linkId}`);

    // 2. Delete the teamMembers document
    // This removes them from the team roster in the UI.
    // Note: In a multi-workspace team, you might want to remove the specific partnerId from a teamMember document
    // instead of deleting the whole document if the user belongs to multiple teams.
    // For this implementation, we assume one team member document per user, per partner, so we delete it.
    const teamMemberRef = db.collection('teamMembers').doc(input.userIdToRemove);
    const teamMemberDoc = await teamMemberRef.get();

    if (teamMemberDoc.exists && teamMemberDoc.data()?.partnerId === input.partnerId) {
      await teamMemberRef.delete();
      console.log(`Deleted teamMember document for user: ${input.userIdToRemove}`);
    }


    // 3. Remove workspace access from the user's custom claims in Firebase Auth.
    // This ensures that even if the client has a cached token, new tokens will not grant access.
    const user = await adminAuth.getUser(input.userIdToRemove);
    const claims = (user.customClaims || {}) as MultiWorkspaceCustomClaims;
    
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
        const newActiveWorkspace = updatedWorkspaces[0];
        updatedClaims.activePartnerId = newActiveWorkspace.partnerId;
        updatedClaims.activeTenantId = newActiveWorkspace.tenantId;
        updatedClaims.role = newActiveWorkspace.role;
        updatedClaims.partnerId = newActiveWorkspace.partnerId; // Legacy support
        updatedClaims.tenantId = newActiveWorkspace.tenantId;   // Legacy support
        console.log(`Set new active workspace to ${newActiveWorkspace.partnerName} (${newActiveWorkspace.partnerId})`);
      } else {
        // If no workspaces are left, clear all partner-related claims.
        delete updatedClaims.activePartnerId;
        delete updatedClaims.activeTenantId;
        delete updatedClaims.partnerId;
        delete updatedClaims.tenantId;
        delete updatedClaims.role;
        console.log(`User has no workspaces left. Clearing all workspace claims.`);
      }
    }

    await adminAuth.setCustomUserClaims(input.userIdToRemove, updatedClaims);
    console.log(`Updated custom claims for user: ${input.userIdToRemove}`);
    
    // 4. Optional: Delete the user from the Firebase Auth tenant if they have no other roles in it.
    // This is a more complex operation and depends on specific business logic (e.g., if a user
    // can belong to multiple workspaces within the same tenant under different roles).
    // For now, we leave the user in the tenant to avoid unintended side effects.


    return { success: true, message: 'Team member removed successfully.' };

  } catch (error: any) {
    console.error('Error removing team member:', error);
    return { success: false, message: `Failed to remove team member: ${error.message}` };
  }
}
