// src/actions/partner-actions.ts
'use server';

import { createEmployeeWithPhone } from '../services/phone-auth-service';
import { getPartnerTenantId } from '../services/tenant-service';
import type { Partner, TeamMember } from '../lib/types';
import { db } from '../lib/firebase-admin';
import * as admin from 'firebase-admin';
import type { PhoneAuthResult } from '../services/phone-auth-service';


export async function inviteEmployeeAction(data: {
  email?: string;
  phone: string;
  name: string;
  partnerId: string;
  role?: 'employee' | 'partner_admin';
}): Promise<PhoneAuthResult> {
  try {
    // Get the tenant ID associated with this partner
    const partnerTenant = await getPartnerTenantId(data.partnerId);
    
    if (!partnerTenant.success || !partnerTenant.tenantId) {
      return {
        success: false,
        message: "Your organization's workspace could not be found. Please contact support."
      };
    }

    let userResult: PhoneAuthResult;

    // Use phone-based creation
    userResult = await createEmployeeWithPhone({
        phoneNumber: data.phone,
        displayName: data.name,
        email: data.email,
        partnerId: data.partnerId,
        tenantId: partnerTenant.tenantId,
        role: data.role || 'employee',
        invitedBy: 'system' // In production, this would be the actual inviter's ID
      });
    
    if (userResult.success && userResult.userId) {
      // TeamMember document creation is now handled within createEmployeeWithPhone
      console.log(`Successfully invited/added employee ${data.name} to team.`);
    }

    return userResult;
    
  } catch (error: any) {
    console.error("Error inviting employee:", error);
    return {
      success: false,
      message: "An unexpected error occurred while inviting the employee."
    };
  }
}

export async function generateInviteCodeAction(partnerId: string): Promise<{
  success: boolean;
  message: string;
  inviteCode?: string;
}> {
  try {
    const partnerTenant = await getPartnerTenantId(partnerId);
    
    if (!partnerTenant.success || !partnerTenant.tenantId) {
      return {
        success: false,
        message: "Could not generate invite code. Partner not found."
      };
    }

    // Generate simple invite code format: PARTNER_ID-TENANT_ID
    const inviteCode = `${partnerId}-${partnerTenant.tenantId}`;

    return {
      success: true,
      message: "Invite code generated successfully.",
      inviteCode
    };

  } catch (error: any) {
    console.error("Error generating invite code:", error);
    return {
      success: false,
      message: "Failed to generate invite code."
    };
  }
}
