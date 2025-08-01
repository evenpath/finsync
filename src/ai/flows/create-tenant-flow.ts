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
            message: "Firebase Admin SDK is not initialized. Cannot create tenant. Ensure your service account environment variables are set correctly on the server.",
        };
    }

    try {
      // Sanitize the partner name to create a valid tenant displayName.
      // Rules: starts with a letter, only letters, digits, hyphens, 4-20 chars.
      const sanitizedName = input.partnerName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove invalid characters
        .replace(/\s+/g, '-')       // Replace spaces with hyphens
        .substring(0, 20);          // Truncate to 20 characters
        
      // Ensure it starts with a letter
      let finalDisplayName = sanitizedName;
      if (!/^[a-z]/.test(finalDisplayName)) {
          finalDisplayName = 't-' + finalDisplayName.substring(0, 18);
      }
      
      // Ensure it meets minimum length
      if (finalDisplayName.length < 4) {
          finalDisplayName = (finalDisplayName + '-1234').substring(0, 20);
      }


      const tenant = await adminAuth.tenantManager().createTenant({
        displayName: finalDisplayName,
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

        if (error.code === 'PERMISSION_DENIED' || (error.message && error.message.includes('permission'))) {
            return {
                success: false,
                message: `Permission Denied. Please grant the 'Service Usage Consumer' role to your service account in the Google Cloud IAM console for project '${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}'. This is required to create auth tenants.`,
            };
        }

        return {
            success: false,
            message: `Failed to create tenant: ${error.message}`,
        };
    }
  }
);
