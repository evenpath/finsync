
// src/services/tenant-service.ts
'use server';

import { db, adminAuth } from '@/lib/firebase-admin';

export interface TenantLookupResult {
  success: boolean;
  tenantId?: string;
  partnerId?: string;
  message?: string;
}

/**
 * Looks up the tenant ID for a given user email by querying Firestore.
 */
export async function getTenantIdForEmail(email: string): Promise<TenantLookupResult> {
  if (!email) {
    return {
      success: false,
      message: "Email is required"
    };
  }

  if (!db) {
    return {
      success: false,
      message: "Database not connected. Cannot perform lookup."
    };
  }

  try {
    const lowercasedEmail = email.toLowerCase();
    
    const userMappingRef = db.collection('userMappings').doc(lowercasedEmail);
    const userMappingDoc = await userMappingRef.get();
    
    if (userMappingDoc.exists) {
      const data = userMappingDoc.data();
      if (data?.tenantId) {
        return {
          success: true,
          tenantId: data.tenantId,
          partnerId: data.partnerId,
          message: "Tenant found via user mapping"
        };
      }
    }
    
    // Fallback for migration: check partners collection if mapping doesn't exist
    const partnersRef = db.collection('partners');
    const partnerQuery = await partnersRef.where('email', '==', lowercasedEmail).limit(1).get();
    
    if (!partnerQuery.empty) {
      const partnerDoc = partnerQuery.docs[0];
      const partnerData = partnerDoc.data();
      
      if (partnerData.tenantId) {
        // Create the mapping for next time
        await userMappingRef.set({
          email: lowercasedEmail,
          tenantId: partnerData.tenantId,
          partnerId: partnerDoc.id,
          createdAt: new Date(),
        });
        
        return {
          success: true,
          tenantId: partnerData.tenantId,
          partnerId: partnerDoc.id,
          message: "Tenant found via partner lookup and mapping created"
        };
      }
    }
    
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
 */
export async function createUserMapping(email: string, tenantId: string, partnerId?: string): Promise<TenantLookupResult> {
  if (!db) {
    return {
      success: false,
      message: "Database not available"
    };
  }

  try {
    const lowercasedEmail = email.toLowerCase();
    const userMappingRef = db.collection('userMappings').doc(lowercasedEmail);
    
    const doc = await userMappingRef.get();
    if(doc.exists) {
        return {
            success: false,
            message: `Mapping for ${email} already exists.`
        };
    }

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
 */
export async function validateTenantId(tenantId: string): Promise<boolean> {
  if (!tenantId) return false;
    
  if (!adminAuth) {
    console.warn("Admin auth not available, cannot validate tenant");
    return false;
  }

  try {
    await adminAuth.tenantManager().getTenant(tenantId);
    return true;
  } catch (error: any) {
    if ((error as any).code === 'auth/tenant-not-found') {
      console.warn(`Tenant validation failed for ${tenantId}: Tenant does not exist.`);
    } else {
      console.error(`Tenant validation failed for ${tenantId}:`, error);
    }
    return false;
  }
}
