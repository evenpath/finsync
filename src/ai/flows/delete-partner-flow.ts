
'use server';

/**
 * @fileOverview A Genkit flow for deleting a partner and their associated Firebase Auth tenant.
 *
 * - deletePartner - A function that handles deleting a partner record and their tenant.
 * - DeletePartnerInput - The input type for the deletePartner function.
 * - DeletePartnerOutput - The return type for the deletePartner function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminAuth, db } from '@/lib/firebase-admin';

const DeletePartnerInputSchema = z.object({
  partnerId: z.string().describe('The ID of the partner document in Firestore.'),
  tenantId: z.string().describe('The ID of the Firebase Auth tenant associated with the partner.'),
});
export type DeletePartnerInput = z.infer<typeof DeletePartnerInputSchema>;

const DeletePartnerOutputSchema = z.object({
  success: z.boolean().describe('Whether the operation was successful.'),
  message: z.string().describe('A message detailing the result of the operation.'),
});
export type DeletePartnerOutput = z.infer<typeof DeletePartnerOutputSchema>;

export async function deletePartner(input: DeletePartnerInput): Promise<DeletePartnerOutput> {
  return deletePartnerFlow(input);
}

const deletePartnerFlow = ai.defineFlow(
  {
    name: 'deletePartnerFlow',
    inputSchema: DeletePartnerInputSchema,
    outputSchema: DeletePartnerOutputSchema,
  },
  async ({ partnerId, tenantId }) => {
    if (!adminAuth || !db) {
        return {
            success: false,
            message: "Firebase Admin SDK is not initialized. Cannot delete partner.",
        };
    }
    
    if (!partnerId || !tenantId) {
        return { success: false, message: "Partner ID and Tenant ID are required." };
    }

    try {
      // 1. Delete the Partner document from Firestore
      await db.collection('partners').doc(partnerId).delete();
      console.log(`Successfully deleted partner document ${partnerId}`);

      // 2. Delete the Firebase Auth Tenant
      await adminAuth.tenantManager().deleteTenant(tenantId);
      console.log(`Successfully deleted tenant ${tenantId}`);

      // Future improvement: Delete associated users and user mappings.
      // For now, this handles the primary resources.

      return {
        success: true,
        message: 'Successfully deleted partner and their associated tenant.',
      };

    } catch (error: any) {
      console.error(`Error deleting partner ${partnerId} and tenant ${tenantId}:`, error);

      let errorMessage = `Failed to delete partner: ${error.message}`;
      if (error.code === 'auth/tenant-not-found') {
        errorMessage = 'Partner document deleted, but the associated auth tenant was not found. It may have been deleted previously.';
         return {
          success: true, // Partial success
          message: errorMessage,
        };
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Ensure the service account has Identity Platform Admin and Firestore access.';
      }
      
      return { success: false, message: errorMessage };
    }
  }
);
