
'use server';

/**
 * @fileOverview A Genkit flow for creating Firebase Auth tenants and partner documents.
 *
 * - createTenant - A function that handles creating a new Firebase Auth tenant and a partner record in Firestore.
 * - CreateTenantInput - The input type for the createTenant function.
 * - CreateTenantOutput - The return type for the createTenant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminAuth, db } from '@/lib/firebase-admin';
import type { Partner } from '@/lib/types';
import * as admin from 'firebase-admin';
import { createUserInTenant } from './user-management-flow';

const CreateTenantInputSchema = z.object({
  partnerName: z.string().describe('The name of the partner organization.'),
  email: z.string().email().describe("The primary admin's email for the partner."),
  password: z.string().min(6).describe('The password for the new admin user.'),
});
export type CreateTenantInput = z.infer<typeof CreateTenantInputSchema>;

const CreateTenantOutputSchema = z.object({
  success: z.boolean().describe('Whether the operation was successful.'),
  tenantId: z.string().optional().describe('The new tenant ID if creation was successful.'),
  partnerId: z.string().optional().describe('The new partner document ID if creation was successful.'),
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
    if (!adminAuth || !db) {
        return {
            success: false,
            message: "Firebase Admin SDK is not initialized. Cannot create partner. Ensure your service account environment variables are set correctly on the server.",
        };
    }

    try {
      // 1. Sanitize the partner name for tenant display name
      const sanitizedName = input.partnerName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 20);
        
      let finalDisplayName = sanitizedName;
      if (!/^[a-z]/.test(finalDisplayName)) {
          finalDisplayName = 't-' + finalDisplayName.substring(0, 18);
      }
      if (finalDisplayName.length < 4) {
          finalDisplayName = (finalDisplayName + '-1234').substring(0, 20);
      }

      // 2. Create the Firebase Auth Tenant
      const tenant = await adminAuth.tenantManager().createTenant({
        displayName: finalDisplayName,
        emailSignInConfig: {
          enabled: true,
          passwordRequired: true, 
        },
      });
      console.log(`Successfully created tenant for ${input.partnerName} with ID: ${tenant.tenantId}`);

      // 3. Create the Partner document in Firestore
      const newPartner: Omit<Partner, 'id'> = {
          tenantId: tenant.tenantId,
          name: input.partnerName,
          businessName: input.partnerName,
          contactPerson: input.partnerName,
          email: input.email,
          phone: '',
          status: 'pending',
          plan: 'Starter',
          joinedDate: new Date().toISOString(),
          industry: null,
          businessSize: 'small',
          employeeCount: 1,
          monthlyRevenue: '0',
          location: { city: '', state: '' },
          aiProfileCompleteness: 0,
          stats: {
              activeWorkflows: 0,
              totalExecutions: 0,
              successRate: 0,
              avgROI: 0,
              timeSaved: '0 hours/month',
          },
          businessProfile: null,
          aiMemory: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      const docRef = await db.collection("partners").add(newPartner);
      console.log("Partner document created with ID:", docRef.id);
      
      // 4. Create the partner's admin user within the new tenant
      const userResult = await createUserInTenant({
          email: input.email,
          password: input.password,
          tenantId: tenant.tenantId,
          displayName: input.partnerName,
          partnerId: docRef.id, // Associate user with the new partner document ID
          role: 'partner_admin',
      });

      if (!userResult.success) {
          // This is a partial success, the tenant and partner exist, but user creation failed.
          // In a real production app, you might want to roll back the previous steps.
          console.warn(`Partner created, but user creation failed: ${userResult.message}`);
          throw new Error(userResult.message);
      } else {
          console.log(`Admin user ${input.email} created successfully for partner ${docRef.id}`);
      }

      return {
        success: true,
        tenantId: tenant.tenantId,
        partnerId: docRef.id,
        message: `Successfully created partner ${input.partnerName} and admin user.`,
      };

    } catch (error: any) {
        console.error("Error in createTenantFlow:", error);

        if (error.code === 'PERMISSION_DENIED' || (error.message && error.message.includes('permission'))) {
             if (error.message && error.message.includes('serviceusage.services.use')) {
                 return {
                    success: false,
                    message: `Permission Denied: Your service account needs the 'Service Usage Consumer' role. Please add this in the Google Cloud IAM console for project '${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}'.`,
                };
             }
            return {
                success: false,
                message: `Permission Denied. Please check your service account permissions in the Google Cloud IAM console.`,
            };
        }

        if (error.message && error.message.includes('multi-tenancy')) {
            return {
                success: false,
                message: "Firebase Multi-Tenancy is not enabled for this project. Please go to your Google Cloud Console, find 'Identity Platform', and enable it."
            };
        }

        return {
            success: false,
            message: `Failed to create partner: ${error.message}`,
        };
    }
  }
);
