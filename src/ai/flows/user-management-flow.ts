
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminAuth } from '@/lib/firebase-admin';
import { createUserMapping, validateTenantId } from '@/services/tenant-service';

const CreateUserInTenantInputSchema = z.object({
  email: z.string().email().optional().describe('The email address of the new user. Required if phone number is not provided.'),
  phone: z.string().optional().describe('The phone number of the new user in E.164 format. Required if email is not provided.'),
  password: z.string().min(6).describe('The password for the new user.'),
  tenantId: z.string().describe('The tenant ID where the user should be created.'),
  displayName: z.string().optional().describe('The display name for the new user.'),
  partnerId: z.string().describe('The partner ID to associate with this user.'),
  role: z.enum(['partner_admin', 'employee']).default('employee').describe('The role for the new user.'),
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
    
    if (!input.partnerId) {
        return {
            success: false,
            message: "Internal Error: Partner ID was not provided to the user creation flow. Cannot create user mapping."
        };
    }

    if (!input.email && !input.phone) {
      return {
        success: false,
        message: "Either an email or a phone number must be provided to create a user."
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

      // Step 1: Create the user within the specified tenant
      const tenantAuth = adminAuth.tenantManager().authForTenant(input.tenantId);
      
      const userToCreate: admin.auth.CreateRequest = {
        password: input.password,
        displayName: input.displayName,
      };

      if (input.email) {
        userToCreate.email = input.email;
        userToCreate.emailVerified = false; // User should verify their email
      }
      if (input.phone) {
        userToCreate.phoneNumber = input.phone;
      }

      const userRecord = await tenantAuth.createUser(userToCreate);
      console.log(`Successfully created user in tenant ${input.tenantId} with UID: ${userRecord.uid}`);

      // Step 2: Set custom claims for the newly created user
      const claims = {
        role: input.role,
        partnerId: input.partnerId,
        tenantId: input.tenantId,
      };
      await tenantAuth.setCustomUserClaims(userRecord.uid, claims);
      console.log(`Successfully set claims for user ${userRecord.uid}:`, claims);

      // Step 3: Create the user mapping for quick tenant lookup during login
      // Mapping is always done by email for now, as phone lookups are not directly supported for tenant resolution.
      const mappingIdentifier = input.email || `${input.phone}@suupe.com`;
      
      const mappingResult = await createUserMapping(
        mappingIdentifier, 
        input.tenantId, 
        input.partnerId
      );

      if (!mappingResult.success) {
          // If mapping fails, it's a critical issue for login.
          // Consider a rollback or cleanup strategy here in a real app.
          console.warn(`CRITICAL: Failed to create user mapping for ${mappingIdentifier}. User will not be able to log in.`, mappingResult.message);
          return {
              success: false,
              message: `User created, but failed to set up login mapping. Please contact support. Error: ${mappingResult.message}`,
          }
      }
      console.log(`Successfully created user mapping for ${mappingIdentifier}`);

      return {
        success: true,
        userId: userRecord.uid,
        message: `Successfully created user ${input.email || input.phone} in tenant ${input.tenantId}.`,
      };

    } catch (error: any) {
      console.error("Error creating user in tenant:", error);
      
      let errorMessage = `Failed to create user: ${error.message}`;
      
      if (error.code === 'auth/email-already-exists') {
        errorMessage = "An account with this email already exists in your organization.";
      } else if (error.code === 'auth/phone-number-already-exists') {
        errorMessage = "An account with this phone number already exists in your organization.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please provide a valid email address.";
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage = "Please provide a valid phone number in E.164 format (e.g., +15551234567).";
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
