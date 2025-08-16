
'use server';

/**
 * @fileOverview A Genkit flow for managing admin user roles and permissions.
 *
 * - manageAdminUser - A function that handles setting custom claims for an admin user.
 * - ManageAdminUserInput - The input type for the manageAdminUser function.
 * - ManageAdminUserOutput - The return type for the manageAdminUser function.
 */

import { ai } from '../genkit';
import { z } from 'genkit';
import { adminAuth, db } from '../../lib/firebase-admin';

const ManageAdminUserInputSchema = z.object({
  uid: z.string().optional().describe('The UID of the user to manage. Can be omitted for new users.'),
  email: z.string().email().describe('The email of the user.'),
  name: z.string().describe('The name of the user.'),
  role: z.enum(['Admin', 'Super Admin']).describe("The role to assign to the user."),
});
export type ManageAdminUserInput = z.infer<typeof ManageAdminUserInputSchema>;

const ManageAdminUserOutputSchema = z.object({
  success: z.boolean().describe('Whether the operation was successful.'),
  message: z.string().describe('A message detailing the result of the operation.'),
  userId: z.string().optional().describe('The UID of the created/managed user.'),
});
export type ManageAdminUserOutput = z.infer<typeof ManageAdminUserOutputSchema>;

export async function manageAdminUser(input: ManageAdminUserInput): Promise<ManageAdminUserOutput> {
  return manageAdminUserFlow(input);
}

const manageAdminUserFlow = ai.defineFlow(
  {
    name: 'manageAdminUserFlow',
    inputSchema: ManageAdminUserInputSchema,
    outputSchema: ManageAdminUserOutputSchema,
  },
  async (input) => {
    if (!adminAuth || !db) {
        return {
            success: false,
            message: "Firebase Admin SDK is not initialized. Cannot manage admin user.",
        };
    }

    try {
        let userRecord;
        let isNewUser = false;
        
        // Check if user exists, if not create one
        try {
            userRecord = await adminAuth.getUserByEmail(input.email);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                // For this example, we'll create a user without a password. 
                // They would need to use a "forgot password" flow to set one.
                userRecord = await adminAuth.createUser({
                    email: input.email,
                    displayName: input.name,
                    emailVerified: true, // Assuming an admin invites a trusted user
                });
                isNewUser = true;
                console.log(`Created new admin user: ${userRecord.uid}`);
            } else {
                throw error;
            }
        }

        // Set custom claims
        await adminAuth.setCustomUserClaims(userRecord.uid, { role: input.role });
        console.log(`Set custom claims for ${input.email}: { role: '${input.role}' }`);
        
        // Save/Update user info in a separate 'adminUsers' collection for easy querying in the UI
        const adminDocRef = db.collection('adminUsers').doc(userRecord.uid);
        await adminDocRef.set({
            name: input.name,
            email: input.email,
            role: input.role,
            status: isNewUser ? 'invited' : 'active',
            uid: userRecord.uid,
            id: userRecord.uid,
            lastActive: 'Never',
            joinedDate: new Date().toISOString(),
            permissions: input.role === 'Super Admin' ? ['all'] : ['read', 'write'],
            avatar: `https://placehold.co/40x40.png?text=${input.name.charAt(0)}`
        }, { merge: true });

        return { 
            success: true, 
            message: `Successfully ${isNewUser ? 'invited' : 'updated'} admin user ${input.name}.`,
            userId: userRecord.uid
        };

    } catch (error: any) {
      console.error("Error managing admin user:", error);
      return { success: false, message: `Failed to manage admin user: ${error.message}` };
    }
  }
);
