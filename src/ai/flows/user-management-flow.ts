
// src/ai/flows/user-management-flow.ts
'use server';

/**
 * @fileOverview A Genkit flow for managing user creation within tenants.
 *
 * - createUserInTenant - A function that creates a user within a specific tenant and sets up mapping.
 * - CreateUserInTenantInput - The input type for the createUserInTenant function.
 * - CreateUserInTenantOutput - The return type for the createUserInTenant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminAuth } from '@/lib/firebase-admin';
import { createUserMapping, validateTenantId } from '@/services/tenant-service';

const CreateUserInTenantInputSchema = z.object({
  email: z.string().email().describe('The email address of the new user.'),
  password: z.string().min(6).describe('The password for the new user.'),
  tenantId: z.string().describe('The tenant ID where the user should be created.'),
  displayName: z.string().optional().describe('The display name for the new user.'),
  partnerId: z.string().optional().describe('The partner ID to associate with this user.'),
});
export type CreateUserInTenantInput = z.infer<typeof CreateUserInTenantInputSchema>;

const CreateUserInTenantOutputSchema = z.object({
  success: z.boolean().describe('Whether the user creation was successful.'),
  userId: z.string().optional().describe('The new user ID if creation was successful.'),
  message: z.string().describe('A message detailing the result of the operation.'),
});
export type CreateUserInTenantOutput = z.infer<typeof CreateUserInTenantOutputSchema>;

export async function createUserInTenant(input: CreateUserInTenantInput): Promise<CreateUserInTenantOutput> {
  return createUserInTenantFlow(input);
}

const createUserInTenantFlow = ai.defineFlow(
  {
    name: 'createUserInTenantFlow',
    inputSchema: CreateUserInTenantInputSchema,
    outputSchema: CreateUserInTenantOutputSchema,
  },
  async (input) => {
    if (!adminAuth) {
      return {
        success: false,
        message: "Firebase Admin SDK is not initialized. Cannot create user. Ensure your service account environment variables are set correctly on the server.",
      };
    }

    try {
      const isValidTenant = await validateTenantId(input.tenantId);
      if (!isValidTenant) {
        return {
          success: false,
          message: `Invalid tenant ID: ${input.tenantId}. Tenant does not exist.`,
        };
      }

      const tenantAuth = adminAuth.tenantManager().authForTenant(input.tenantId);

      const userRecord = await tenantAuth.createUser({
        email: input.email,
        password: input.password,
        displayName: input.displayName,
        emailVerified: false,
      });

      console.log(`Successfully created user ${input.email} in tenant ${input.tenantId} with UID: ${userRecord.uid}`);

      const mappingResult = await createUserMapping(input.email, input.tenantId, input.partnerId);
      if (!mappingResult.success) {
        console.warn(`Failed to create user mapping for ${input.email}:`, mappingResult.message);
      }

      return {
        success: true,
        userId: userRecord.uid,
        message: `Successfully created user ${input.email} in tenant ${input.tenantId}.`,
      };

    } catch (error: any) {
      console.error("Error creating user in tenant:", error);
      
      let errorMessage = `Failed to create user: ${error.message}`;
      
      if (error.code === 'auth/email-already-exists') {
        errorMessage = "An account with this email already exists in your organization.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please provide a valid email address.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters long.";
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
);
