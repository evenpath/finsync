
// src/actions/partner-actions.ts
'use server';

import { createUserInTenant } from '@/ai/flows/user-management-flow';
import { getPartnerTenantId, getPartnerDetailsByPartnerId } from '@/services/tenant-service';
import type { CreateUserInTenantOutput } from '@/ai/flows/user-management-flow';
import type { Partner } from '@/lib/types';


export async function inviteEmployeeAction(data: {
  email?: string;
  phone?: string;
  name: string;
  partnerId: string;
  role?: 'employee' | 'partner_admin';
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

    // Create user in the partner's tenant
    const userResult = await createUserInTenant({
      email: data.email,
      phone: data.phone,
      // Generate a random temporary password. The user will need to reset it.
      password: Math.random().toString(36).slice(-8), 
      tenantId: partnerTenant.tenantId,
      displayName: data.name,
      partnerId: data.partnerId,
      role: data.role || 'employee',
    });

    return userResult;
    
  } catch (error: any) {
    console.error("Error inviting employee:", error);
    return {
      success: false,
      message: "An unexpected error occurred while inviting the employee."
    };
  }
}

export async function getPartnerDetailsAction(partnerId: string): Promise<{ success: boolean; message: string; partner?: Partner, tenantId?: string }> {
    try {
        const result = await getPartnerDetailsByPartnerId(partnerId);
        return result;
    } catch (error: any) {
        console.error("Error in getPartnerDetailsAction:", error);
        return { success: false, message: "Failed to fetch partner details." };
    }
}
