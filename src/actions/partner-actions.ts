// File changes needed to fix Partner Multi-Tenant System

// ============================================================================
// 1. src/actions/partner-actions.ts (modified)
// ============================================================================
'use server';

import { createUserInTenant } from '@/ai/flows/user-management-flow';
import { getTenantIdForEmail, getPartnerTenantId } from '@/services/tenant-service';

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
      // Get the tenant ID associated with this partner
      const partnerTenant = await getPartnerTenantId(data.partnerId);
      
      if (!partnerTenant.success || !partnerTenant.tenantId) {
        return {
          success: false,
          message: "Partner tenant not found. Please contact support."
        };
      }

      // Create user in the partner's tenant
      const userResult = await createUserInTenant({
        email: data.email,
        password: Math.random().toString(36).slice(-8), // Temporary password
        tenantId: partnerTenant.tenantId,
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

export async function getPartnerDetailsAction(partnerId: string) {
  try {
    const partnerTenant = await getPartnerTenantId(partnerId);
    return partnerTenant;
  } catch (error: any) {
    console.error("Error getting partner details:", error);
    return {
      success: false,
      message: "Failed to get partner details."
    };
  }
}
