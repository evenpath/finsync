// src/actions/employee-invitation-actions.ts
'use server';

import { getInvitationByCode, acceptInvitationByCode } from '@/services/invitation-code-service';
import type { InvitationValidationResult, AcceptInvitationCodeOutput } from '@/lib/types/invitation';

/**
 * Validate invitation code and return details for preview
 */
export async function validateInvitationCodeAction(
  invitationCode: string
): Promise<InvitationValidationResult> {
  try {
    if (!invitationCode || invitationCode.trim().length !== 8) {
      return {
        success: false,
        message: "Please enter a valid 8-character invitation code."
      };
    }

    const result = await getInvitationByCode(invitationCode.trim().toUpperCase());

    if (!result.success || !result.invitation) {
      return {
        success: false,
        message: result.message
      };
    }

    const invitation = result.invitation;

    return {
      success: true,
      message: "Invitation code is valid",
      invitation: {
        partnerName: invitation.partnerName,
        inviterName: invitation.inviterName,
        role: invitation.role,
        expiresAt: invitation.expiresAt.toDate().toISOString(),
        phoneNumber: invitation.phoneNumber
      }
    };

  } catch (error: any) {
    console.error("Error validating invitation code:", error);
    return {
      success: false,
      message: "Failed to validate invitation code. Please try again."
    };
  }
}

/**
 * Join workspace using invitation code (after phone authentication)
 */
export async function joinWorkspaceWithCodeAction(data: {
  invitationCode: string;
  phoneNumber: string;
  uid: string;
}): Promise<AcceptInvitationCodeOutput> {
  try {
    if (!data.invitationCode || data.invitationCode.trim().length !== 8) {
      return {
        success: false,
        message: "Invalid invitation code format."
      };
    }

    if (!data.phoneNumber || !data.uid) {
      return {
        success: false,
        message: "Phone number and user ID are required."
      };
    }

    const result = await acceptInvitationByCode({
      invitationCode: data.invitationCode.trim().toUpperCase(),
      phoneNumber: data.phoneNumber,
      uid: data.uid
    });

    return result;

  } catch (error: any) {
    console.error("Error joining workspace with code:", error);
    return {
      success: false,
      message: "Failed to join workspace. Please verify your invitation code and try again."
    };
  }
}

/**
 * Check if user has any pending invitations by phone number
 */
export async function checkPendingInvitationsAction(
  phoneNumber: string
): Promise<{
  success: boolean;
  message: string;
  hasPendingInvitations?: boolean;
  invitations?: Array<{
    invitationCode: string;
    partnerName: string;
    inviterName: string;
    role: string;
    expiresAt: string;
  }>;
}> {
  try {
    if (!phoneNumber) {
      return {
        success: false,
        message: "Phone number is required."
      };
    }

    // This would query the database for pending invitations
    // For now, return a basic structure that could be implemented
    
    return {
      success: true,
      message: "No pending invitations found.",
      hasPendingInvitations: false,
      invitations: []
    };

  } catch (error: any) {
    console.error("Error checking pending invitations:", error);
    return {
      success: false,
      message: "Failed to check for pending invitations."
    };
  }
}
