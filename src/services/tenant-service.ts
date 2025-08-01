
// src/services/tenant-service.ts
'use server';

import { db } from '@/lib/firebase-admin';

export interface TenantLookupResult {
  success: boolean;
  tenantId?: string;
  message?: string;
}

/**
 * Looks up the tenant ID for a given user email by querying Firestore.
 * This replaces the mock getTenantIdForEmail function.
 */
export async function getTenantIdForEmail(email: string): Promise<TenantLookupResult> {
  if (!email) {
    return {
      success: false,
      message: "Email is required"
    };
  }

  if (!db) {
    console.warn("Database not connected, falling back to hardcoded tenant mapping");
    // Fallback to hardcoded mapping when DB is not available
    const emailToTenantMap: { [key: string]: string } = {
      'user@techcorp.com': 'tenant_techcorp_industries',
      'admin@techcorp.com': 'tenant_techcorp_industries',
      'sara@techcorp.com': 'tenant_techcorp_industries',
      'mike@techcorp.com': 'tenant_techcorp_industries',
      'user@sunnyvale.com': 'tenant_sunnyvale_properties',
      'sigiravi2@gmail.com': 'tenant_brew_and_bonbon_cafe',
    };
    
    const lowercasedEmail = email.toLowerCase();
    const tenantId = emailToTenantMap[lowercasedEmail];
    
    if (tenantId) {
      return {
        success: true,
        tenantId,
        message: "Tenant found (mock mode)"
      };
    }
    
    return {
      success: false,
      message: "Your organization could not be found. Please contact support."
    };
  }

  try {
    const lowercasedEmail = email.toLowerCase();
    
    // First, try to find a user mapping document
    const userMappingRef = db.collection('userMappings').doc(lowercasedEmail);
    const userMappingDoc = await userMappingRef.get();
    
    if (userMappingDoc.exists) {
      const data = userMappingDoc.data();
      if (data?.tenantId) {
        return {
          success: true,
          tenantId: data.tenantId,
          message: "Tenant found via user mapping"
        };
      }
    }
    
    // If no user mapping found, try to find the partner by email
    const partnersRef = db.collection('partners');
    const partnerQuery = await partnersRef.where('email', '==', lowercasedEmail).limit(1).get();
    
    if (!partnerQuery.empty) {
      const partnerDoc = partnerQuery.docs[0];
      const partnerData = partnerDoc.data();
      
      if (partnerData.tenantId) {
        // Create a user mapping for future lookups
        await userMappingRef.set({
          email: lowercasedEmail,
          tenantId: partnerData.tenantId,
          partnerId: partnerDoc.id,
          createdAt: new Date(),
        });
        
        return {
          success: true,
          tenantId: partnerData.tenantId,
          message: "Tenant found via partner lookup"
        };
      }
    }
    
    // No tenant found for this email
    return {
      success: false,
      message: "Your organization could not be found. Please contact support."
    };
    
  } catch (error: any) {
    console.error("Error looking up tenant for email:", email, error);
    return {
      success: false,
      message: "Failed to lookup organization. Please try again."
    };
  }
}

/**
 * Creates a user mapping between an email and tenant ID.
 * Used when creating new users within a tenant.
 */
export async function createUserMapping(email: string, tenantId: string, partnerId?: string): Promise<TenantLookupResult> {
  if (!db) {
    console.warn("Database not connected, cannot create user mapping");
    return {
      success: false,
      message: "Database not available"
    };
  }

  try {
    const lowercasedEmail = email.toLowerCase();
    const userMappingRef = db.collection('userMappings').doc(lowercasedEmail);
    
    await userMappingRef.set({
      email: lowercasedEmail,
      tenantId,
      partnerId: partnerId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return {
      success: true,
      tenantId,
      message: "User mapping created successfully"
    };
    
  } catch (error: any) {
    console.error("Error creating user mapping:", error);
    return {
      success: false,
      message: "Failed to create user mapping"
    };
  }
}

/**
 * Validates that a tenant ID exists in Firebase Auth.
 * This helps prevent invalid-tenant-id errors.
 */
export async function validateTenantId(tenantId: string): Promise<boolean> {
  if (!tenantId) return false;
  
  // Import adminAuth locally to avoid circular dependencies
  const { adminAuth } = await import('@/lib/firebase-admin');
  
  if (!adminAuth) {
    console.warn("Admin auth not available, cannot validate tenant");
    return false;
  }

  try {
    await adminAuth.tenantManager().getTenant(tenantId);
    return true;
  } catch (error: any) {
    console.error(`Tenant validation failed for ${tenantId}:`, error.message);
    return false;
  }
}
