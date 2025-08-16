// src/actions/auth-actions.ts
'use server';

import { getPartnerTenantId } from '../services/tenant-service';

export async function getTenantForEmailAction(email: string): Promise<{
  success: boolean;
  message: string;
  tenantId?: string;
}> {
  try {
    // Extract domain from email
    const domain = email.split('@')[1];
    if (!domain) {
      return {
        success: false,
        message: 'Invalid email format'
      };
    }

    // For demo purposes, you might have a domain->partnerId mapping
    // In production, you'd have a proper domain verification system
    const result = await getPartnerTenantId(domain);
    
    return {
      success: result.success,
      message: result.message,
      tenantId: result.tenantId
    };

  } catch (error: any) {
    console.error('Error getting tenant for email:', error);
    return {
      success: false,
      message: 'Failed to verify organization'
    };
  }
}

export async function validateTenantAction(tenantId: string): Promise<{
  success: boolean;
  message: string;
  isValid?: boolean;
}> {
  try {
    // Validate tenant exists and is active
    const result = await getPartnerTenantId(tenantId);
    
    return {
      success: true,
      message: 'Tenant validation complete',
      isValid: result.success
    };

  } catch (error: any) {
    console.error('Error validating tenant:', error);
    return {
      success: false,
      message: 'Failed to validate tenant'
    };
  }
}