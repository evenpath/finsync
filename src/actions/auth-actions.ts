
// src/actions/auth-actions.ts
'use server';

import { getTenantIdForEmail, validateTenantId, type TenantLookupResult } from '@/services/tenant-service';

/**
 * Server action to get tenant ID for email lookup.
 * This is the proper way to call server functions from client components.
 */
export async function getTenantForEmailAction(email: string): Promise<TenantLookupResult> {
  try {
    return await getTenantIdForEmail(email);
  } catch (error: any) {
    console.error("Error in getTenantForEmailAction:", error);
    return {
      success: false,
      message: "Failed to lookup organization. Please try again."
    };
  }
}

/**
 * Server action to validate a tenant ID exists.
 */
export async function validateTenantAction(tenantId: string): Promise<boolean> {
  try {
    return await validateTenantId(tenantId);
  } catch (error: any) {
    console.error("Error in validateTenantAction:", error);
    return false;
  }
}
