// src/actions/partner-actions.ts
'use server';

import { createUserInTenant } from '@/ai/flows/user-management-flow';
import { createEmployeeWithPhone } from '@/services/phone-auth-service';
import { getPartnerTenantId, getPartnerDetailsByPartnerId } from '@/services/tenant-service';
import type { CreateUserInTenantOutput } from '@/ai/flows/user-management-flow';
import type { Partner, TeamMember } from '@/lib/types';
import { db } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export async function inviteEmployeeAction(data: {
  email?: string;
  phone?: string;
  name: string;
  partnerId: string;
  role?: 'employee' | 'partner_admin';
}): Promise<CreateUserInTenantOutput> {
  try {
    // Get the tenant ID associated with this partner
    const partnerTenant = await getPartnerTenantId(data.partnerId);
    
    if (!partnerTenant.success || !partnerTenant.tenantId) {
      return {
        success: false,
        message: "Your organization's workspace could not be found. Please contact support."
      };
    }

    let userResult: CreateUserInTenantOutput;

    // Use phone-based creation if phone number is provided
    if (data.phone) {
      userResult = await createEmployeeWithPhone({
        phoneNumber: data.phone,
        displayName: data.name,
        email: data.email,
        partnerId: data.partnerId,
        tenantId: partnerTenant.tenantId,
        role: data.role || 'employee',
        invitedBy: 'system' // In production, this would be the actual inviter's ID
      });
    } else if (data.email) {
      // Fall back to email-based creation
      userResult = await createUserInTenant({
        email: data.email,
        password: Math.random().toString(36).slice(-8), // Generate random temp password
        tenantId: partnerTenant.tenantId,
        displayName: data.name,
        partnerId: data.partnerId,
        role: data.role || 'employee',
      });
    } else {
      return {
        success: false,
        message: "Either email or phone number must be provided."
      };
    }
    
    if (userResult.success && userResult.userId) {
      if (!db) {
        console.error("Database not initialized, cannot save employee profile.");
        return {
          success: false,
          message: "User account created, but could not save profile. Please contact support."
        };
      }
      
      const employeeData: Omit<TeamMember, 'id'> = {
        userId: userResult.userId,
        partnerId: data.partnerId,
        name: data.name,
        email: data.email || 'N/A',
        phone: data.phone || 'N/A',
        role: data.role || 'employee',
        status: 'active',
        avatar: `https://placehold.co/40x40.png?text=${data.name.charAt(0)}`,
        joinedDate: new Date().toISOString(),
        lastActive: 'Never',
        tasksCompleted: 0,
        avgCompletionTime: '-',
        skills: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      // Save to the root 'teamMembers' collection
      const employeeDocRef = db.collection('teamMembers').doc(userResult.userId);
      await employeeDocRef.set(employeeData);
      console.log(`Saved employee profile for ${data.name} in teamMembers collection`);
    }

    return userResult;
    
  } catch (error: any) {
    console.error("Error inviting employee:", error);
    return {
      success: false,
      message: "An unexpected error occurred while inviting the employee."
    };
  }
}

export async function generateInviteCodeAction(partnerId: string): Promise<{
  success: boolean;
  message: string;
  inviteCode?: string;
}> {
  try {
    const partnerTenant = await getPartnerTenantId(partnerId);
    
    if (!partnerTenant.success || !partnerTenant.tenantId) {
      return {
        success: false,
        message: "Could not generate invite code. Partner not found."
      };
    }

    // Generate simple invite code format: PARTNER_ID-TENANT_ID
    const inviteCode = `${partnerId}-${partnerTenant.tenantId}`;

    return {
      success: true,
      message: "Invite code generated successfully.",
      inviteCode
    };

  } catch (error: any) {
    console.error("Error generating invite code:", error);
    return {
      success: false,
      message: "Failed to generate invite code."
    };
  }
}