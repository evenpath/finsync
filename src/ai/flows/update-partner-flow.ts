'use server';
/**
 * @fileOverview A Genkit flow for updating a partner document in Firestore.
 *
 * - updatePartner - A function that handles updating a partner.
 * - UpdatePartnerInput - The input type for the updatePartner function.
 * - UpdatePartnerOutput - The return type for the updatePartner function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase-admin';
import type { Partner } from '../../lib/types';
import * as admin from 'firebase-admin';

// We use a string for the schema because Zod doesn't handle complex nested objects like Partner well.
// The validation will happen within the flow itself.
const UpdatePartnerInputSchema = z.string().describe('A JSON string representing the Partner object to update.');
export type UpdatePartnerInput = string;

const UpdatePartnerOutputSchema = z.object({
  success: z.boolean().describe('Whether the partner update was successful.'),
  message: z.string().describe('A message detailing the result of the operation.'),
});
export type UpdatePartnerOutput = z.infer<typeof UpdatePartnerOutputSchema>;

export async function updatePartner(input: UpdatePartnerInput): Promise<UpdatePartnerOutput> {
  return updatePartnerFlow(input);
}

const updatePartnerFlow = ai.defineFlow(
  {
    name: 'updatePartnerFlow',
    inputSchema: UpdatePartnerInputSchema,
    outputSchema: UpdatePartnerOutputSchema,
  },
  async (partnerJson) => {
    if (!db) {
        return {
            success: false,
            message: "Database not connected. Cannot update partner.",
        };
    }

    try {
        const partnerData: Partner = JSON.parse(partnerJson);
        
        if (!partnerData.id) {
            return { success: false, message: "Partner ID is required for an update." };
        }
        
        const partnerRef = db.collection('partners').doc(partnerData.id);

        const { id, ...dataToUpdate } = partnerData;

        // Ensure server timestamp is used for updates
        const updatePayload = {
            ...dataToUpdate,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await partnerRef.set(updatePayload, { merge: true });
        
        console.log(`Successfully updated partner ${id}`);

        return {
            success: true,
            message: `Successfully updated partner ${partnerData.name}.`,
        };
    } catch (error: any) {
        console.error("Error updating partner:", error);
        return {
            success: false,
            message: `Failed to update partner: ${error.message}`,
        };
    }
  }
);
