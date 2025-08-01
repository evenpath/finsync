'use server';

/**
 * @fileOverview A Genkit flow for creating Firebase Auth tenants for new partners.
 *
 * - createTenant - A function that handles creating a new Firebase Auth tenant.
 * - CreateTenantInput - The input type for the createTenant function.
 * - CreateTenantOutput - The return type for the createTenant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminAuth } from '@/lib/firebase-admin';

const CreateTenantInputSchema = z.object({
  partnerName: z.string().describe('The name of the partner organization for which to create a tenant.'),
});
export type CreateTenantInput = z.infer<typeof CreateTenantInputSchema>;

const CreateTenantOutputSchema = z.object({
  success: z.boolean().describe('Whether the tenant creation was successful.'),
  tenantId: z.string().optional().describe('The new tenant ID if creation was successful.'),
  message: z.string().describe('A message detailing the result of the operation.'),
});
export type CreateTenantOutput = z.infer<typeof CreateTenantOutputSchema>;

export async function createTenant(input: CreateTenantInput): Promise<CreateTenantOutput> {
  return createTenantFlow(input);
}

const createTenantFlow = ai.defineFlow(
  {
    name: 'createTenantFlow',
    inputSchema: CreateTenantInputSchema,
    outputSchema: CreateTenantOutputSchema,
  },
  async (input) => {
    if (!adminAuth) {
        return {
            success: false,
            message: "Firebase Admin SDK is not initialized. Cannot create tenant.",
        };
    }

    try {
      const tenant = await adminAuth.tenantManager().createTenant({
        displayName: input.partnerName,
        emailSignInConfig: {
          enabled: true,
          passwordRequired: true, 
        },
      });

      console.log(`Successfully created tenant for ${input.partnerName} with ID: ${tenant.tenantId}`);

      return {
        success: true,
        tenantId: tenant.tenantId,
        message: `Successfully created tenant for ${input.partnerName}.`,
      };
    } catch (error: any) {
        console.error("Error creating Firebase Auth tenant:", error);
        return {
            success: false,
            message: `Failed to create tenant: ${error.message}`,
        };
    }
  }
);
