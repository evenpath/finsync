
// src/actions/partner-actions.ts
'use server';

import { createUserInTenant } from '@/ai/flows/user-management-flow';
import { getPartnerTenantId, getPartnerDetailsByPartnerId } from '@/services/tenant-service';
import type { CreateUserInTenantOutput } from '@/ai/flows/user-management-flow';
import type { Partner, TeamMember } from '@/lib/types';
import { db } from '@/lib/firebase-admin';


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

    // Create user in the partner's tenant
    const userResult = await createUserInTenant({
      email: data.email,
      phone: data.phone,
      // Generate a random temporary password. The user will need to reset it.
      password: Math.random().toString(36).slice(-8), 
      tenantId: partnerTenant.tenantId,
      displayName: data.name,
      partnerId: data.partnerId,
      role: data.role || 'employee',
    });
    
    // If user creation is successful, save their profile to the partner's employee subcollection
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
            email: data.email || data.phone || 'N/A', // Store phone if email is not available
            role: data.role || 'employee',
            status: 'invited',
            avatar: `https://placehold.co/40x40.png?text=${data.name.charAt(0)}`,
            joinedDate: new Date().toISOString(),
            lastActive: 'Never',
            tasksCompleted: 0,
            avgCompletionTime: '-',
            skills: [],
        };
        
        const employeeDocRef = db.collection('partners').doc(data.partnerId).collection('employees').doc(userResult.userId);
        await employeeDocRef.set(employeeData);
        console.log(`Saved employee profile for ${data.name} under partner ${data.partnerId}`);
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

export async function getPartnerDetailsAction(partnerId: string): Promise<{ success: boolean; message: string; partner?: Partner, tenantId?: string }> {
    try {
        const result = await getPartnerDetailsByPartnerId(partnerId);
        return result;
    } catch (error: any) {
        console.error("Error in getPartnerDetailsAction:", error);
        return { success: false, message: "Failed to fetch partner details." };
    }
}
