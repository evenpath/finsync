
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminAuth } from '@/lib/firebase-admin';

const SetUserClaimsInputSchema = z.object({
  userId: z.string().describe('The Firebase user ID to set claims for.'),
  tenantId: z.string().describe('The tenant ID the user belongs to.'),
  role: z.enum(['partner_admin', 'employee']).describe('The role to assign to the user.'),
  partnerId: z.string().describe('The partner ID to associate with the user.'),
});
export type SetUserClaimsInput = z.infer<typeof SetUserClaimsInputSchema>;

const SetUserClaimsOutputSchema = z.object({
  success: z.boolean().describe('Whether setting claims was successful.'),
  message: z.string().describe('A message detailing the result of the operation.'),
});
export type SetUserClaimsOutput = z.infer<typeof SetUserClaimsOutputSchema>;

export async function setUserClaims(input: SetUserClaimsInput): Promise<SetUserClaimsOutput> {
  return setUserClaimsFlow(input);
}

const setUserClaimsFlow = ai.defineFlow(
  {
    name: 'setUserClaimsFlow',
    inputSchema: SetUserClaimsInputSchema,
    outputSchema: SetUserClaimsOutputSchema,
  },
  async (input) => {
    if (!adminAuth) {
      return {
        success: false,
        message: "Firebase Admin SDK is not initialized.",
      };
    }

    try {
      const tenantAuth = adminAuth.tenantManager().authForTenant(input.tenantId);
      
      await tenantAuth.setCustomUserClaims(input.userId, {
        role: input.role,
        partnerId: input.partnerId,
        tenantId: input.tenantId,
      });

      console.log(`Set custom claims for user ${input.userId}: role=${input.role}, partnerId=${input.partnerId}`);

      return {
        success: true,
        message: `Successfully set claims for user ${input.userId}.`,
      };

    } catch (error: any) {
      console.error("Error setting user claims:", error);
      return {
        success: false,
        message: `Failed to set user claims: ${error.message}`,
      };
    }
  }
);
