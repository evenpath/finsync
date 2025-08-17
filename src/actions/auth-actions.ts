// src/actions/auth-actions.ts
'use server';

import { getTenantIdForEmail } from '../services/tenant-service';

export async function getTenantForEmailAction(email: string): Promise<{
  success: boolean;
  message: string;
  tenantId?: string;
}> {
  try {
    if (!email) {
      return {
        success: false,
        message: 'Email address is required.'
      };
    }

    // Use the correct service function to look up the tenant by the user's full email.
    const result = await getTenantIdForEmail(email);
    
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
    // This function is not used in the current flow, but keeping it for potential future use.
    // A direct tenant validation might be better here instead of partner lookup.
    const { validateTenantId } = await import('../services/tenant-service');
    const isValid = await validateTenantId(tenantId);
    
    return {
      success: true,
      message: 'Tenant validation complete',
      isValid: isValid
    };

  } catch (error: any) {
    console.error('Error validating tenant:', error);
    return {
      success: false,
      message: 'Failed to validate tenant'
    };
  }
}
