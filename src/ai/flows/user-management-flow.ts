'use server';

import { ai } from '../genkit';
import { z } from 'genkit';
import { adminAuth, db } from '../../lib/firebase-admin';
import { createUserMapping, validateTenantId } from '../../services/tenant-service';
import * as admin from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import type { UserWorkspaceLink, TeamMember } from '@/lib/types';

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
    if (!adminAuth || !db) {
      return {
        success: false,
        message: "Firebase Admin SDK is not initialized. Cannot create user.",
      };
    }
    
    if (!input.partnerId) {
        return {
            success: false,
            message: "Partner ID is required to create user."
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
      
      const userToCreate: admin.CreateRequest = {
        password: input.password,
        displayName: input.displayName,
      };

      if (input.email) {
        userToCreate.email = input.email;
        userToCreate.emailVerified = true;
      }
      if (input.phone) {
        userToCreate.phoneNumber = input.phone;
      }

      const userRecord = await tenantAuth.createUser(userToCreate);
      console.log(`Successfully created user in tenant ${input.tenantId} with UID: ${userRecord.uid}`);
      
      // Get partner name
      const partnerDoc = await db.collection('partners').doc(input.partnerId).get();
      const partnerName = partnerDoc.data()?.name || 'Partner Workspace';

      // Step 2: Create the UserWorkspaceLink document - CRITICAL
      const workspaceLinkRef = db.collection('userWorkspaceLinks').doc(`${userRecord.uid}_${input.partnerId}`);
      const workspaceLinkData: UserWorkspaceLink = {
        userId: userRecord.uid,
        partnerId: input.partnerId,
        tenantId: input.tenantId,
        role: input.role,
        status: 'active',
        permissions: [],
        joinedAt: FieldValue.serverTimestamp() as any,
        partnerName: partnerName,
        partnerAvatar: null,
      };
      await workspaceLinkRef.set(workspaceLinkData, { merge: true });
      console.log(`Successfully created userWorkspaceLink for ${userRecord.uid} in partner ${input.partnerId}.`);

      // Step 3: Set custom claims with complete workspace info
      const claims: any = {
        role: input.role,
        partnerId: input.partnerId,
        tenantId: input.tenantId,
        activePartnerId: input.partnerId,
        activeTenantId: input.tenantId,
        partnerIds: [input.partnerId],
        workspaces: [{
            partnerId: input.partnerId,
            tenantId: input.tenantId,
            role: input.role,
            status: 'active',
            partnerName: partnerName,
            permissions: []
        }]
      };
      await tenantAuth.setCustomUserClaims(userRecord.uid, claims);
      console.log(`Successfully set claims for user ${userRecord.uid}:`, claims);

      // Step 4: Create TeamMember document
      const teamMemberRef = db.collection('teamMembers').doc(userRecord.uid);
      const teamMemberData: Partial<TeamMember> = {
        userId: userRecord.uid,
        partnerId: input.partnerId,
        tenantId: input.tenantId,
        name: input.displayName || 'User',
        email: input.email || userRecord.email || '',
        phone: input.phone || '',
        role: input.role,
        status: 'active',
        avatar: `https://placehold.co/40x40.png?text=${(input.displayName || 'U').charAt(0)}`,
        joinedDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        tasksCompleted: 0,
        avgCompletionTime: '-',
        skills: [],
        createdAt: FieldValue.serverTimestamp() as any,
      };
      await teamMemberRef.set(teamMemberData, { merge: true });
      console.log(`Created team member document for ${userRecord.uid}`);

      // Step 5: Create user mappings for login lookup
      if (input.email) {
          const mappingResult = await createUserMapping(input.email, input.tenantId, input.partnerId);
          if (!mappingResult.success) {
              console.warn(`Failed to create email mapping for ${input.email}:`, mappingResult.message);
          } else {
              console.log(`Successfully created email mapping for ${input.email}`);
          }
      }

      if (input.phone) {
          const mappingResult = await createUserMapping(input.phone, input.tenantId, input.partnerId);
          if (!mappingResult.success) {
              console.warn(`Failed to create phone mapping for ${input.phone}:`, mappingResult.message);
          } else {
              console.log(`Successfully created phone mapping for ${input.phone}`);
          }
      }

      return {
        success: true,
        userId: userRecord.uid,
        message: "User created successfully with workspace access."
      };

    } catch (error: any) {
      console.error("Error creating user in tenant:", error);
      return {
        success: false,
        message: `Failed to create user: ${error.message}`
      };
    }
  }
);