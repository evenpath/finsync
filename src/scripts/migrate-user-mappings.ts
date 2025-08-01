
// src/scripts/migrate-user-mappings.ts
'use server';

import { db } from '@/lib/firebase-admin';
import { createUserMapping } from '@/services/tenant-service';

/**
 * Migration script to create user mappings for existing partners.
 * This ensures that all existing partner emails can be properly mapped to their tenant IDs.
 */
export async function migrateUserMappings(): Promise<{
  success: boolean;
  message: string;
  migratedCount?: number;
}> {
  if (!db) {
    return {
      success: false,
      message: "Database not connected. Cannot perform migration."
    };
  }

  try {
    console.log("Starting user mapping migration...");
    
    // Get all partners from Firestore
    const partnersSnapshot = await db.collection('partners').get();
    
    if (partnersSnapshot.empty) {
      return {
        success: true,
        message: "No partners found. Migration not needed.",
        migratedCount: 0
      };
    }

    let migratedCount = 0;
    const errors: string[] = [];

    // Process each partner
    for (const partnerDoc of partnersSnapshot.docs) {
      const partnerData = partnerDoc.data();
      const partnerId = partnerDoc.id;
      
      if (partnerData.email && partnerData.tenantId) {
        try {
          const mappingResult = await createUserMapping(
            partnerData.email,
            partnerData.tenantId,
            partnerId
          );
          
          if (mappingResult.success) {
            migratedCount++;
            console.log(`Created user mapping for ${partnerData.email} -> ${partnerData.tenantId}`);
          } else {
            errors.push(`Failed to create mapping for ${partnerData.email}: ${mappingResult.message}`);
          }
        } catch (error: any) {
          errors.push(`Error processing ${partnerData.email}: ${error.message}`);
        }
      } else {
        console.warn(`Partner ${partnerId} missing email or tenantId:`, {
          email: partnerData.email,
          tenantId: partnerData.tenantId
        });
      }
    }

    if (errors.length > 0) {
      console.warn("Migration completed with errors:", errors);
    }

    return {
      success: true,
      message: `Migration completed. Created ${migratedCount} user mappings.${errors.length > 0 ? ` ${errors.length} errors occurred.` : ''}`,
      migratedCount
    };

  } catch (error: any) {
    console.error("Migration failed:", error);
    return {
      success: false,
      message: `Migration failed: ${error.message}`
    };
  }
}

/**
 * Helper function to check if user mappings exist and are working properly.
 */
export async function validateUserMappings(): Promise<{
  success: boolean;
  message: string;
  mappingCount?: number;
}> {
  if (!db) {
    return {
      success: false,
      message: "Database not connected. Cannot validate mappings."
    };
  }

  try {
    const mappingsSnapshot = await db.collection('userMappings').get();
    const mappingCount = mappingsSnapshot.size;
    
    console.log(`Found ${mappingCount} user mappings`);
    
    return {
      success: true,
      message: `Validation complete. Found ${mappingCount} user mappings.`,
      mappingCount
    };
    
  } catch (error: any) {
    console.error("Validation failed:", error);
    return {
      success: false,
      message: `Validation failed: ${error.message}`
    };
  }
}
