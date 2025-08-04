// src/actions/employee-phone-actions.ts
'use server';

import { createEmployeeWithPhone, handlePhoneAuthUser } from '@/services/phone-auth-service';
import { createWorkspaceInvitationWithPhone, acceptInvitationByPhone } from '@/services/workspace-invitation-service';
import { getPartnerTenantId } from '@/services/tenant-service';
import type { CreateUserInTenantOutput } from '@/ai/flows/user-management-flow';

/**
 * Invite employee with phone number
 */
export async function inviteEmployeeWithPhoneAction(data: {
  phoneNumber: string;
  name: string;
  email?: string;
  partnerId: string;
  role?: 'employee' | 'partner_admin';
  invitedBy: string;
}): Promise<CreateUserInTenantOutput> {
  try {
    // Get the tenant ID associated with this partner
    const partnerTenant = await getPartnerTenantId(data.partnerId);
    
    if (!partnerTenant.success || !partnerTenant.tenantId) {
      return {
        success: false,
        message: "Your organization's workspace could not be found. Please contact support."
      };
    }

    // Create employee with phone number
    const result = await createEmployeeWithPhone({
      phoneNumber: data.phoneNumber,
      displayName: data.name,
      email: data.email,
      partnerId: data.partnerId,
      tenantId: partnerTenant.tenantId,
      role: data.role || 'employee',
      invitedBy: data.invitedBy
    });

    if (result.success) {
      // Also create a workspace invitation for tracking
      await createWorkspaceInvitationWithPhone({
        phoneNumber: data.phoneNumber,
        email: data.email,
        partnerId: data.partnerId,
        tenantId: partnerTenant.tenantId,
        role: data.role || 'employee',
        invitedBy: data.invitedBy,
        partnerName: 'Organization', // This would be fetched from partner details
        inviterName: 'Admin', // This would be fetched from inviter details
        inviterEmail: 'admin@example.com' // This would be fetched from inviter details
      });
    }

    return result;

  } catch (error: any) {
    console.error("Error inviting employee with phone:", error);
    return {
      success: false,
      message: "An unexpected error occurred while inviting the employee."
    };
  }
}

/**
 * Handle phone authentication after OTP verification
 */
export async function handlePhoneAuthAction(
  phoneNumber: string,
  uid: string
): Promise<{
  success: boolean;
  message: string;
  hasMultipleWorkspaces?: boolean;
  workspaces?: any[];
}> {
  try {
    const result = await handlePhoneAuthUser(phoneNumber, uid);
    
    if (result.success) {
      // Also check for and accept any pending invitations
      const invitationResult = await acceptInvitationByPhone(phoneNumber, uid);
      
      if (invitationResult.success && invitationResult.workspaceInfo) {
        return {
          success: true,
          message: result.message,
          hasMultipleWorkspaces: result.hasMultipleWorkspaces,
          workspaces: result.workspaces
        };
      }
    }

    return {
      success: result.success,
      message: result.message,
      hasMultipleWorkspaces: result.hasMultipleWorkspaces,
      workspaces: result.workspaces
    };

  } catch (error: any) {
    console.error("Error handling phone auth:", error);
    return {
      success: false,
      message: "Authentication failed. Please try again."
    };
  }
}

/**
 * Send invitation via phone number
 */
export async function sendPhoneInvitationAction(data: {
  phoneNumber: string;
  partnerId: string;
  role: 'employee' | 'partner_admin';
  invitedBy: string;
  partnerName: string;
  inviterName: string;
  inviterEmail: string;
}): Promise<{
  success: boolean;
  message: string;
  invitationId?: string;
}> {
  try {
    // Get the tenant ID associated with this partner
    const partnerTenant = await getPartnerTenantId(data.partnerId);
    
    if (!partnerTenant.success || !partnerTenant.tenantId) {
      return {
        success: false,
        message: "Your organization's workspace could not be found. Please contact support."
      };
    }

    const result = await createWorkspaceInvitationWithPhone({
      phoneNumber: data.phoneNumber,
      partnerId: data.partnerId,
      tenantId: partnerTenant.tenantId,
      role: data.role,
      invitedBy: data.invitedBy,
      partnerName: data.partnerName,
      inviterName: data.inviterName,
      inviterEmail: data.inviterEmail
    });

    return result;

  } catch (error: any) {
    console.error("Error sending phone invitation:", error);
    return {
      success: false,
      message: "Failed to send invitation. Please try again."
    };
  }
}

/**
 * Validate phone number format
 */
export async function validatePhoneNumberAction(phoneNumber: string): Promise<{
  isValid: boolean;
  formattedNumber?: string;
  message: string;
}> {
  try {
    // Basic E.164 format validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    
    if (!phoneRegex.test(phoneNumber)) {
      return {
        isValid: false,
        message: 'Phone number must be in international format (e.g., +1234567890)'
      };
    }

    // Additional validation can be added here (e.g., using a phone number library)
    
    return {
      isValid: true,
      formattedNumber: phoneNumber,
      message: 'Phone number is valid'
    };

  } catch (error: any) {
    console.error("Error validating phone number:", error);
    return {
      isValid: false,
      message: 'Error validating phone number'
    };
  }
}

/**
 * Check if phone number is already registered
 */
export async function checkPhoneExistsAction(phoneNumber: string): Promise<{
  exists: boolean;
  message: string;
  hasWorkspaceAccess?: boolean;
}> {
  try {
    // This would check Firebase Auth for existing user with this phone number
    // For now, we'll return a basic response
    return {
      exists: false,
      message: 'Phone number is available',
      hasWorkspaceAccess: false
    };

  } catch (error: any) {
    console.error("Error checking phone existence:", error);
    return {
      exists: false,
      message: 'Error checking phone number availability'
    };
  }
}