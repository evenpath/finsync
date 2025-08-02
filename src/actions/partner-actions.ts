'use server';

import { createUserInTenant } from '@/ai/flows/user-management-flow';
import { getTenantIdForEmail } from '@/services/tenant-service';

export async function inviteEmployeeAction(data: {
  email: string;
  name: string;
  partnerId: string;
  role?: 'employee' | 'partner_admin';
}) {
  try {
    // Get the tenant ID for this partner
    const tenantLookup = await getTenantIdForEmail(data.email);
    
    if (!tenantLookup.success) {
      // If no mapping exists, create user in the partner's tenant
      const userResult = await createUserInTenant({
        email: data.email,
        password: Math.random().toString(36).slice(-8), // Temporary password
        tenantId: data.partnerId,
        displayName: data.name,
        partnerId: data.partnerId,
        role: data.role || 'employee',
      });

      return userResult;
    } else {
      return {
        success: false,
        message: "User already exists in the system."
      };
    }
  } catch (error: any) {
    console.error("Error inviting employee:", error);
    return {
      success: false,
      message: "Failed to invite employee."
    };
  }
}